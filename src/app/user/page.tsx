'use client';

import { useState, useEffect } from 'react';
import { packagesApi } from '@/lib/api-client';
import { Package } from '@/types';

export default function UserDashboard() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    try {
      setLoading(true);
      const response = await packagesApi.getList();
      
      if (response.success && response.data) {
        setPackages(response.data);
      } else {
        setError(response.error || '加载失败');
      }
    } catch (err) {
      setError('加载失败');
    } finally {
      setLoading(false);
    }
  };

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

  const totalCount = packages.length;
  const pendingCount = packages.filter(p => p.status === 'IN_STORAGE').length;
  const pickedCount = packages.filter(p => p.status === 'PICKED_UP').length;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <p className="text-gray-500">加载中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">我的快递</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <div className="text-3xl font-bold text-blue-600">{totalCount}</div>
          <div className="text-gray-600">全部快递</div>
        </div>
        <div className="card">
          <div className="text-3xl font-bold text-yellow-600">{pendingCount}</div>
          <div className="text-gray-600">待取件</div>
        </div>
        <div className="card">
          <div className="text-3xl font-bold text-green-600">{pickedCount}</div>
          <div className="text-gray-600">已取件</div>
        </div>
      </div>

      {packages.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <p className="text-gray-500">暂无快递</p>
        </div>
      ) : (
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
                      {pkg.storageLocation && <div>存放位置: {pkg.storageLocation}</div>}
                      {pkg.arrivedAt && <div>到达时间: {new Date(pkg.arrivedAt).toLocaleString()}</div>}
                    </div>
                  )}
                  {pkg.status === 'PICKED_UP' && pkg.pickedUpAt && (
                    <div className="text-gray-600">
                      取件时间: {new Date(pkg.pickedUpAt).toLocaleString()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
