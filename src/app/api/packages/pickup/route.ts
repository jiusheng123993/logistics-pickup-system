import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse, validateRequiredFields } from '@/lib/api';
import { getCurrentUser } from '@/lib/server-utils';

/**
 * 取件操作
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return errorResponse('未登录', 401);
    }

    const data = await request.json();

    // 验证必需字段
    const fieldErrors = validateRequiredFields(data, ['pickupCode']);
    if (fieldErrors.length > 0) {
      return errorResponse(fieldErrors.join(', '), 400);
    }

    const { pickupCode, packageId } = data;

    // 查找快递
    let where: any = { pickupCode: pickupCode.toUpperCase() };
    
    if (packageId) {
      where = { id: packageId };
    }

    const pkg = await prisma.package.findFirst({
      where,
    });

    if (!pkg) {
      return errorResponse('取件码无效或快递不存在', 404);
    }

    // 验证状态
    if (pkg.status !== 'IN_STORAGE') {
      return errorResponse('该快递已被取走或不可取件', 400);
    }

    // 验证用户权限（用户只能取自己的快递）
    if (user.role === 'USER' && pkg.recipientPhone !== user.phone) {
      return errorResponse('无权取此快递', 403);
    }

    // 更新快递状态
    const updatedPackage = await prisma.package.update({
      where: { id: pkg.id },
      data: {
        status: 'PICKED_UP',
        pickedUpAt: new Date(),
      },
    });

    // 创建取件记录
    await prisma.pickup.create({
      data: {
        packageId: pkg.id,
        userId: user.id,
        pickupCode: pkg.pickupCode,
        verified: true,
      },
    });

    return successResponse(updatedPackage, '取件成功');
  } catch (error) {
    console.error('取件失败:', error);
    return errorResponse('取件失败', 500);
  }
}
