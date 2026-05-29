import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { parseSessionToken } from '@/lib/session';
import { User } from '@/types';

/**
 * 从请求中获取当前用户
 * 
 * @returns 用户对象，如果未认证返回 null
 */
export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  
  if (!token) {
    return null;
  }
  
  const payload = parseSessionToken(token);
  if (!payload) {
    return null;
  }
  
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
  });
  
  if (!user) {
    return null;
  }
  
  return user as User;
}
