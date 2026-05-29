import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse, validateRequiredFields } from '@/lib/api';
import { validatePhone, hashPassword } from '@/lib/auth';
import { getCurrentUser } from '@/lib/server-utils';

/**
 * 获取用户列表
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return errorResponse('未登录', 401);
    }

    // 只有管理员可以访问
    if (user.role !== 'ADMIN') {
      return errorResponse('无权访问', 403);
    }

    const searchParams = request.nextUrl.searchParams;
    const role = searchParams.get('role');
    const search = searchParams.get('search');

    let where: any = {};

    if (role) {
      where.role = role;
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { phone: { contains: search } },
        { email: { contains: search } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      include: {
        _count: {
          select: {
            packagesAsRecipient: true,
            packagesAsCourier: true,
            pickups: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // 不返回密码
    const usersWithoutPassword = users.map(({ password, ...rest }) => rest);

    return successResponse(usersWithoutPassword);
  } catch (error) {
    console.error('获取用户列表失败:', error);
    return errorResponse('获取用户列表失败', 500);
  }
}

/**
 * 创建用户（管理员）
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return errorResponse('未登录', 401);
    }

    // 只有管理员可以访问
    if (user.role !== 'ADMIN') {
      return errorResponse('无权访问', 403);
    }

    const data = await request.json();

    // 验证必需字段
    const requiredFields = ['name', 'phone', 'password', 'role'];
    const fieldErrors = validateRequiredFields(data, requiredFields);
    if (fieldErrors.length > 0) {
      return errorResponse(fieldErrors.join(', '), 400);
    }

    // 验证手机号
    if (!validatePhone(data.phone)) {
      return errorResponse('手机号格式不正确', 400);
    }

    // 检查手机号是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { phone: data.phone },
    });

    if (existingUser) {
      return errorResponse('该手机号已注册', 400);
    }

    // 加密密码
    const hashedPassword = await hashPassword(data.password);

    // 创建用户
    const newUser = await prisma.user.create({
      data: {
        name: data.name,
        phone: data.phone,
        email: data.email,
        password: hashedPassword,
        role: data.role,
      },
    });

    // 不返回密码
    const { password, ...userWithoutPassword } = newUser;

    return successResponse(userWithoutPassword, '用户创建成功', 201);
  } catch (error) {
    console.error('创建用户失败:', error);
    return errorResponse('创建用户失败', 500);
  }
}
