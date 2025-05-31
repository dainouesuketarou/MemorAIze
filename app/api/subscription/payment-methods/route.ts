import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { stripeCustomerId: true },
    });

    console.log('User data:', {
      userId: session.user.id,
      stripeCustomerId: user?.stripeCustomerId,
    });

    if (!user?.stripeCustomerId) {
      console.log('No stripeCustomerId found for user:', session.user.id);
      return NextResponse.json(
        { error: '顧客情報が見つかりません' },
        { status: 404 },
      );
    }

    try {
      const paymentMethods = await stripe.paymentMethods.list({
        customer: user.stripeCustomerId,
        type: 'card',
      });

      console.log('Stripe payment methods response:', {
        customerId: user.stripeCustomerId,
        count: paymentMethods.data.length,
      });

      return NextResponse.json({
        paymentMethods: paymentMethods.data.map((method) => ({
          id: method.id,
          brand: method.card?.brand,
          last4: method.card?.last4,
          expMonth: method.card?.exp_month,
          expYear: method.card?.exp_year,
          isDefault: method.metadata?.isDefault === 'true',
        })),
      });
    } catch (stripeError) {
      console.error('Stripe API error:', stripeError);
      return NextResponse.json(
        { error: 'Stripeからの支払い方法の取得に失敗しました' },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    return NextResponse.json(
      { error: '支払い方法の取得に失敗しました' },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const { paymentMethodId } = await req.json();
    if (!paymentMethodId) {
      return NextResponse.json(
        { error: '支払い方法IDが必要です' },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      select: { stripeCustomerId: true },
    });

    if (!user?.stripeCustomerId) {
      return NextResponse.json(
        { error: '顧客情報が見つかりません' },
        { status: 404 },
      );
    }

    // 支払い方法を顧客に紐付け
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: user.stripeCustomerId,
    });

    // デフォルトの支払い方法として設定
    await stripe.customers.update(user.stripeCustomerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error adding payment method:', error);
    return NextResponse.json(
      { error: '支払い方法の追加に失敗しました' },
      { status: 500 },
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const { paymentMethodId } = await req.json();
    if (!paymentMethodId) {
      return NextResponse.json(
        { error: '支払い方法IDが必要です' },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      select: { stripeCustomerId: true },
    });

    if (!user?.stripeCustomerId) {
      return NextResponse.json(
        { error: '顧客情報が見つかりません' },
        { status: 404 },
      );
    }

    // 支払い方法を削除
    await stripe.paymentMethods.detach(paymentMethodId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting payment method:', error);
    return NextResponse.json(
      { error: '支払い方法の削除に失敗しました' },
      { status: 500 },
    );
  }
}
