'use client';

import { useState } from 'react';

const mockPackages = [
  {
    id: '1',
    trackingNumber: 'SF1234567890',
    recipientName: '张三',
    recipientPhone: '13800138000',
    status: 'IN_STORAGE',
    pickupCode: 'A1B2C3',
    storageLocation: 'A区-1号柜',
    arrivedAt: '2024-01-15 10:30:00',
  },
  {
    id: '2',
    trackingNumber: 'YT9876543210',
    recipientName: '李四',
    recipientPhone: '13900139000',
    status: 'PICKED_UP',
    pickupCode: 'D4E5F6',
    pickedUpAt: '2024-01-14 15:20:00',
  },
  {
    id: '3',
    trackingNumber: 'ZT5678901234',
    recipientName: '王五',
    recipientPhone: '13700137000',
    status: 'PENDING',
    arrivedAt: '2024-01-15 11:00:00',
  },
];

export default function PackagesPage() {
  const [packages] = useState(mockPackages);
  const [search, setSearch] = useState('');

  const getStatusText = (status: string) => {
    const map: Record<string, string> = {
      PENDING: '待入库',
      IN_STORAGE: '待取件',
      PICKED_UP: '已取件',
      EXPIRED: '已过期',
    };
    return map[status] || status;
  };

  const getStatusColor = (status: string) => {
    const map: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      IN_STORAGE: 'bg-blue-100 text-blue-800',
      PICKED_UP: 'bg-green-100 text-green-800',
      EXPIRED: 'bg-red-100 text-red-800',
    };
    return map[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">快递管理</h1>
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="搜索运单号或手机号..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                运单号
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                收件人
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                状态
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                取件码
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                时间
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {packages.map((pkg) => (
              <tr key={pkg.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {pkg.trackingNumber}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {pkg.recipientName}<br/>
                  <span className="text-gray-400">{pkg.recipientPhone}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded text-xs ${getStatusColor(pkg.status)}`}>
                    {getStatusText(pkg.status)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {pkg.pickupCode || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {pkg.pickedUpAt || pkg.arrivedAt}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button className="text-primary hover:text-blue-800 mr-3">编辑</button>
                  <button className="text-red-600 hover:text-red-800">删除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
