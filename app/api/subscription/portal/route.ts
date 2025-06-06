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

    console.log('Creating portal session for customer:', user.stripeCustomerId);
    console.log('Return URL:', `${process.env.NEXT_PUBLIC_APP_URL}/billing`);

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing`,
    });

    console.log('Portal session created:', portalSession.url);

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error('Portal session creation error:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
      });
    }
    return NextResponse.json(
      { error: 'ポータルセッションの作成に失敗しました' },
      { status: 500 },
    );
  }
}
