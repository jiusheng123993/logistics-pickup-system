import { NextResponse } from 'next/server';

/**
 * 用户登出API接口
 * 
 * 功能：清除用户会话cookie
 * 
 * 响应：{ success: true }
 */
export async function POST() {
  const response = NextResponse.json({ success: true });
  // 清除 auth_token cookie
  response.cookies.set('auth_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
  return response;
}
