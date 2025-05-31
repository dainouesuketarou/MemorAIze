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

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isOnboarded: true },
    });

    return NextResponse.json({ isOnboarded: user?.isOnboarded ?? false });
  } catch (error) {
    console.error('Error fetching onboarding status:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
