import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { SubscriptionStatus } from '@prisma/client';
import type Stripe from 'stripe';

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
        const subscription = event.data.object as Stripe.Subscription & {
          current_period_end: number;
        };
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

        await prisma.subscription.update({
          where: {
            stripeSubscriptionId: subscription.id,
          },
          data: {
            status,
            stripeCurrentPeriodEnd: new Date(
              subscription.current_period_end * 1000,
            ),
          },
        });
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await prisma.subscription.update({
          where: {
            stripeSubscriptionId: subscription.id,
          },
          data: {
            status: 'CANCELED',
          },
        });
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice & {
          subscription: string;
        };
        if (invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            invoice.subscription,
          );
          const priceId = subscription.items.data[0].price.id;
          let plan: 'FREE' | 'PRO_MONTHLY' | 'PRO_YEARLY';

          if (priceId === process.env.STRIPE_FREE_PRICE_ID) {
            plan = 'FREE';
          } else if (priceId === process.env.STRIPE_PRO_PRICE_ID) {
            plan = 'PRO_MONTHLY';
          } else if (priceId === process.env.STRIPE_PRO_YEARLY_PRICE_ID) {
            plan = 'PRO_YEARLY';
          } else {
            console.error(`Unknown price ID: ${priceId}`);
            return new NextResponse('Unknown price ID', { status: 400 });
          }

          await prisma.subscription.update({
            where: {
              stripeSubscriptionId: invoice.subscription,
            },
            data: {
              status: 'ACTIVE',
              plan: plan,
              stripePriceId: priceId,
            },
          });
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice & {
          subscription: string;
        };
        if (invoice.subscription) {
          await prisma.subscription.update({
            where: {
              stripeSubscriptionId: invoice.subscription,
            },
            data: {
              status: 'PAST_DUE',
            },
          });
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
