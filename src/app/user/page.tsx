'use client';

import { useState } from 'react';

const mockPackages = [
  {
    id: '1',
    trackingNumber: 'SF1234567890',
    status: 'IN_STORAGE',
    pickupCode: 'A1B2C3',
    storageLocation: 'A区-1号柜',
    arrivedAt: '2024-01-15 10:30:00',
  },
  {
    id: '2',
    trackingNumber: 'YT9876543210',
    status: 'PICKED_UP',
    pickupCode: 'D4E5F6',
    pickedUpAt: '2024-01-14 15:20:00',
  },
];

export default function UserDashboard() {
  const [packages] = useState(mockPackages);

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
      <h1 className="text-2xl font-bold text-gray-900 mb-6">我的快递</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <div className="text-3xl font-bold text-blue-600">2</div>
          <div className="text-gray-600">全部快递</div>
        </div>
        <div className="card">
          <div className="text-3xl font-bold text-yellow-600">1</div>
          <div className="text-gray-600">待取件</div>
        </div>
        <div className="card">
          <div className="text-3xl font-bold text-green-600">1</div>
          <div className="text-gray-600">已取件</div>
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
                {pkg.status === 'IN_STORAGE' && (
                  <div className="text-gray-600 mb-2">
                    <div>取件码: <span className="text-xl font-bold text-primary">{pkg.pickupCode}</span></div>
                    <div>存放位置: {pkg.storageLocation}</div>
                    <div>到达时间: {pkg.arrivedAt}</div>
                  </div>
                )}
                {pkg.status === 'PICKED_UP' && (
                  <div className="text-gray-600">
                    取件时间: {pkg.pickedUpAt}
                  </div>
                )}
              </div>
              {pkg.status === 'IN_STORAGE' && (
                <button className="btn btn-primary">去取件</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
