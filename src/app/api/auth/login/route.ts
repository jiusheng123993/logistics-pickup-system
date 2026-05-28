import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createSessionToken } from '@/lib/session';
import { validatePhone } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { phone, password, role } = await request.json();

    if (!validatePhone(phone)) {
      return NextResponse.json(
        { error: '手机号格式不正确' },
        { status: 400 }
      );
    }

    let user = await prisma.user.findUnique({
      where: { phone },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          phone,
          name: phone,
          password: '',
          role,
        },
      });
    }

    const token = createSessionToken({
      userId: user.id,
      phone: user.phone,
      name: user.name,
      role: user.role as any,
    });

    const response = NextResponse.json({ success: true, role: user.role });
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: '登录失败' },
      { status: 500 }
    );
  }
}
