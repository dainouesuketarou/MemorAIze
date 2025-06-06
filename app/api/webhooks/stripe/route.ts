import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { SubscriptionStatus, SubscriptionPlan } from '@prisma/client';
import type Stripe from 'stripe';

// 動的レンダリングを明示的に指定
export const dynamic = 'force-dynamic';

// Stripeの型定義を拡張
interface StripeSubscription extends Stripe.Subscription {
  current_period_end: number;
  cancel_at_period_end: boolean;
}

interface StripeInvoice extends Stripe.Invoice {
  subscription: string;
}

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get('Stripe-Signature') as string;

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return new NextResponse('Webhook signature verification failed', {
      status: 400,
    });
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as StripeSubscription;
        const status: SubscriptionStatus =
          subscription.status === 'active'
            ? 'ACTIVE'
            : subscription.status === 'canceled'
            ? 'CANCELED'
            : subscription.status === 'past_due'
            ? 'PAST_DUE'
            : subscription.status === 'unpaid'
            ? 'UNPAID'
            : 'TRIALING';

        // サブスクリプションのプランを特定
        const priceId = subscription.items.data[0].price.id;
        let plan: SubscriptionPlan = 'FREE';
        if (priceId === process.env.STRIPE_PRO_PRICE_ID) {
          plan = 'PRO_MONTHLY';
        } else if (priceId === process.env.STRIPE_PRO_YEARLY_PRICE_ID) {
          plan = 'PRO_YEARLY';
        }

        // データベースを更新
        const updatedSubscription = await prisma.subscription.update({
          where: {
            stripeSubscriptionId: subscription.id,
          },
          data: {
            status,
            plan,
            stripeCurrentPeriodEnd: new Date(
              subscription.current_period_end * 1000,
            ),
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
          },
          include: {
            user: true,
          },
        });

        // ユーザーIDを取得
        const userId = updatedSubscription.userId;

        // クライアントに通知するためのイベントを発行
        // 注: 実際の実装では、WebSocketやServer-Sent Eventsを使用することを推奨
        console.log(`Subscription updated for user ${userId}:`, {
          status,
          plan,
          currentPeriodEnd: subscription.current_period_end,
        });

        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as StripeSubscription;

        // データベースを更新
        const updatedSubscription = await prisma.subscription.update({
          where: {
            stripeSubscriptionId: subscription.id,
          },
          data: {
            status: 'CANCELED',
            plan: 'FREE',
            cancelAtPeriodEnd: true,
          },
          include: {
            user: true,
          },
        });

        // ユーザーIDを取得
        const userId = updatedSubscription.userId;

        // クライアントに通知
        console.log(`Subscription deleted for user ${userId}`);

        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as StripeInvoice;
        if (invoice.subscription) {
          const subscription = (await stripe.subscriptions.retrieve(
            invoice.subscription,
          )) as unknown as StripeSubscription;

          // データベースを更新
          const updatedSubscription = await prisma.subscription.update({
            where: {
              stripeSubscriptionId: subscription.id,
            },
            data: {
              status: 'ACTIVE',
              stripeCurrentPeriodEnd: new Date(
                subscription.current_period_end * 1000,
              ),
            },
            include: {
              user: true,
            },
          });

          // ユーザーIDを取得
          const userId = updatedSubscription.userId;

          // クライアントに通知
          console.log(`Payment succeeded for user ${userId}`);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as StripeInvoice;
        if (invoice.subscription) {
          // データベースを更新
          const updatedSubscription = await prisma.subscription.update({
            where: {
              stripeSubscriptionId: invoice.subscription,
            },
            data: {
              status: 'PAST_DUE',
            },
            include: {
              user: true,
            },
          });

          // ユーザーIDを取得
          const userId = updatedSubscription.userId;

          // クライアントに通知
          console.log(`Payment failed for user ${userId}`);
        }
        break;
      }
    }

    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error);
    return new NextResponse('Webhook handler failed', { status: 500 });
  }
}
