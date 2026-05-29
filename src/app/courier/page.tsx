'use client';

import { useState, useEffect } from 'react';
import { packagesApi } from '@/lib/api-client';
import { Package } from '@/types';

export default function CourierDashboard() {
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

  const totalCount = packages.length;
  const pendingCount = packages.filter(p => p.status === 'PENDING').length;
  const inStorageCount = packages.filter(p => p.status === 'IN_STORAGE').length;

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
      <h1 className="text-2xl font-bold text-gray-900 mb-6">我的派件</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <div className="text-3xl font-bold text-blue-600">{totalCount}</div>
          <div className="text-gray-600">全部快递</div>
        </div>
        <div className="card">
          <div className="text-3xl font-bold text-yellow-600">{pendingCount}</div>
          <div className="text-gray-600">待入库</div>
        </div>
        <div className="card">
          <div className="text-3xl font-bold text-blue-600">{inStorageCount}</div>
          <div className="text-gray-600">已入库</div>
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
                  <div className="text-gray-600 space-y-1">
                    <div>收件人: {pkg.recipientName} ({pkg.recipientPhone})</div>
                    {pkg.status === 'IN_STORAGE' && (
                      <>
                        <div>取件码: {pkg.pickupCode}</div>
                        {pkg.storageLocation && <div>存放位置: {pkg.storageLocation}</div>}
                      </>
                    )}
                    <div>入库时间: {new Date(pkg.createdAt).toLocaleString()}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
