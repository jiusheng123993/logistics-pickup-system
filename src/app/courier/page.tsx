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
    createdAt: '2024-01-15 10:30:00',
  },
  {
    id: '2',
    trackingNumber: 'YT9876543210',
    recipientName: '李四',
    recipientPhone: '13900139000',
    status: 'PENDING',
    createdAt: '2024-01-15 11:00:00',
  },
];

export default function CourierDashboard() {
  const [packages] = useState(mockPackages);

  const getStatusText = (status: string) => {
    const map: Record<string, string> = {
      PENDING: '待入库',
      IN_STORAGE: '已入库',
      PICKED_UP: '已取件',
    };
    return map[status] || status;
  };

  const getStatusColor = (status: string) => {
    const map: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      IN_STORAGE: 'bg-blue-100 text-blue-800',
      PICKED_UP: 'bg-green-100 text-green-800',
    };
    return map[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">我的派件</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <div className="text-3xl font-bold text-blue-600">2</div>
          <div className="text-gray-600">全部快递</div>
        </div>
        <div className="card">
          <div className="text-3xl font-bold text-yellow-600">1</div>
          <div className="text-gray-600">待入库</div>
        </div>
        <div className="card">
          <div className="text-3xl font-bold text-blue-600">1</div>
          <div className="text-gray-600">已入库</div>
        </div>
      </div>

      <div className="space-y-4">
        {packages.map((pkg) => (
          <div key={pkg.id} className="card">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-lg font-semibold">运单号: {pkg.trackingNumber}</span>
                  <span className={`px-2 py-1 rounded text-sm ${getStatusColor(pkg.status)}`}>
                    {getStatusText(pkg.status)}
                  </span>
                </div>
                <div className="text-gray-600 space-y-1">
                  <div>收件人: {pkg.recipientName} ({pkg.recipientPhone})</div>
                  {pkg.status === 'IN_STORAGE' && (
                    <>
                      <div>取件码: {pkg.pickupCode}</div>
                      <div>存放位置: {pkg.storageLocation}</div>
                    </>
                  )}
                  <div>入库时间: {pkg.createdAt}</div>
                </div>
              </div>
              {pkg.status === 'PENDING' && (
                <button className="btn btn-primary">去入库</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
