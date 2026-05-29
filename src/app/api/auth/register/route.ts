import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createSessionToken } from '@/lib/session';
import { validatePhone, hashPassword } from '@/lib/auth';

/**
 * 用户注册API接口
 * 
 * 功能：接收用户注册信息，验证后创建新用户并自动登录
 * 
 * 请求参数：
 * - phone: 手机号（必须符合中国大陆手机号格式）
 * - password: 密码（至少6位）
 * - name: 用户姓名（不能为空）
 * - role: 用户角色（仅允许 USER 或 COURIER）
 * 
 * 响应：
 * - 成功：{ success: true, role: string }，并设置 auth_token cookie
 * - 失败：{ error: string }，相应的HTTP状态码
 */
export async function POST(request: Request) {
  try {
    const { phone, password, name, role } = await request.json();

    // 验证手机号格式
    if (!validatePhone(phone)) {
      return NextResponse.json(
        { error: '手机号格式不正确' },
        { status: 400 }
      );
    }

    // 验证密码强度
    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: '密码至少需要6位' },
        { status: 400 }
      );
    }

    // 验证姓名非空
    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: '姓名不能为空' },
        { status: 400 }
      );
    }

    // 验证角色合法性（ADMIN不开放注册）
    if (role !== 'USER' && role !== 'COURIER') {
      return NextResponse.json(
        { error: '无效的角色' },
        { status: 400 }
      );
    }

    // 检查手机号是否已注册
    const existingUser = await prisma.user.findUnique({
      where: { phone },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: '该手机号已注册' },
        { status: 400 }
      );
    }

    // 加密密码
    const hashedPassword = await hashPassword(password);

    // 创建新用户
    const user = await prisma.user.create({
      data: {
        phone,
        name: name.trim(),
        password: hashedPassword,
        role,
      },
    });

    // 创建会话token
    const token = createSessionToken({
      userId: user.id,
      phone: user.phone,
      name: user.name,
      role: user.role as any,
    });

    // 返回响应并设置cookie
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
    console.error('Register error:', error);
    return NextResponse.json(
      { error: '注册失败' },
      { status: 500 }
    );
  }
}
