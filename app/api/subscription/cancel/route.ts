import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { SubscriptionStatus } from '@prisma/client';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    console.log('Session:', session);

    if (!session?.user?.id) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    // データベースのサブスクリプション情報を取得
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: session.user.id,
      },
    });
    console.log('Database subscription:', subscription);

    if (!subscription) {
      return NextResponse.json(
        { error: 'サブスクリプションが見つかりません' },
        { status: 404 },
      );
    }

    if (!subscription.stripeSubscriptionId) {
      return NextResponse.json(
        { error: 'StripeサブスクリプションIDが見つかりません' },
        { status: 400 },
      );
    }

    // Stripeのサブスクリプション情報を取得
    const stripeSubscription = (await stripe.subscriptions.retrieve(
      subscription.stripeSubscriptionId,
    )) as any;
    console.log('Stripe subscription status:', stripeSubscription.status);
    console.log('Stripe subscription details:', {
      id: stripeSubscription.id,
      status: stripeSubscription.status,
      cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
      currentPeriodEnd: stripeSubscription.current_period_end,
    });

    // データベースとStripeの状態を同期
    if (subscription.status !== stripeSubscription.status.toUpperCase()) {
      console.log('Syncing subscription status...');

      // StripeのステータスをPrismaのステータスに変換
      let prismaStatus: SubscriptionStatus;
      switch (stripeSubscription.status) {
        case 'incomplete_expired':
        case 'canceled':
          prismaStatus = 'CANCELED';
          break;
        case 'active':
          prismaStatus = 'ACTIVE';
          break;
        case 'past_due':
          prismaStatus = 'PAST_DUE';
          break;
        case 'trialing':
          prismaStatus = 'TRIALING';
          break;
        default:
          prismaStatus = 'CANCELED';
      }

      const updateData: any = {
        status: prismaStatus,
        cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
      };

      // current_period_endが存在する場合のみ更新
      if (stripeSubscription.current_period_end) {
        updateData.stripeCurrentPeriodEnd = new Date(
          stripeSubscription.current_period_end * 1000,
        );
      }

      await prisma.subscription.update({
        where: {
          id: subscription.id,
        },
        data: updateData,
      });
      console.log('Subscription status synced');
    }

    // キャンセル済みの場合は早期リターン
    if (
      stripeSubscription.status === 'canceled' ||
      stripeSubscription.status === 'incomplete_expired'
    ) {
      return NextResponse.json(
        { error: 'サブスクリプションはすでにキャンセルされています' },
        { status: 400 },
      );
    }

    // アクティブなサブスクリプションをキャンセル
    if (
      ['active', 'trialing', 'past_due'].includes(stripeSubscription.status)
    ) {
      try {
        // 即時キャンセル
        const canceledSubscription = await stripe.subscriptions.cancel(
          subscription.stripeSubscriptionId,
        );
        console.log('Successfully canceled Stripe subscription');

        const currentPeriodEnd = new Date(
          stripeSubscription.current_period_end * 1000,
        );

        // データベースのサブスクリプション情報を更新
        await prisma.subscription.update({
          where: {
            id: subscription.id,
          },
          data: {
            status: 'CANCELED',
            cancelAtPeriodEnd: true,
            stripeCurrentPeriodEnd: currentPeriodEnd,
          },
        });
        console.log('Successfully updated database');

        // 現在の月のAI生成制限をリセット
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        await prisma.aiGenerationLimit.upsert({
          where: {
            userId_month: {
              userId: session.user.id,
              month: startOfMonth,
            },
          },
          update: {
            count: 0,
          },
          create: {
            userId: session.user.id,
            month: startOfMonth,
            count: 0,
          },
        });
        console.log('AI generation limit reset');

        return NextResponse.json({
          success: true,
          message:
            canceledSubscription.cancellation_details?.comment ||
            'サブスクリプションのキャンセルが完了しました',
          currentPeriodEnd,
        });
      } catch (error) {
        console.error('Error in cancellation process:', error);
        throw error;
      }
    }

    return NextResponse.json(
      {
        error: `現在のサブスクリプションステータス（${stripeSubscription.status}）ではキャンセルできません`,
      },
      { status: 400 },
    );
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    return NextResponse.json(
      { error: 'サブスクリプションのキャンセル中にエラーが発生しました' },
      { status: 500 },
    );
  }
}
