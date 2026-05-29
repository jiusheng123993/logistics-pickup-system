import Link from 'next/link';
import LogoutButton from '@/components/LogoutButton';
import { ToastProvider } from '@/components/Toast';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <div className="min-h-screen flex flex-col">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <Link href="/" className="text-2xl font-bold text-gray-900">
                  快递取件系统
                </Link>
                <span className="text-gray-400">|</span>
                <span className="text-gray-600">管理后台</span>
              </div>
              <nav className="flex gap-6 items-center">
                <Link href="/admin" className="text-gray-600 hover:text-primary">数据概览</Link>
                <Link href="/admin/packages" className="text-gray-600 hover:text-primary">快递管理</Link>
                <Link href="/admin/users" className="text-gray-600 hover:text-primary">用户管理</Link>
                <LogoutButton />
              </nav>
            </div>
          </div>
        </header>
        <main className="flex-1 bg-gray-50">{children}</main>
      </div>
    </ToastProvider>
  );
}
