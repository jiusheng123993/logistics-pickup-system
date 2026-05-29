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

/**
 * 更新用户
 */
export async function PUT(request: NextRequest) {
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
    const id = searchParams.get('id');

    if (!id) {
      return errorResponse('缺少用户ID', 400);
    }

    const data = await request.json();

    // 验证用户是否存在
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return errorResponse('用户不存在', 404);
    }

    // 如果要更新手机号，检查是否已被其他用户使用
    if (data.phone && data.phone !== existingUser.phone) {
      const duplicateUser = await prisma.user.findUnique({
        where: { phone: data.phone },
      });

      if (duplicateUser) {
        return errorResponse('该手机号已注册', 400);
      }

      if (!validatePhone(data.phone)) {
        return errorResponse('手机号格式不正确', 400);
      }
    }

    // 更新用户（不更新密码）
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        name: data.name,
        phone: data.phone,
        email: data.email,
        role: data.role,
      },
    });

    // 不返回密码
    const { password, ...userWithoutPassword } = updatedUser;

    return successResponse(userWithoutPassword, '更新成功');
  } catch (error) {
    console.error('更新用户失败:', error);
    return errorResponse('更新用户失败', 500);
  }
}

/**
 * 删除用户
 */
export async function DELETE(request: NextRequest) {
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
    const id = searchParams.get('id');

    if (!id) {
      return errorResponse('缺少用户ID', 400);
    }

    // 验证用户是否存在
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return errorResponse('用户不存在', 404);
    }

    // 不能删除自己
    if (id === user.id) {
      return errorResponse('不能删除当前登录用户', 400);
    }

    // 删除相关数据前先清理关联
    // 1. 删除通知
    await prisma.notification.deleteMany({
      where: { userId: id },
    });

    // 2. 删除取件记录
    await prisma.pickup.deleteMany({
      where: { userId: id },
    });

    // 3. 更新快递的 courierId 为 null（如果用户是快递员）
    await prisma.package.updateMany({
      where: { courierId: id },
      data: { courierId: null },
    });

    // 4. 更新快递的 recipient 关系（通过设置 recipientPhone 为其他值或保留）
    // 这里保留 recipientPhone 以便历史记录查询

    // 删除用户
    await prisma.user.delete({
      where: { id },
    });

    return successResponse(null, '删除成功');
  } catch (error) {
    console.error('删除用户失败:', error);
    return errorResponse('删除用户失败', 500);
  }
}
