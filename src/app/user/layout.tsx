import Link from 'next/link';

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-2xl font-bold text-gray-900">
                快递取件系统
              </Link>
              <span className="text-gray-400">|</span>
              <span className="text-gray-600">用户中心</span>
            </div>
            <nav className="flex gap-6">
              <Link href="/user" className="text-gray-600 hover:text-primary">我的快递</Link>
              <Link href="/user/pickup" className="text-gray-600 hover:text-primary">取件</Link>
              <Link href="/user/history" className="text-gray-600 hover:text-primary">取件记录</Link>
              <Link href="/" className="text-gray-600 hover:text-primary">退出</Link>
            </nav>
          </div>
        </div>
      </header>
      <main className="flex-1 bg-gray-50">{children}</main>
    </div>
  );
}
