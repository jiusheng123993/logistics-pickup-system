'use client';

import { useState, useEffect } from 'react';
import { statsApi } from '@/lib/api-client';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await statsApi.getStats();
      
      if (response.success && response.data) {
        setStats(response.data);
      } else {
        setError(response.error || '加载失败');
      }
    } catch (err) {
      setError('加载失败');
    } finally {
      setLoading(false);
    }
  };

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
      <h1 className="text-2xl font-bold text-gray-900 mb-6">数据概览</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="text-3xl font-bold text-blue-600">{stats.totalPackages}</div>
          <div className="text-gray-600">总快递数</div>
        </div>
        <div className="card">
          <div className="text-3xl font-bold text-yellow-600">{stats.pendingPackages}</div>
          <div className="text-gray-600">待取件</div>
        </div>
        <div className="card">
          <div className="text-3xl font-bold text-green-600">{stats.pickedUpToday}</div>
          <div className="text-gray-600">今日取件</div>
        </div>
        <div className="card">
          <div className="text-3xl font-bold text-purple-600">{stats.activeUsers}</div>
          <div className="text-gray-600">活跃用户</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">本周数据趋势</h3>
          <div className="space-y-3">
            {stats.weeklyData?.map((item: any, index: number) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-12 text-sm text-gray-500">{item.day}</div>
                <div className="flex-1 flex gap-2">
                  <div className="flex-1">
                    <div className="flex justify-between text-xs mb-1">
                      <span>入库</span>
                      <span>{item.inbound}</span>
                    </div>
                    <div className="h-3 bg-blue-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${Math.min((item.inbound / 50) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between text-xs mb-1">
                      <span>取件</span>
                      <span>{item.picked}</span>
                    </div>
                    <div className="h-3 bg-green-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500 rounded-full"
                        style={{ width: `${Math.min((item.picked / 50) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4">快递状态分布</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">待入库</span>
                <span className="font-semibold">{stats.statusDistribution?.PENDING || 0}</span>
              </div>
              <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-yellow-500 rounded-full" 
                  style={{ width: `${Math.min(((stats.statusDistribution?.PENDING || 0) / Math.max(stats.totalPackages, 1)) * 100, 100)}%` }} 
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">待取件</span>
                <span className="font-semibold">{stats.statusDistribution?.IN_STORAGE || 0}</span>
              </div>
              <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 rounded-full" 
                  style={{ width: `${Math.min(((stats.statusDistribution?.IN_STORAGE || 0) / Math.max(stats.totalPackages, 1)) * 100, 100)}%` }} 
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">已取件</span>
                <span className="font-semibold">{stats.statusDistribution?.PICKED_UP || 0}</span>
              </div>
              <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500 rounded-full" 
                  style={{ width: `${Math.min(((stats.statusDistribution?.PICKED_UP || 0) / Math.max(stats.totalPackages, 1)) * 100, 100)}%` }} 
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
