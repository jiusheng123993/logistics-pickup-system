'use client';

import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
      router.push('/');
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="text-gray-600 hover:text-red-600 transition-colors"
    >
      退出登录
    </button>
  );
}
