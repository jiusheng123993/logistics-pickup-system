'use client';

import { useState } from 'react';

const mockStats = {
  totalPackages: 156,
  pendingPackages: 23,
  pickedUpToday: 45,
  activeUsers: 89,
};

const weeklyData = [
  { day: '周一', inbound: 25, picked: 20 },
  { day: '周二', inbound: 30, picked: 28 },
  { day: '周三', inbound: 28, picked: 25 },
  { day: '周四', inbound: 35, picked: 32 },
  { day: '周五', inbound: 40, picked: 38 },
  { day: '周六', inbound: 50, picked: 45 },
  { day: '周日', inbound: 38, picked: 35 },
];

export default function AdminDashboard() {
  const [stats] = useState(mockStats);

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
            {weeklyData.map((item) => (
              <div key={item.day} className="flex items-center gap-4">
                <div className="w-12 text-sm text-gray-600">{item.day}</div>
                <div className="flex-1 flex gap-2">
                  <div className="flex-1">
                    <div className="flex justify-between text-xs mb-1">
                      <span>入库</span>
                      <span>{item.inbound}</span>
                    </div>
                    <div className="h-3 bg-blue-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${(item.inbound / 50) * 100}%` }}
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
                        style={{ width: `${(item.picked / 50) * 100}%` }}
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
                <span className="font-semibold">23</span>
              </div>
              <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-yellow-500 rounded-full" style={{ width: '15%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">待取件</span>
                <span className="font-semibold">45</span>
              </div>
              <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: '29%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">已取件</span>
                <span className="font-semibold">88</span>
              </div>
              <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: '56%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
