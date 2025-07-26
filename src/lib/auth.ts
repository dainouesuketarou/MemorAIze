/**
 * 任意。Server Component で getServerSession を呼び出すヘルパー
 * lib/auth.ts
 */
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function getAuthSession() {
  return getServerSession(authOptions);
}
