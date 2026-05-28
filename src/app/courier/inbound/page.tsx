'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function InboundPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    trackingNumber: '',
    recipientName: '',
    recipientPhone: '',
    storageLocation: '',
    notes: '',
  });
  const [scanning, setScanning] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('入库成功！取件码: ABC123');
    router.push('/courier');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const generatePickupCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">快递入库</h1>
      
      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setScanning(!scanning)}
              className="btn btn-secondary flex-1"
            >
              {scanning ? '取消扫码' : '扫码运单号'}
            </button>
          </div>

          {scanning && (
            <div className="p-6 bg-gray-100 rounded-lg text-center">
              <div className="w-40 h-40 border-4 border-dashed border-gray-400 rounded-lg mx-auto flex items-center justify-center mb-3">
                <div className="text-gray-500 text-sm">扫描区域</div>
              </div>
              <p className="text-gray-600 text-sm">请将运单号条码对准扫描区域</p>
            </div>
          )}

          <div>
            <label htmlFor="trackingNumber" className="block text-sm font-medium text-gray-700 mb-1">
              运单号 *
            </label>
            <input
              id="trackingNumber"
              name="trackingNumber"
              type="text"
              required
              value={formData.trackingNumber}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="请输入运单号"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="recipientName" className="block text-sm font-medium text-gray-700 mb-1">
                收件人姓名 *
              </label>
              <input
                id="recipientName"
                name="recipientName"
                type="text"
                required
                value={formData.recipientName}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="请输入收件人姓名"
              />
            </div>
            <div>
              <label htmlFor="recipientPhone" className="block text-sm font-medium text-gray-700 mb-1">
                收件人手机号 *
              </label>
              <input
                id="recipientPhone"
                name="recipientPhone"
                type="tel"
                required
                value={formData.recipientPhone}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="请输入手机号"
              />
            </div>
          </div>

          <div>
            <label htmlFor="storageLocation" className="block text-sm font-medium text-gray-700 mb-1">
              存放位置
            </label>
            <input
              id="storageLocation"
              name="storageLocation"
              type="text"
              value={formData.storageLocation}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="例如：A区-1号柜"
            />
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              备注
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              value={formData.notes}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="可选备注信息"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="btn btn-secondary flex-1"
            >
              取消
            </button>
            <button
              type="submit"
              className="btn btn-primary flex-1"
            >
              确认入库
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
