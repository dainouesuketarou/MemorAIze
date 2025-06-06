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

    console.log('User ID:', session.user.id);

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { stripeCustomerId: true },
    });

    console.log('User data:', user);

    if (!user?.stripeCustomerId) {
      console.log('Stripe customer ID not found');
      return NextResponse.json(
        { error: 'Stripeの顧客情報が見つかりません' },
        { status: 404 },
      );
    }

    try {
      // まず顧客情報が存在するか確認
      const customer = await stripe.customers.retrieve(user.stripeCustomerId);
      if (customer.deleted) {
        console.log('Customer has been deleted');
        return NextResponse.json(
          { error: 'Stripeの顧客情報が無効です' },
          { status: 400 },
        );
      }

      console.log(
        'Creating portal session for customer:',
        user.stripeCustomerId,
      );
      console.log('Return URL:', `${process.env.NEXT_PUBLIC_APP_URL}/billing`);

      const portalSession = await stripe.billingPortal.sessions.create({
        customer: user.stripeCustomerId,
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing`,
      });

      console.log('Portal session created:', portalSession.url);

      return NextResponse.json({ url: portalSession.url });
    } catch (stripeError) {
      console.error('Stripe API error:', stripeError);
      if (stripeError instanceof Stripe.errors.StripeError) {
        return NextResponse.json(
          { error: `Stripeエラー: ${stripeError.message}` },
          { status: 400 },
        );
      }
      throw stripeError;
    }
  } catch (error) {
    console.error('Portal session creation error:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
    }
    return NextResponse.json(
      {
        error: 'ポータルセッションの作成に失敗しました',
        details: error instanceof Error ? error.message : '不明なエラー',
      },
      { status: 500 },
    );
  }
}
