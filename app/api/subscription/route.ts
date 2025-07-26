import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { stripe, STRIPE_PRICE_IDS } from '@/src/lib/stripe';
import { prisma } from '@/src/lib/prisma';
// SubscriptionStatus, SubscriptionPlan はここでは直接使用しない
import StripeType from 'stripe';
// getAuthSessionは未使用なので削除またはコメントアウト
// import { getAuthSession } from '@/lib/auth';

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
      // ユーザーのstripeCustomerIdをデータベースに保存
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customerId },
      });
    }

    // Stripeサブスクリプションを作成
    // payment_behavior: 'default_incomplete' により、 PaymentIntent が必要になる
    const subscriptionCreateParams: StripeType.SubscriptionCreateParams = {
      customer: customerId,
      items: [{ price: requestedPriceId as string }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice'], // PaymentIntentを取得するために展開
      metadata: { userId: user.id }, // webhookで利用するためuserIdを渡す
    };

    const newSubscription = (await stripe.subscriptions.create(
      subscriptionCreateParams,
    )) as StripeType.Subscription;

    const rawLatestInvoice = (newSubscription as any).latest_invoice; // 型キャストでlatest_invoiceにアクセス
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

    // PaymentIntent を手動で作成（サブスクリプションと紐付ける）
    const paymentIntentCreateParams: StripeType.PaymentIntentCreateParams = {
      amount: latestInvoice.amount_due,
      currency: (latestInvoice.currency as string | null) || 'jpy',
      customer: customerId,
      // PaymentIntentのメタデータにStripeのSubscription IDとUser IDを保持する
      metadata: {
        subscriptionId: newSubscription.id,
        userId: user.id, // ユーザーIDもメタデータに含める
      },
    };

    const paymentIntentObject = await stripe.paymentIntents.create(
      paymentIntentCreateParams,
    );

    const clientSecret = paymentIntentObject.client_secret;

    if (!clientSecret) {
      throw new Error('Payment intent client secret not found after creation.');
    }

    // ★★★重要★★★
    // ここでは `prisma.subscription` を更新しません。
    // データベースの更新は、StripeのWebhookイベント (`invoice.payment_succeeded` や `customer.subscription.updated`)
    // でのみ行います。

    return NextResponse.json({
      subscriptionId: newSubscription.id, // フロントエンドにはこの情報を渡す
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

// 動的レンダリングを明示的に指定
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: session.user.id,
      },
      select: {
        status: true,
        plan: true,
        stripeSubscriptionId: true,
        stripePriceId: true,
        stripeCurrentPeriodEnd: true,
      },
    });

    return NextResponse.json(
      subscription || { status: 'INACTIVE', plan: 'FREE' },
    );
  } catch (error) {
    console.error('Error fetching subscription status:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
