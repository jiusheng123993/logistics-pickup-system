'use client';

import { useState, useEffect } from 'react';
import { packagesApi } from '@/lib/api-client';
import { Package, PackageStatus } from '@/types';
import { useToast } from '@/components/Toast';

/**
 * 快递管理页面
 * 
 * 功能：
 * - 查看快递列表
 * - 搜索快递
 * - 添加新快递
 * - 编辑快递
 * - 删除快递
 */
export default function PackagesPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [formData, setFormData] = useState({
    trackingNumber: '',
    recipientName: '',
    recipientPhone: '',
    status: 'IN_STORAGE' as PackageStatus,
    storageLocation: '',
    notes: '',
  });
  const [formLoading, setFormLoading] = useState(false);

  const { showToast } = useToast();

  // 加载快递列表
  useEffect(() => {
    loadPackages();
  }, []);

  /**
   * 加载快递列表
   */
  const loadPackages = async () => {
    try {
      setLoading(true);
      const response = await packagesApi.getList({ search });
      
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

  /**
   * 搜索快递
   */
  const handleSearch = () => {
    loadPackages();
  };

  /**
   * 打开添加快递模态框
   */
  const handleCreate = () => {
    setEditingPackage(null);
    setFormData({
      trackingNumber: '',
      recipientName: '',
      recipientPhone: '',
      status: 'IN_STORAGE',
      storageLocation: '',
      notes: '',
    });
    setShowModal(true);
  };

  /**
   * 打开编辑快递模态框
   */
  const handleEdit = (pkg: Package) => {
    setEditingPackage(pkg);
    setFormData({
      trackingNumber: pkg.trackingNumber,
      recipientName: pkg.recipientName,
      recipientPhone: pkg.recipientPhone,
      status: pkg.status,
      storageLocation: pkg.storageLocation || '',
      notes: pkg.notes || '',
    });
    setShowModal(true);
  };

  /**
   * 删除快递
   */
  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个快递吗？')) {
      return;
    }

    try {
      const response = await packagesApi.delete(id);
      
      if (response.success) {
        showToast('删除成功', 'success');
        loadPackages();
      } else {
        showToast(response.error || '删除失败', 'error');
      }
    } catch (err) {
      showToast('删除失败', 'error');
    }
  };

  /**
   * 提交表单（创建或更新）
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 验证必填字段
    if (!formData.trackingNumber || !formData.recipientName || !formData.recipientPhone) {
      showToast('请填写必填字段', 'error');
      return;
    }

    try {
      setFormLoading(true);
      
      let response;
      if (editingPackage) {
        // 更新快递
        response = await packagesApi.update(editingPackage.id, formData);
      } else {
        // 创建快递
        response = await packagesApi.create(formData);
      }

      if (response.success) {
        showToast(editingPackage ? '更新成功' : '创建成功', 'success');
        setShowModal(false);
        loadPackages();
      } else {
        showToast(response.error || '操作失败', 'error');
      }
    } catch (err) {
      showToast('操作失败', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  /**
   * 获取状态文本
   */
  const getStatusText = (status: string) => {
    const map: Record<string, string> = {
      PENDING: '待入库',
      IN_STORAGE: '待取件',
      PICKED_UP: '已取件',
      EXPIRED: '已过期',
    };
    return map[status] || status;
  };

  /**
   * 获取状态颜色
   */
  const getStatusColor = (status: string) => {
    const map: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      IN_STORAGE: 'bg-blue-100 text-blue-800',
      PICKED_UP: 'bg-green-100 text-green-800',
      EXPIRED: 'bg-red-100 text-red-800',
    };
    return map[status] || 'bg-gray-100 text-gray-800';
  };

  // 加载状态
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <p className="text-gray-500">加载中...</p>
        </div>
      </div>
    );
  }

  // 错误状态
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
      {/* 页面头部 */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">快递管理</h1>
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="搜索运单号或手机号..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            onClick={handleSearch}
            className="btn btn-primary"
          >
            搜索
          </button>
          <button
            onClick={handleCreate}
            className="btn btn-primary"
          >
            添加快递
          </button>
        </div>
      </div>

      {/* 快递列表 */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
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
                    {pkg.pickedUpAt ? new Date(pkg.pickedUpAt).toLocaleString() : 
                     pkg.arrivedAt ? new Date(pkg.arrivedAt).toLocaleString() : 
                     new Date(pkg.createdAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEdit(pkg)}
                      className="text-primary hover:text-blue-800 mr-3"
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => handleDelete(pkg.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      删除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 添加/编辑模态框 */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold mb-4">
              {editingPackage ? '编辑快递' : '添加快递'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* 运单号 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  运单号 *
                </label>
                <input
                  type="text"
                  value={formData.trackingNumber}
                  onChange={(e) => setFormData({ ...formData, trackingNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              {/* 收件人姓名 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  收件人姓名 *
                </label>
                <input
                  type="text"
                  value={formData.recipientName}
                  onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              {/* 收件人手机 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  收件人手机 *
                </label>
                <input
                  type="text"
                  value={formData.recipientPhone}
                  onChange={(e) => setFormData({ ...formData, recipientPhone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              {/* 状态（仅编辑时显示） */}
              {editingPackage && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    状态
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as PackageStatus })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="PENDING">待入库</option>
                    <option value="IN_STORAGE">待取件</option>
                    <option value="PICKED_UP">已取件</option>
                    <option value="EXPIRED">已过期</option>
                  </select>
                </div>
              )}

              {/* 存放位置 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  存放位置
                </label>
                <input
                  type="text"
                  value={formData.storageLocation}
                  onChange={(e) => setFormData({ ...formData, storageLocation: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* 备注 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  备注
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={3}
                />
              </div>

              {/* 操作按钮 */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  disabled={formLoading}
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
                  disabled={formLoading}
                >
                  {formLoading ? '处理中...' : (editingPackage ? '更新' : '创建')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
