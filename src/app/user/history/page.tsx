'use client';

import { useState } from 'react';

const mockHistory = [
  {
    id: '1',
    trackingNumber: 'YT9876543210',
    pickupCode: 'D4E5F6',
    pickedUpAt: '2024-01-14 15:20:00',
    storageLocation: 'B区-3号柜',
  },
  {
    id: '2',
    trackingNumber: 'ZT5678901234',
    pickupCode: 'G7H8I9',
    pickedUpAt: '2024-01-10 09:15:00',
    storageLocation: 'A区-5号柜',
  },
];

export default function HistoryPage() {
  const [history] = useState(mockHistory);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">取件记录</h1>
      
      <div className="space-y-4">
        {history.map((item) => (
          <div key={item.id} className="card">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-lg font-semibold mb-2">
                  运单号: {item.trackingNumber}
                </div>
                <div className="text-gray-600 space-y-1">
                  <div>取件码: {item.pickupCode}</div>
                  <div>存放位置: {item.storageLocation}</div>
                  <div>取件时间: {item.pickedUpAt}</div>
                </div>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
