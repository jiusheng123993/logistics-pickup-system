import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { parseSessionToken } from '@/lib/session';

/**
 * 认证中间件
 * 
 * 功能：验证用户会话和权限，控制路由访问
 * 
 * 公共路径：无需登录即可访问
 * 用户路径：需要USER/COURIER/ADMIN角色
 * 快递员路径：需要COURIER/ADMIN角色
 * 管理员路径：仅ADMIN角色可访问
 */
export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const token = request.cookies.get('auth_token')?.value;

  console.log('[Middleware] 访问路径:', path);
  console.log('[Middleware] Token存在:', !!token);

  // 公共路径配置
  const publicPaths = ['/', '/login', '/register', '/test-login', '/simple-test'];
  const userPaths = ['/user', '/user/pickup', '/user/history'];
  const courierPaths = ['/courier', '/courier/inbound'];
  const adminPaths = ['/admin', '/admin/packages', '/admin/users'];

  // 公共路径直接放行
  if (publicPaths.includes(path)) {
    console.log('[Middleware] 公共路径，放行');
    return NextResponse.next();
  }

  // 无token跳转到登录页
  if (!token) {
    console.log('[Middleware] 无token，跳转到登录页');
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 解析token
  const payload = parseSessionToken(token);
  console.log('[Middleware] Token解析结果:', payload);
  
  if (!payload) {
    console.log('[Middleware] Token无效，跳转到登录页');
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const userRole = payload.role;
  console.log('[Middleware] 用户角色:', userRole);

  // 验证用户路径权限
  if (userPaths.some(p => path.startsWith(p)) && !['USER', 'COURIER', 'ADMIN'].includes(userRole)) {
    console.log('[Middleware] 用户路径权限不足');
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 验证快递员路径权限
  if (courierPaths.some(p => path.startsWith(p)) && !['COURIER', 'ADMIN'].includes(userRole)) {
    console.log('[Middleware] 快递员路径权限不足');
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 验证管理员路径权限
  if (adminPaths.some(p => path.startsWith(p)) && userRole !== 'ADMIN') {
    console.log('[Middleware] 管理员路径权限不足');
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 权限验证通过
  console.log('[Middleware] 权限验证通过，放行');
  return NextResponse.next();
}

export const config = {
  matcher: ['/user/:path*', '/courier/:path*', '/admin/:path*'],
};
