'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PickupPage() {
  const [pickupCode, setPickupCode] = useState('');
  const [scanning, setScanning] = useState(false);
  const router = useRouter();

  const handlePickup = (e: React.FormEvent) => {
    e.preventDefault();
    alert('取件成功！');
    router.push('/user');
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">快速取件</h1>
      
      <div className="card">
        <form onSubmit={handlePickup} className="space-y-6">
          <div>
            <label htmlFor="pickupCode" className="block text-sm font-medium text-gray-700 mb-2">
              取件码
            </label>
            <input
              id="pickupCode"
              type="text"
              value={pickupCode}
              onChange={(e) => setPickupCode(e.target.value)}
              placeholder="请输入6位取件码"
              className="w-full px-4 py-3 text-xl text-center tracking-widest border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary"
              maxLength={6}
            />
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setScanning(!scanning)}
              className="flex-1 btn btn-secondary"
            >
              {scanning ? '取消扫码' : '扫码取件'}
            </button>
            <button
              type="submit"
              className="flex-1 btn btn-primary"
              disabled={pickupCode.length < 6}
            >
              确认取件
            </button>
          </div>
        </form>

        {scanning && (
          <div className="mt-6 p-8 bg-gray-100 rounded-lg text-center">
            <div className="w-48 h-48 border-4 border-dashed border-gray-400 rounded-lg mx-auto flex items-center justify-center mb-4">
              <div className="text-gray-500">扫描区域</div>
            </div>
            <p className="text-gray-600">请将取件码对准扫描区域</p>
          </div>
        )}
      </div>
    </div>
  );
}
