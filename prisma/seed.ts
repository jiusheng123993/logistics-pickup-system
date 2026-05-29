import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('开始初始化数据库...');
  
  // 清空现有数据（按正确顺序删除，避免外键约束）
  console.log('清空现有数据...');
  await prisma.notification.deleteMany();
  await prisma.pickup.deleteMany();
  await prisma.package.deleteMany();
  await prisma.user.deleteMany();

  // 创建管理员用户
  const hashedAdminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.create({
    data: {
      name: '系统管理员',
      phone: '13800000000',
      email: 'admin@example.com',
      password: hashedAdminPassword,
      role: 'ADMIN',
    },
  });
  console.log('创建管理员用户:', admin.phone);

  // 创建快递员用户
  const hashedCourierPassword = await bcrypt.hash('courier123', 12);
  const courier = await prisma.user.create({
    data: {
      name: '快递员小王',
      phone: '13800000001',
      email: 'courier@example.com',
      password: hashedCourierPassword,
      role: 'COURIER',
    },
  });
  console.log('创建快递员用户:', courier.phone);

  // 创建普通用户
  const hashedUserPassword = await bcrypt.hash('user123', 12);
  const user = await prisma.user.create({
    data: {
      name: '用户张三',
      phone: '13800000002',
      email: 'user@example.com',
      password: hashedUserPassword,
      role: 'USER',
    },
  });
  console.log('创建普通用户:', user.phone);

  // 创建一些示例快递
  const packagesData = [
    {
      trackingNumber: 'SF202401010001',
      recipientName: '用户张三',
      recipientPhone: '13800000002',
      pickupCode: 'A1B2C3',
      status: 'IN_STORAGE',
      storageLocation: 'A区-1号柜',
      arrivedAt: new Date(),
      courierId: courier.id,
    },
    {
      trackingNumber: 'SF202401010002',
      recipientName: '快递员小王',
      recipientPhone: '13800000001',
      pickupCode: 'D4E5F6',
      status: 'IN_STORAGE',
      storageLocation: 'A区-2号柜',
      arrivedAt: new Date(),
      courierId: courier.id,
    },
    {
      trackingNumber: 'SF202401010003',
      recipientName: '系统管理员',
      recipientPhone: '13800000000',
      pickupCode: 'G7H8I9',
      status: 'PICKED_UP',
      storageLocation: 'B区-1号柜',
      arrivedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      pickedUpAt: new Date(),
      courierId: courier.id,
    },
  ];

  for (const pkg of packagesData) {
    const createdPackage = await prisma.package.create({
      data: pkg,
    });
    console.log('创建快递:', createdPackage.trackingNumber);
  }

  console.log('数据库初始化完成!');
  console.log('');
  console.log('测试账号:');
  console.log('管理员: 13800000000 / admin123');
  console.log('快递员: 13800000001 / courier123');
  console.log('用户: 13800000002 / user123');
}

main()
  .catch((e) => {
    console.error('初始化失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
