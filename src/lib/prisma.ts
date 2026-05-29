import { PrismaClient } from '@prisma/client';

/**
 * Prisma 客户端单例工厂
 * 
 * 在开发环境中使用单例模式，避免热重载时创建多个数据库连接
 */
const prismaClientSingleton = () => {
  return new PrismaClient();
};

// 全局类型声明，用于存储 Prisma 客户端实例
declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

/**
 * Prisma 客户端实例
 * 
 * 生产环境：每次导入创建新实例
 * 开发环境：复用全局单例，避免连接泄漏
 */
const prisma = globalThis.prisma ?? prismaClientSingleton();

export default prisma;

// 开发环境下将实例挂载到全局对象
if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}
