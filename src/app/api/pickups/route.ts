import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api';
import { getCurrentUser } from '@/lib/server-utils';

/**
 * 获取取件历史
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return errorResponse('未登录', 401);
    }

    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    let where: any = {};

    // 用户只能看到自己的记录
    if (user.role === 'USER') {
      where.userId = user.id;
    } else if (userId) {
      // 管理员/快递员可以查看指定用户
      where.userId = userId;
    }

    const pickups = await prisma.pickup.findMany({
      where,
      include: {
        package: true,
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return successResponse(pickups);
  } catch (error) {
    console.error('获取取件历史失败:', error);
    return errorResponse('获取取件历史失败', 500);
  }
}
