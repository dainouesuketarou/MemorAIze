import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

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
