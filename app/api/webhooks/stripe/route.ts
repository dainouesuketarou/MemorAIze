import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { SubscriptionStatus, SubscriptionPlan } from '@prisma/client';
import type Stripe from 'stripe';
import { STRIPE_PRICE_IDS } from '@/lib/stripe'; // STRIPE_PRICE_IDSをインポート
import { toZonedTime } from 'date-fns-tz';

// 動的レンダリングを明示的に指定
export const dynamic = 'force-dynamic';

// Stripeの型定義を拡張 (StripeTypeから直接取得できる場合もあるが、明示的に定義)
// Webhookで受け取る Subscription オブジェクトの典型的な構造に合わせる
interface StripeSubscriptionWithMetadata extends Stripe.Subscription {
  current_period_end: number;
  cancel_at_period_end: boolean;
  metadata: {
    userId?: string; // Webhookで使うuserId
  };
}

interface StripeInvoiceWithMetadata extends Stripe.Invoice {
  subscription: string | null; // subscription IDはnullの可能性もある
  metadata: {
    userId?: string;
    subscriptionId?: string; // PaymentIntentから引き継がれる可能性
  };
}

interface StripePaymentIntentWithMetadata extends Stripe.PaymentIntent {
  metadata: {
    userId?: string;
    subscriptionId?: string;
    invoiceId?: string;
  };
}

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get('Stripe-Signature') as string;

  let event: Stripe.Event;

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
      case 'customer.subscription.created': {
        // Webhookペイロードは通常必要なプロパティを持っている
        const subscription = event.data
          .object as StripeSubscriptionWithMetadata;
        const userId = subscription.metadata.userId; // メタデータからユーザーIDを取得

        if (!userId) {
          console.error(
            'Webhook: customer.subscription.created - userId missing in metadata',
            subscription,
          );
          return new NextResponse(
            'User ID missing from subscription metadata',
            { status: 400 },
          );
        }

        const priceId = subscription.items.data[0].price.id;
        let plan: SubscriptionPlan = 'FREE';
        if (priceId === STRIPE_PRICE_IDS.PRO_MONTHLY) {
          plan = 'PRO_MONTHLY';
        } else if (priceId === STRIPE_PRICE_IDS.PRO_YEARLY) {
          plan = 'PRO_YEARLY';
        }

        const initialStatus: SubscriptionStatus =
          subscription.status === 'active' ? 'ACTIVE' : 'UNPAID';

        await prisma.subscription.upsert({
          where: { userId: userId },
          create: {
            userId: userId,
            stripeSubscriptionId: subscription.id,
            stripePriceId: priceId,
            status: initialStatus,
            plan: plan,
            stripeCurrentPeriodEnd: toZonedTime(
              new Date(subscription.current_period_end * 1000),
              'Asia/Tokyo',
            ),
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
          },
          update: {
            stripeSubscriptionId: subscription.id,
            stripePriceId: priceId,
            status: initialStatus,
            plan: plan,
            stripeCurrentPeriodEnd: toZonedTime(
              new Date(subscription.current_period_end * 1000),
              'Asia/Tokyo',
            ),
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
          },
        });
        console.log(
          `Webhook: Subscription created/upserted for user ${userId}. Sub ID: ${subscription.id}, Status: ${initialStatus}`,
        );
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data
          .object as StripeSubscriptionWithMetadata;
        const userId = subscription.metadata.userId;

        if (!userId) {
          console.error(
            'Webhook: customer.subscription.updated - userId missing in metadata',
            subscription,
          );
          return new NextResponse(
            'User ID missing from subscription metadata',
            { status: 400 },
          );
        }

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

        const priceId = subscription.items.data[0].price.id;
        let plan: SubscriptionPlan = 'FREE';
        if (priceId === STRIPE_PRICE_IDS.PRO_MONTHLY) {
          plan = 'PRO_MONTHLY';
        } else if (priceId === STRIPE_PRICE_IDS.PRO_YEARLY) {
          plan = 'PRO_YEARLY';
        }

        await prisma.subscription.update({
          where: {
            stripeSubscriptionId: subscription.id,
          },
          data: {
            status,
            plan,
            stripeCurrentPeriodEnd: toZonedTime(
              new Date(subscription.current_period_end * 1000),
              'Asia/Tokyo',
            ),
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
            stripePriceId: priceId,
          },
        });
        console.log(
          `Webhook: Subscription updated for user ${userId}. Status: ${status}, Plan: ${plan}`,
        );
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data
          .object as StripeSubscriptionWithMetadata;
        const userId = subscription.metadata.userId;

        if (!userId) {
          console.error(
            'Webhook: customer.subscription.deleted - userId missing in metadata',
            subscription,
          );
          return new NextResponse(
            'User ID missing from subscription metadata',
            { status: 400 },
          );
        }

        await prisma.subscription.update({
          where: {
            stripeSubscriptionId: subscription.id,
          },
          data: {
            status: 'CANCELED',
            plan: 'FREE',
            cancelAtPeriodEnd: true,
            stripePriceId: STRIPE_PRICE_IDS.FREE,
          },
        });
        console.log(
          `Webhook: Subscription deleted/canceled for user ${userId}. Sub ID: ${subscription.id}`,
        );
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as StripeInvoiceWithMetadata;

        if (!invoice.subscription) {
          console.error(
            'Webhook: invoice.payment_succeeded - invoice.subscription is null',
            invoice,
          );
          return new NextResponse('Invoice subscription ID is null', {
            status: 400,
          });
        }

        // ここで Stripe.Subscription 型にキャストし、必要なプロパティは安全にアクセスする
        const retrievedSubscription = (await stripe.subscriptions.retrieve(
          invoice.subscription,
        )) as Stripe.Subscription;

        // 型安全にプロパティにアクセスするため、カスタムインターフェースのプロパティをオプショナルにするか、
        // アクセス時に型ガードを使用します。
        // 今回は、retrieveの結果がWebhookペイロードと同様の構造を持つことを期待し、
        // カスタムインターフェースの定義を調整します。
        // または、直接 `retrievedSubscription` からプロパティを抽出し、`as any` を使用して安全にアクセスします。
        const subscription: StripeSubscriptionWithMetadata = {
          ...retrievedSubscription,
          current_period_end: (retrievedSubscription as any).current_period_end,
          cancel_at_period_end: (retrievedSubscription as any)
            .cancel_at_period_end,
          metadata: (retrievedSubscription.metadata || {}) as {
            userId?: string;
          }, // metadataも安全にアクセス
        };

        const userId = subscription.metadata.userId;
        if (!userId) {
          console.error(
            'Webhook: invoice.payment_succeeded - userId missing in subscription metadata',
            subscription,
          );
          return new NextResponse(
            'User ID missing from subscription metadata in successful payment',
            { status: 400 },
          );
        }

        const priceId = subscription.items.data[0].price.id;
        let plan: SubscriptionPlan = 'FREE';
        if (priceId === STRIPE_PRICE_IDS.PRO_MONTHLY) {
          plan = 'PRO_MONTHLY';
        } else if (priceId === STRIPE_PRICE_IDS.PRO_YEARLY) {
          plan = 'PRO_YEARLY';
        }

        await prisma.subscription.update({
          where: {
            stripeSubscriptionId: subscription.id,
          },
          data: {
            status: 'ACTIVE',
            stripeCurrentPeriodEnd: toZonedTime(
              new Date(subscription.current_period_end * 1000),
              'Asia/Tokyo',
            ),
            plan: plan,
            stripePriceId: priceId,
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
          },
        });
        console.log(
          `Webhook: Payment succeeded for user ${userId}. Subscription ID: ${subscription.id}, Plan: ${plan}`,
        );
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as StripeInvoiceWithMetadata;

        if (!invoice.subscription) {
          console.error(
            'Webhook: invoice.payment_failed - invoice.subscription is null',
            invoice,
          );
          return new NextResponse('Invoice subscription ID is null', {
            status: 400,
          });
        }

        const retrievedSubscription = (await stripe.subscriptions.retrieve(
          invoice.subscription,
        )) as Stripe.Subscription;

        const subscription: StripeSubscriptionWithMetadata = {
          ...retrievedSubscription,
          current_period_end: (retrievedSubscription as any).current_period_end,
          cancel_at_period_end: (retrievedSubscription as any)
            .cancel_at_period_end,
          metadata: (retrievedSubscription.metadata || {}) as {
            userId?: string;
          },
        };

        const userId = subscription.metadata.userId;
        if (!userId) {
          console.error(
            'Webhook: invoice.payment_failed - userId missing in subscription metadata',
            subscription,
          );
          return new NextResponse(
            'User ID missing from subscription metadata in failed payment',
            { status: 400 },
          );
        }

        await prisma.subscription.update({
          where: {
            stripeSubscriptionId: invoice.subscription,
          },
          data: {
            status: 'PAST_DUE',
          },
        });
        console.log(
          `Webhook: Payment failed for user ${userId}. Subscription ID: ${invoice.subscription}`,
        );
        break;
      }
    }

    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return new NextResponse('Webhook handler failed', { status: 500 });
  }
}
