// app/api/subscription/verify/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { SubscriptionStatus, SubscriptionPlan } from '@prisma/client';
import Stripe from 'stripe';

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

    // Stripeからのレスポンスをanyで受け、構造をログで確認
    const rawSubscriptionResponse: any = await stripe.subscriptions.retrieve(
      intent.metadata.subscriptionId,
    );
    console.log('--- RAW Subscription Response (verify) ---');
    console.log('Keys:', Object.keys(rawSubscriptionResponse || {}));
    console.log(
      'Full Object:',
      JSON.stringify(rawSubscriptionResponse, null, 2),
    );
    console.log('--- End RAW Subscription Response (verify) ---');

    if (
      !rawSubscriptionResponse ||
      typeof rawSubscriptionResponse.object !== 'string'
    ) {
      throw new Error(
        'Invalid response received from Stripe subscriptions.retrieve',
      );
    }
    if (
      rawSubscriptionResponse.object === 'subscription' &&
      rawSubscriptionResponse.deleted === true
    ) {
      console.error('Subscription has been deleted:', rawSubscriptionResponse);
      throw new Error('Subscription has been deleted.');
    }
    if (rawSubscriptionResponse.object !== 'subscription') {
      throw new Error(
        `Expected a subscription object, but got ${rawSubscriptionResponse.object}`,
      );
    }
    // 型定義が不完全な可能性があるため、anyを介してアクセスする箇所がある
    const subscriptionResponse = rawSubscriptionResponse as Stripe.Subscription;

    // current_period_end の取得: 型定義の問題を回避するため any を使用
    let periodEndTimestamp: number | null = null;
    console.log(
      'Attempting to access current_period_end on subscriptionResponse:',
      (subscriptionResponse as any).current_period_end,
    );
    if (typeof (subscriptionResponse as any).current_period_end === 'number') {
      periodEndTimestamp = (subscriptionResponse as any).current_period_end;
    } else if (
      typeof (subscriptionResponse as any).currentPeriodEnd === 'number'
    ) {
      // キャメルケースも試す
      console.log(
        "Found and using 'currentPeriodEnd' (camelCase) from subscription root.",
      );
      periodEndTimestamp = (subscriptionResponse as any).currentPeriodEnd;
    } else {
      console.warn(
        `'current_period_end' (or camelCase) not found or not a number in root of subscription. Object keys:`,
        Object.keys(subscriptionResponse as any),
      );
    }

    const items = (subscriptionResponse as any).items; // items も any を介してアクセス
    if (!periodEndTimestamp && items?.data?.length > 0) {
      const firstItem = items.data[0] as any;
      console.log(
        'Attempting to access current_period_end on firstItem:',
        firstItem?.current_period_end,
      );
      if (firstItem && typeof firstItem.current_period_end === 'number') {
        periodEndTimestamp = firstItem.current_period_end;
      } else if (firstItem && typeof firstItem.currentPeriodEnd === 'number') {
        // キャメルケースも試す
        console.log(
          "Found and using 'currentPeriodEnd' (camelCase) from subscription item.",
        );
        periodEndTimestamp = firstItem.currentPeriodEnd;
      } else {
        console.warn(
          `'current_period_end' (or camelCase) not found or not a number in first item. Object keys:`,
          Object.keys(firstItem || {}),
        );
      }
    }

    if (periodEndTimestamp === null) {
      console.error(
        'Subscription period end could not be determined. Full subscription object:',
        JSON.stringify(subscriptionResponse, null, 2),
      );
      throw new Error(
        `Invalid subscription period end date. Status: ${
          (subscriptionResponse as any).status
        }`,
      );
    }
    const currentPeriodEndForDb = new Date(periodEndTimestamp * 1000);

    let subscriptionStatusPrisma: SubscriptionStatus = 'UNPAID'; // もしくは他の適切なデフォルト値
    const stripeStatus = String((subscriptionResponse as any).status);

    switch (stripeStatus) {
      case 'active':
        subscriptionStatusPrisma = 'ACTIVE';
        break;
      case 'trialing':
        subscriptionStatusPrisma = 'TRIALING';
        break;
      case 'canceled':
        subscriptionStatusPrisma = 'CANCELED';
        break;
      case 'past_due':
        subscriptionStatusPrisma = 'PAST_DUE';
        break;
      case 'unpaid':
        subscriptionStatusPrisma = 'UNPAID';
        break;
      case 'incomplete':
        subscriptionStatusPrisma =
          redirectStatus === 'succeeded' ? 'ACTIVE' : 'UNPAID';
        break;
      default:
        // defaultケースでも明示的に割り当てる (初期値設定があれば必須ではないが、より明確)
        console.warn(
          `Unknown Stripe status in verify: ${stripeStatus}. Defaulting to UNPAID.`,
        );
        subscriptionStatusPrisma = 'UNPAID';
        break;
    }

    // --- プラン決定ロジックのデバッグ強化 ---
    let planType: SubscriptionPlan;
    const itemsData = (subscriptionResponse as any).items?.data;
    if (!itemsData || itemsData.length === 0 || !itemsData[0].price) {
      console.error('Subscription items or price data is missing:', itemsData);
      throw new Error('Subscription items or price data is missing.');
    }
    const priceObject = itemsData[0].price as any;
    if (typeof priceObject.id !== 'string') {
      console.error(
        'Price ID is missing or not a string in priceObject:',
        priceObject,
      );
      throw new Error('Price ID is missing or not a string.');
    }
    const priceIdFromStripe = priceObject.id;

    console.log('--- Plan Determination Logic (verify) ---');
    console.log('Price ID from Stripe:', priceIdFromStripe);
    console.log('Env STRIPE_FREE_PRICE_ID:', process.env.STRIPE_FREE_PRICE_ID);
    console.log('Env STRIPE_PRO_PRICE_ID:', process.env.STRIPE_PRO_PRICE_ID);
    console.log(
      'Env STRIPE_PRO_YEARLY_PRICE_ID:',
      process.env.STRIPE_PRO_YEARLY_PRICE_ID,
    );

    if (priceIdFromStripe === process.env.STRIPE_FREE_PRICE_ID) {
      planType = 'FREE';
    } else if (priceIdFromStripe === process.env.STRIPE_PRO_PRICE_ID) {
      planType = 'PRO_MONTHLY';
    } else if (priceIdFromStripe === process.env.STRIPE_PRO_YEARLY_PRICE_ID) {
      planType = 'PRO_YEARLY';
    } else {
      console.error(
        `Unknown priceId encountered: "${priceIdFromStripe}". ` +
          `This ID does not match any of the plan Price IDs in environment variables. ` +
          `Subscription will NOT be updated with a new plan type.`,
      );
      // ここでエラーを投げるか、既存のプランを維持するか、デフォルトプランにするか選択
      // 今回はエラーを投げて問題を明確にします。
      throw new Error(
        `Unknown/unmatched Stripe Price ID: ${priceIdFromStripe}`,
      );
    }
    console.log('Determined planType:', planType);
    console.log('--- End Plan Determination Logic (verify) ---');

    await prisma.subscription.update({
      where: { stripeSubscriptionId: String((subscriptionResponse as any).id) },
      data: {
        status: subscriptionStatusPrisma,
        stripeCurrentPeriodEnd: currentPeriodEndForDb,
        plan: planType, // ★★★ この planType が正しく設定されるか
        stripePriceId: priceIdFromStripe, // stripePriceId もDBに保存
      },
    });
    console.log(
      `Subscription DB updated for ${String(
        (subscriptionResponse as any).id,
      )} with plan: ${planType}`,
    );

    return new NextResponse('Payment verified', { status: 200 });
  } catch (error) {
    console.error('Payment verification error:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Internal Server Error';
    return new NextResponse(errorMessage, { status: 500 });
  }
}
