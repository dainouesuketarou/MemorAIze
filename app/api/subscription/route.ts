// /api/subscription/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { stripe, STRIPE_PRICE_IDS } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { SubscriptionStatus, SubscriptionPlan } from '@prisma/client';
import StripeType from 'stripe';
import { getAuthSession } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id)
      return new NextResponse('Unauthorized', { status: 401 });

    const { priceId: requestedPriceId } = await req.json();
    if (
      !requestedPriceId ||
      !Object.values(STRIPE_PRICE_IDS).includes(requestedPriceId as string)
    ) {
      return new NextResponse('Invalid price ID', { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { subscription: true },
    });
    if (!user) return new NextResponse('User not found', { status: 404 });

    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email!,
        name: user.name ?? undefined,
        metadata: { userId: user.id },
      });
      customerId = customer.id;
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customerId },
      });
    }

    const subscriptionCreateParams: StripeType.SubscriptionCreateParams = {
      customer: customerId,
      items: [{ price: requestedPriceId as string }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice'],
      metadata: { userId: user.id },
    };

    const rawNewSubscriptionResponse: any = await stripe.subscriptions.create(
      subscriptionCreateParams,
    );
    // ... (ログは維持)
    console.log('--- RAW New Subscription Response (create) ---');
    console.log(
      'Full Object:',
      JSON.stringify(rawNewSubscriptionResponse, null, 2),
    );
    console.log('--- End RAW New Subscription Response (create) ---');

    if (
      !rawNewSubscriptionResponse ||
      rawNewSubscriptionResponse.object !== 'subscription'
    ) {
      throw new Error(
        'Invalid response received from Stripe subscriptions.create',
      );
    }
    const newSubscription =
      rawNewSubscriptionResponse as StripeType.Subscription;

    const rawLatestInvoice = (newSubscription as any).latest_invoice;
    // ... (ログは維持)
    console.log('--- RAW Latest Invoice (from created sub) ---');
    console.log(
      'Full latest_invoice:',
      JSON.stringify(rawLatestInvoice, null, 2),
    );
    console.log('--- End RAW Latest Invoice ---');

    if (
      !rawLatestInvoice ||
      typeof rawLatestInvoice !== 'object' ||
      rawLatestInvoice.object !== 'invoice'
    ) {
      throw new Error(
        'Could not get latest_invoice object or it is not an Invoice object.',
      );
    }
    const latestInvoice = rawLatestInvoice as StripeType.Invoice;

    // PaymentIntent 作成前にメタデータ用のIDを検証
    const subIdForMeta = (newSubscription as any).id;
    const invIdForMeta = (latestInvoice as any).id;
    const userIdForMeta = user.id; // user.id は Prisma モデルから string が保証されている

    if (typeof subIdForMeta !== 'string') {
      console.error(
        'Subscription ID for metadata is not a string:',
        subIdForMeta,
      );
      throw new Error(
        'Critical Subscription ID missing for PaymentIntent metadata.',
      );
    }
    if (typeof invIdForMeta !== 'string') {
      console.error('Invoice ID for metadata is not a string:', invIdForMeta);
      throw new Error(
        'Critical Invoice ID missing for PaymentIntent metadata.',
      );
    }

    const paymentIntentMetadata: StripeType.MetadataParam = {
      subscriptionId: subIdForMeta,
      invoiceId: invIdForMeta,
      userId: userIdForMeta,
    };

    // PaymentIntent を手動で作成 (前回の修正内容)
    if (
      latestInvoice.status !== 'open' ||
      typeof latestInvoice.amount_due !== 'number'
    ) {
      console.error(
        'Latest invoice is not open or has no valid amount due:',
        latestInvoice,
      );
      throw new Error('Cannot create PaymentIntent for this invoice state.');
    }

    const paymentIntentCreateParams: StripeType.PaymentIntentCreateParams = {
      amount: latestInvoice.amount_due,
      currency: (latestInvoice.currency as string | null) || 'jpy', // currencyもstringであることを確認またはフォールバック
      customer: customerId,
      metadata: paymentIntentMetadata, // 検証済みのメタデータを使用
    };
    console.log(
      'Creating PaymentIntent with params:',
      paymentIntentCreateParams,
    );
    const paymentIntentObject = await stripe.paymentIntents.create(
      paymentIntentCreateParams,
    );

    const clientSecret = paymentIntentObject.client_secret;
    const paymentIntentId = paymentIntentObject.id;

    if (!clientSecret) {
      throw new Error('Payment intent client secret not found after creation.');
    }

    // metadata の更新は create 時に行っているので、ここでは不要な場合もあるが、念のため
    await stripe.paymentIntents.update(paymentIntentId, {
      metadata: paymentIntentMetadata,
    });

    // current_period_end の取得 (以前の修正と同様)
    let periodEndForDbTimestamp: number | null = null;
    const newSubscriptionAny = newSubscription as any;
    console.log(
      'Attempting to access current_period_end on newSubscription:',
      newSubscriptionAny.current_period_end,
    );
    if (typeof newSubscriptionAny.current_period_end === 'number') {
      periodEndForDbTimestamp = newSubscriptionAny.current_period_end;
    } else if (typeof newSubscriptionAny.currentPeriodEnd === 'number') {
      console.log(
        "Found and using 'currentPeriodEnd' (camelCase) from new subscription root.",
      );
      periodEndForDbTimestamp = newSubscriptionAny.currentPeriodEnd;
    } else {
      console.warn(
        `'current_period_end' (or camelCase) not found or not a number in new subscription. Object keys:`,
        Object.keys(newSubscriptionAny),
      );
    }

    const newSubscriptionItems = newSubscriptionAny.items;
    if (!periodEndForDbTimestamp && newSubscriptionItems?.data?.length > 0) {
      const firstItem = newSubscriptionItems.data[0] as any;
      console.log(
        'Attempting to access current_period_end on newSubscription firstItem:',
        firstItem?.current_period_end,
      );
      if (firstItem && typeof firstItem.current_period_end === 'number') {
        periodEndForDbTimestamp = firstItem.current_period_end;
      } else if (firstItem && typeof firstItem.currentPeriodEnd === 'number') {
        console.log(
          "Found and using 'currentPeriodEnd' (camelCase) from new subscription's first item.",
        );
        periodEndForDbTimestamp = firstItem.currentPeriodEnd;
      } else {
        console.warn(
          `'current_period_end' (or camelCase) not found or not a number in new subscription's first item. Object keys:`,
          Object.keys(firstItem || {}),
        );
      }
    }
    const stripeCurrentPeriodEndForDb = periodEndForDbTimestamp
      ? new Date(periodEndForDbTimestamp * 1000)
      : null;

    let planTypeDb: SubscriptionPlan;
    const newSubscriptionItemsForPlan = (newSubscription as any).items?.data;
    if (
      !newSubscriptionItemsForPlan ||
      newSubscriptionItemsForPlan.length === 0 ||
      !newSubscriptionItemsForPlan[0].price
    ) {
      console.error(
        'New subscription items or price data is missing:',
        newSubscriptionItemsForPlan,
      );
      throw new Error('New subscription items or price data is missing.');
    }
    const priceObjectFromNewSub = newSubscriptionItemsForPlan[0].price as any;
    if (typeof priceObjectFromNewSub.id !== 'string') {
      console.error(
        'Price ID is missing or not a string in priceObjectFromNewSub:',
        priceObjectFromNewSub,
      );
      throw new Error(
        'Price ID is missing or not a string for new subscription.',
      );
    }
    const priceIdFromCreatedSub = priceObjectFromNewSub.id;

    console.log('--- Plan Determination Logic (create) ---');
    console.log('Price ID from Stripe (for new sub):', priceIdFromCreatedSub);
    console.log('Env STRIPE_FREE_PRICE_ID:', process.env.STRIPE_FREE_PRICE_ID);
    console.log('Env STRIPE_PRO_PRICE_ID:', process.env.STRIPE_PRO_PRICE_ID);
    console.log(
      'Env STRIPE_PRO_YEARLY_PRICE_ID:',
      process.env.STRIPE_PRO_YEARLY_PRICE_ID,
    );

    if (priceIdFromCreatedSub === STRIPE_PRICE_IDS.FREE) {
      // 環境変数を直接比較する場合は STRIPE_PRICE_IDS オブジェクト経由も可
      planTypeDb = 'FREE';
    } else if (priceIdFromCreatedSub === STRIPE_PRICE_IDS.PRO_MONTHLY) {
      planTypeDb = 'PRO_MONTHLY';
    } else if (priceIdFromCreatedSub === STRIPE_PRICE_IDS.PRO_YEARLY) {
      planTypeDb = 'PRO_YEARLY';
    } else {
      console.error(
        `Unknown priceId encountered: "${priceIdFromCreatedSub}". ` +
          `This ID does not match any of the plan Price IDs in environment variables. ` +
          `Subscription will NOT be created/updated with a new plan type.`,
      );
      throw new Error(
        `Unknown/unmatched Stripe Price ID: ${priceIdFromCreatedSub}`,
      );
    }
    console.log('Determined planTypeDb:', planTypeDb);
    console.log('--- End Plan Determination Logic (create) ---');

    let initialStatusDb: SubscriptionStatus = 'UNPAID'; // もしくは他の適切なデフォルト値
    const stripeInitialStatus = String((newSubscription as any).status);

    switch (stripeInitialStatus) {
      case 'active':
        initialStatusDb = 'ACTIVE';
        break;
      case 'trialing':
        initialStatusDb = 'TRIALING';
        break;
      case 'incomplete':
        initialStatusDb = 'UNPAID'; // 'incomplete' は支払い未完了なので UNPAID が適切
        break;
      case 'past_due':
        initialStatusDb = 'PAST_DUE';
        break;
      case 'unpaid':
        initialStatusDb = 'UNPAID';
        break;
      case 'canceled':
        initialStatusDb = 'CANCELED';
        break;
      default:
        // defaultケースでも明示的に割り当てる (初期値設定があれば必須ではないが、より明確)
        console.warn(
          `Unhandled Stripe status in create: ${stripeInitialStatus}. Defaulting to UNPAID.`,
        );
        initialStatusDb = 'UNPAID';
        break;
    }

    await prisma.subscription.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        stripeSubscriptionId: newSubscription.id,
        stripePriceId: requestedPriceId as string, // requestedPriceId は顧客が選んだもの
        status: initialStatusDb,
        stripeCurrentPeriodEnd: stripeCurrentPeriodEndForDb,
        plan: planTypeDb, // ★★★ planTypeDb
      },
      update: {
        stripeSubscriptionId: newSubscription.id,
        stripePriceId: requestedPriceId as string,
        status: initialStatusDb,
        stripeCurrentPeriodEnd: stripeCurrentPeriodEndForDb,
        plan: planTypeDb, // ★★★ planTypeDb
      },
    });
    console.log(
      `Subscription DB upserted for user ${user.id} with plan: ${planTypeDb}`,
    );

    return NextResponse.json({
      subscriptionId: newSubscription.id,
      clientSecret: clientSecret,
    });
  } catch (error) {
    console.error('Subscription creation/update error:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Internal Server Error';
    if (error instanceof StripeType.errors.StripeError) {
      return new NextResponse(
        JSON.stringify({
          message: errorMessage,
          type: error.type,
          raw: error.raw,
        }),
        {
          status: error.statusCode || 500,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }
    return new NextResponse(errorMessage, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        subscription: {
          select: {
            id: true,
            plan: true,
            status: true,
            stripeSubscriptionId: true,
            stripePriceId: true,
            stripeCurrentPeriodEnd: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'ユーザーが見つかりません' },
        { status: 404 },
      );
    }

    return NextResponse.json(user.subscription);
  } catch (error) {
    console.error('サブスクリプション情報の取得に失敗しました:', error);
    return NextResponse.json(
      { error: 'サブスクリプション情報の取得に失敗しました' },
      { status: 500 },
    );
  }
}
