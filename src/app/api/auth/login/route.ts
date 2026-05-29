import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createSessionToken } from '@/lib/session';
import { validatePhone, verifyPassword } from '@/lib/auth';

/**
 * 用户登录API接口
 * 
 * 功能：验证用户凭据，创建会话
 * 
 * 请求参数：
 * - phone: 手机号
 * - password: 密码
 * - role: 角色（仅用于前端显示，实际以数据库为准）
 * 
 * 响应：
 * - 成功：{ success: true, role: string }，并设置 auth_token cookie
 * - 失败：{ error: string }，相应的HTTP状态码
 */
export async function POST(request: Request) {
  try {
    const { phone, password } = await request.json();

    // 验证手机号格式
    if (!validatePhone(phone)) {
      return NextResponse.json(
        { error: '手机号格式不正确' },
        { status: 400 }
      );
    }

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { phone },
    });

    // 用户不存在
    if (!user) {
      return NextResponse.json(
        { error: '用户不存在，请先注册' },
        { status: 401 }
      );
    }

    // 用户存在但密码为空（旧数据）
    if (!user.password) {
      return NextResponse.json(
        { error: '账户需要重置密码，请联系管理员' },
        { status: 401 }
      );
    }

    // 验证密码
    const passwordValid = await verifyPassword(password, user.password);
    if (!passwordValid) {
      return NextResponse.json(
        { error: '密码错误' },
        { status: 401 }
      );
    }

    // 创建会话token
    const token = createSessionToken({
      userId: user.id,
      phone: user.phone,
      name: user.name,
      role: user.role as any,
    });

    console.log('[Login API] 登录成功，设置cookie');
    console.log('[Login API] Token:', token.substring(0, 50) + '...');

    // 返回响应并设置cookie
    const response = NextResponse.json({ success: true, role: user.role });
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: false, // 开发环境设为 false，方便调试
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    console.log('[Login API] Cookie设置完成');
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: '登录失败' },
      { status: 500 }
    );
  }
}
