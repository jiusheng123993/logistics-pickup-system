'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

/**
 * 用户登录页面
 * 
 * 功能：用户登录，验证凭据后跳转
 */
export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  /**
   * 处理登录表单提交
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('===== 登录流程开始 =====');
      console.log('1. 开始登录请求...', { phone });
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password }),
      });

      console.log('2. 登录响应状态:', response.status);
      const data = await response.json();
      console.log('3. 登录响应数据:', data);

      if (!response.ok) {
        throw new Error(data.error || '登录失败');
      }

      // 根据用户角色跳转
      const userRole = data.role;
      let targetPath = '/';
      if (userRole === 'USER') {
        targetPath = '/user';
      } else if (userRole === 'COURIER') {
        targetPath = '/courier';
      } else {
        targetPath = '/admin';
      }
      
      console.log('4. 确定目标路径:', targetPath);
      console.log('5. 当前 cookie:', document.cookie);
      console.log('6. 执行跳转...');
      
      setError(`登录成功！正在跳转到 ${targetPath}...`);
      
      // 延迟一下跳转，让用户看到成功消息
      setTimeout(() => {
        console.log('7. 执行 window.location.href =', targetPath);
        window.location.href = targetPath;
      }, 500);
      
    } catch (err) {
      console.error('===== 登录错误 =====', err);
      setError(err instanceof Error ? err.message : '登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            登录系统
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            请输入您的凭据登录
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* 手机号 */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                手机号
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-primary focus:border-primary"
                placeholder="请输入手机号"
              />
            </div>
            {/* 密码 */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                密码
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-primary focus:border-primary"
                placeholder="请输入密码"
              />
            </div>
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* 登录按钮 */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '登录中...' : '登录'}
            </button>
          </div>

          {/* 注册链接 */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              没有账户？{' '}
              <Link href="/register" className="font-medium text-primary hover:text-blue-600">
                立即注册
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
