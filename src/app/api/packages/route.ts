import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse, validateRequiredFields } from '@/lib/api';
import { generatePickupCode, validatePhone, validateTrackingNumber } from '@/lib/auth';
import { getCurrentUser } from '@/lib/server-utils';

/**
 * 获取快递列表
 * 支持按用户、快递员、状态筛选
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return errorResponse('未登录', 401);
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const courierId = searchParams.get('courierId');
    const recipientPhone = searchParams.get('recipientPhone');

    let where: any = {};

    // 根据角色过滤数据
    if (user.role === 'USER') {
      // 用户只能看到自己的快递
      where.recipientPhone = user.phone;
    } else if (user.role === 'COURIER') {
      // 快递员可以看到自己负责的快递
      where.courierId = user.id;
    }

    // 可选过滤条件
    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { trackingNumber: { contains: search } },
        { recipientPhone: { contains: search } },
        { recipientName: { contains: search } },
      ];
    }

    if (courierId) {
      where.courierId = courierId;
    }

    if (recipientPhone) {
      where.recipientPhone = recipientPhone;
    }

    const packages = await prisma.package.findMany({
      where,
      include: {
        courier: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return successResponse(packages);
  } catch (error) {
    console.error('获取快递列表失败:', error);
    return errorResponse('获取快递列表失败', 500);
  }
}

/**
 * 创建快递（入库）
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return errorResponse('未登录', 401);
    }

    // 只有快递员和管理员可以入库
    if (user.role !== 'COURIER' && user.role !== 'ADMIN') {
      return errorResponse('无权操作', 403);
    }

    const data = await request.json();

    // 验证必需字段
    const requiredFields = ['trackingNumber', 'recipientName', 'recipientPhone'];
    const fieldErrors = validateRequiredFields(data, requiredFields);
    if (fieldErrors.length > 0) {
      return errorResponse(fieldErrors.join(', '), 400);
    }

    // 验证格式
    if (!validateTrackingNumber(data.trackingNumber)) {
      return errorResponse('运单号格式不正确', 400);
    }

    if (!validatePhone(data.recipientPhone)) {
      return errorResponse('手机号格式不正确', 400);
    }

    // 检查运单号是否已存在
    const existingPackage = await prisma.package.findUnique({
      where: { trackingNumber: data.trackingNumber },
    });

    if (existingPackage) {
      return errorResponse('该运单号已存在', 400);
    }

    // 生成取件码
    const pickupCode = generatePickupCode();

    // 创建快递
    const pkg = await prisma.package.create({
      data: {
        trackingNumber: data.trackingNumber,
        recipientName: data.recipientName,
        recipientPhone: data.recipientPhone,
        pickupCode,
        status: 'IN_STORAGE',
        storageLocation: data.storageLocation,
        notes: data.notes,
        courierId: user.id,
        arrivedAt: new Date(),
      },
    });

    return successResponse(pkg, '入库成功', 201);
  } catch (error) {
    console.error('创建快递失败:', error);
    return errorResponse('创建快递失败', 500);
  }
}

/**
 * 更新快递
 */
export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return errorResponse('未登录', 401);
    }

    // 只有快递员和管理员可以更新
    if (user.role !== 'COURIER' && user.role !== 'ADMIN') {
      return errorResponse('无权操作', 403);
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return errorResponse('缺少快递ID', 400);
    }

    const data = await request.json();

    // 验证快递是否存在
    const existingPackage = await prisma.package.findUnique({
      where: { id },
    });

    if (!existingPackage) {
      return errorResponse('快递不存在', 404);
    }

    // 如果要更新运单号，检查是否已被其他快递使用
    if (data.trackingNumber && data.trackingNumber !== existingPackage.trackingNumber) {
      const duplicatePackage = await prisma.package.findUnique({
        where: { trackingNumber: data.trackingNumber },
      });

      if (duplicatePackage) {
        return errorResponse('该运单号已存在', 400);
      }

      if (!validateTrackingNumber(data.trackingNumber)) {
        return errorResponse('运单号格式不正确', 400);
      }
    }

    // 如果要更新手机号，验证格式
    if (data.recipientPhone && !validatePhone(data.recipientPhone)) {
      return errorResponse('手机号格式不正确', 400);
    }

    // 更新快递
    const updatedPackage = await prisma.package.update({
      where: { id },
      data: {
        trackingNumber: data.trackingNumber,
        recipientName: data.recipientName,
        recipientPhone: data.recipientPhone,
        status: data.status,
        storageLocation: data.storageLocation,
        notes: data.notes,
      },
    });

    return successResponse(updatedPackage, '更新成功');
  } catch (error) {
    console.error('更新快递失败:', error);
    return errorResponse('更新快递失败', 500);
  }
}

/**
 * 删除快递
 */
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return errorResponse('未登录', 401);
    }

    // 只有管理员可以删除
    if (user.role !== 'ADMIN') {
      return errorResponse('无权操作', 403);
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return errorResponse('缺少快递ID', 400);
    }

    // 验证快递是否存在
    const existingPackage = await prisma.package.findUnique({
      where: { id },
    });

    if (!existingPackage) {
      return errorResponse('快递不存在', 404);
    }

    // 删除相关的取件记录和通知（级联删除）
    await prisma.pickup.deleteMany({
      where: { packageId: id },
    });

    await prisma.notification.deleteMany({
      where: { packageId: id },
    });

    // 删除快递
    await prisma.package.delete({
      where: { id },
    });

    return successResponse(null, '删除成功');
  } catch (error) {
    console.error('删除快递失败:', error);
    return errorResponse('删除快递失败', 500);
  }
}
