import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';

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

    // Stripeのサブスクリプションをキャンセル
    const stripeSubscription = await stripe.subscriptions.update(
      subscription.stripeSubscriptionId,
      {
        cancel_at_period_end: true,
      },
    );

    // データベースのサブスクリプション情報を更新
    const updatedSubscription = await prisma.subscription.update({
      where: { userId: session.user.id },
      data: {
        status: 'CANCELED',
        cancelAtPeriodEnd: true,
        stripeCurrentPeriodEnd: new Date(
          (stripeSubscription as any).current_period_end * 1000,
        ),
      },
    });

    return NextResponse.json({
      message: 'サブスクリプションをキャンセルしました',
      currentPeriodEnd: updatedSubscription.stripeCurrentPeriodEnd,
    });
  } catch (error) {
    console.error('Subscription cancellation error:', error);
    return NextResponse.json(
      { error: 'サブスクリプションのキャンセルに失敗しました' },
      { status: 500 },
    );
  }
}
