import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    // ユーザーのサブスクリプション情報を取得
    const subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
    });

    if (!subscription?.stripeSubscriptionId) {
      return NextResponse.json(
        { error: 'アクティブなサブスクリプションが見つかりません' },
        { status: 404 },
      );
    }

    try {
      // Stripeのサブスクリプションを取得して状態を確認
      const stripeSubscription = (await stripe.subscriptions.retrieve(
        subscription.stripeSubscriptionId,
      )) as Stripe.Subscription;

      if (stripeSubscription.status === 'canceled') {
        return NextResponse.json(
          { error: 'サブスクリプションはすでにキャンセルされています' },
          { status: 400 },
        );
      }

      // サブスクリプションをキャンセル
      const updatedStripeSubscription = (await stripe.subscriptions.update(
        subscription.stripeSubscriptionId,
        {
          cancel_at_period_end: true,
        },
      )) as Stripe.Subscription;

      // データベースのサブスクリプション情報を更新
      const updatedSubscription = await prisma.subscription.update({
        where: { userId: session.user.id },
        data: {
          status: 'CANCELED',
          cancelAtPeriodEnd: true,
          stripeCurrentPeriodEnd: new Date(
            (updatedStripeSubscription as any).current_period_end * 1000,
          ),
        },
      });

      return NextResponse.json({
        message: 'サブスクリプションをキャンセルしました',
        currentPeriodEnd: updatedSubscription.stripeCurrentPeriodEnd,
      });
    } catch (stripeError) {
      console.error('Stripe API error:', stripeError);
      if (stripeError instanceof Stripe.errors.StripeError) {
        return NextResponse.json(
          { error: `Stripeエラー: ${stripeError.message}` },
          { status: 500 },
        );
      }
      return NextResponse.json(
        { error: 'Stripeでの処理に失敗しました' },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error('Subscription cancellation error:', error);
    return NextResponse.json(
      { error: 'サブスクリプションのキャンセルに失敗しました' },
      { status: 500 },
    );
  }
}
