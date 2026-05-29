import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api';
import { getCurrentUser } from '@/lib/server-utils';

/**
 * 获取统计数据
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return errorResponse('未登录', 401);
    }

    // 只有管理员可以访问统计数据
    if (user.role !== 'ADMIN') {
      return errorResponse('无权访问', 403);
    }

    // 获取总快递数
    const totalPackages = await prisma.package.count();

    // 获取待取件数
    const pendingPackages = await prisma.package.count({
      where: { status: 'IN_STORAGE' },
    });

    // 获取今日取件数
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const pickedUpToday = await prisma.package.count({
      where: {
        status: 'PICKED_UP',
        pickedUpAt: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    // 获取活跃用户数（最近7天有取件记录的用户）
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const activeUsers = await prisma.user.count({
      where: {
        pickups: {
          some: {
            createdAt: {
              gte: sevenDaysAgo,
            },
          },
        },
      },
    });

    // 获取每周数据（最近7天）
    const weeklyData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const dayName = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][date.getDay()];

      const inbound = await prisma.package.count({
        where: {
          createdAt: {
            gte: date,
            lt: nextDate,
          },
        },
      });

      const picked = await prisma.package.count({
        where: {
          pickedUpAt: {
            gte: date,
            lt: nextDate,
          },
        },
      });

      weeklyData.push({
        day: dayName,
        date: date.toISOString().split('T')[0],
        inbound,
        picked,
      });
    }

    // 获取状态分布
    const statusDistribution = await prisma.package.groupBy({
      by: ['status'],
      _count: {
        id: true,
      },
    });

    const statusMap: Record<string, number> = {
      PENDING: 0,
      IN_STORAGE: 0,
      PICKED_UP: 0,
      EXPIRED: 0,
      RETURNED: 0,
    };

    statusDistribution.forEach((item) => {
      statusMap[item.status] = item._count.id;
    });

    return successResponse({
      totalPackages,
      pendingPackages,
      pickedUpToday,
      activeUsers,
      weeklyData,
      statusDistribution: statusMap,
    });
  } catch (error) {
    console.error('获取统计数据失败:', error);
    return errorResponse('获取统计数据失败', 500);
  }
}
