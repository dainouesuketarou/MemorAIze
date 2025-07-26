import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { stripe } from '@/src/lib/stripe';
// prismaはここでは直接使用しない
// import { prisma } from '@/lib/prisma';
// SubscriptionStatus, SubscriptionPlan はここでは直接使用しない
// import { SubscriptionStatus, SubscriptionPlan } from '@prisma/client';
import Stripe from 'stripe';
import { STRIPE_PRICE_IDS } from '@/src/lib/stripe'; // 必要に応じてプラン特定に利用

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { paymentIntent, paymentIntentClientSecret, redirectStatus } =
      await req.json();

    if (!paymentIntent || !paymentIntentClientSecret) {
      return new NextResponse('Invalid payment intent', { status: 400 });
    }

    const intent = await stripe.paymentIntents.retrieve(paymentIntent);
    if (intent.client_secret !== paymentIntentClientSecret) {
      return new NextResponse('Invalid client secret', { status: 400 });
    }

    if (!intent.metadata.subscriptionId) {
      console.error(
        'Subscription ID missing from PaymentIntent metadata:',
        intent,
      );
      return new NextResponse(
        'Subscription ID missing from PaymentIntent metadata',
        { status: 400 },
      );
    }

    const subscriptionResponse = (await stripe.subscriptions.retrieve(
      intent.metadata.subscriptionId as string,
    )) as Stripe.Subscription;

    // PaymentIntentのステータスとStripeサブスクリプションのステータスをチェック
    // Webhookがデータベースを更新するはずなので、ここではクライアントに現在の状況を伝える
    if (intent.status === 'succeeded' || redirectStatus === 'succeeded') {
      // Stripeサブスクリプションのステータスに基づいてplanを決定
      const priceId = subscriptionResponse.items.data[0]?.price?.id;
      let planType: string = 'FREE'; // デフォルト値
      if (priceId === STRIPE_PRICE_IDS.PRO_MONTHLY) {
        planType = 'PRO_MONTHLY';
      } else if (priceId === STRIPE_PRICE_IDS.PRO_YEARLY) {
        planType = 'PRO_YEARLY';
      } else if (priceId === STRIPE_PRICE_IDS.FREE) {
        planType = 'FREE';
      }

      return NextResponse.json({
        status: 'success',
        subscription: {
          stripePriceId: priceId,
          stripeSubscriptionId: subscriptionResponse.id,
          plan: planType,
          stripeCurrentPeriodEnd: (subscriptionResponse as any)
            .current_period_end, // Unix timestamp
        },
      });
    } else {
      // 支払い失敗や未完了の場合
      return NextResponse.json(
        {
          status: 'failed',
          message: 'Payment not successful or pending verification.',
          subscription: {
            stripePriceId: subscriptionResponse.items.data[0]?.price?.id,
            stripeSubscriptionId: subscriptionResponse.id,
          },
        },
        { status: 400 },
      );
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Internal Server Error';
    return new NextResponse(errorMessage, { status: 500 });
  }
}
