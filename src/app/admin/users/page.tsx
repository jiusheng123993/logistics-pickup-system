'use client';

import { useState, useEffect } from 'react';
import { usersApi } from '@/lib/api-client';
import { User, UserRole, UserWithCount } from '@/types';
import { useToast } from '@/components/Toast';

/**
 * 用户管理页面
 * 
 * 功能：
 * - 查看用户列表
 * - 按角色筛选用户
 * - 搜索用户
 * - 添加新用户
 * - 编辑用户
 * - 删除用户（不能删除自己）
 */
export default function UsersPage() {
  const [users, setUsers] = useState<UserWithCount[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserWithCount | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    role: 'USER' as UserRole,
  });
  const [formLoading, setFormLoading] = useState(false);

  const { showToast } = useToast();

  // 加载用户列表
  useEffect(() => {
    loadUsers();
  }, []);

  /**
   * 加载用户列表
   */
  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await usersApi.getList({ role: roleFilter, search });
      
      if (response.success && response.data) {
        setUsers(response.data);
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
   * 搜索/筛选用户
   */
  const handleSearch = () => {
    loadUsers();
  };

  /**
   * 打开添加用户模态框
   */
  const handleCreate = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      phone: '',
      email: '',
      password: '',
      role: 'USER',
    });
    setShowModal(true);
  };

  /**
   * 打开编辑用户模态框
   */
  const handleEdit = (user: UserWithCount) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      phone: user.phone,
      email: user.email || '',
      password: '', // 编辑时不显示密码
      role: user.role,
    });
    setShowModal(true);
  };

  /**
   * 删除用户
   */
  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个用户吗？')) {
      return;
    }

    try {
      const response = await usersApi.delete(id);
      
      if (response.success) {
        showToast('删除成功', 'success');
        loadUsers();
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
    if (!formData.name || !formData.phone) {
      showToast('请填写必填字段', 'error');
      return;
    }

    // 创建时密码必填
    if (!editingUser && !formData.password) {
      showToast('请设置密码', 'error');
      return;
    }

    try {
      setFormLoading(true);
      
      let response;
      if (editingUser) {
        // 更新用户（不发送密码）
        const { password, ...updateData } = formData;
        response = await usersApi.update(editingUser.id, updateData);
      } else {
        // 创建用户
        response = await usersApi.create(formData);
      }

      if (response.success) {
        showToast(editingUser ? '更新成功' : '创建成功', 'success');
        setShowModal(false);
        loadUsers();
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
   * 获取角色文本
   */
  const getRoleText = (role: string) => {
    const map: Record<string, string> = {
      USER: '用户',
      COURIER: '快递员',
      ADMIN: '管理员',
    };
    return map[role] || role;
  };

  /**
   * 获取角色颜色
   */
  const getRoleColor = (role: string) => {
    const map: Record<string, string> = {
      USER: 'bg-gray-100 text-gray-800',
      COURIER: 'bg-blue-100 text-blue-800',
      ADMIN: 'bg-purple-100 text-purple-800',
    };
    return map[role] || 'bg-gray-100 text-gray-800';
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
        <h1 className="text-2xl font-bold text-gray-900">用户管理</h1>
        <div className="flex gap-4">
          {/* 角色筛选 */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">全部角色</option>
            <option value="USER">用户</option>
            <option value="COURIER">快递员</option>
            <option value="ADMIN">管理员</option>
          </select>

          {/* 搜索框 */}
          <input
            type="text"
            placeholder="搜索用户..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />

          {/* 搜索按钮 */}
          <button
            onClick={handleSearch}
            className="btn btn-primary"
          >
            搜索
          </button>

          {/* 添加用户按钮 */}
          <button
            onClick={handleCreate}
            className="btn btn-primary"
          >
            添加用户
          </button>
        </div>
      </div>

      {/* 用户列表 */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  用户
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  手机号
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  角色
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  快递数
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  注册时间
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  {/* 用户信息 */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                        <span className="text-gray-600 font-medium">{user.name?.[0]}</span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email || '-'}</div>
                      </div>
                    </div>
                  </td>

                  {/* 手机号 */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.phone}
                  </td>

                  {/* 角色 */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-xs ${getRoleColor(user.role)}`}>
                      {getRoleText(user.role)}
                    </span>
                  </td>

                  {/* 快递数 */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user._count?.packagesAsRecipient || user._count?.packagesAsCourier || 0}
                  </td>

                  {/* 注册时间 */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>

                  {/* 操作按钮 */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEdit(user)}
                      className="text-primary hover:text-blue-800 mr-3"
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
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
              {editingUser ? '编辑用户' : '添加用户'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* 姓名 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  姓名 *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              {/* 手机号 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  手机号 *
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              {/* 邮箱 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  邮箱
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* 密码（仅创建时显示） */}
              {!editingUser && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    密码 *
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
              )}

              {/* 角色 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  角色
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="USER">用户</option>
                  <option value="COURIER">快递员</option>
                  <option value="ADMIN">管理员</option>
                </select>
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
                  {formLoading ? '处理中...' : (editingUser ? '更新' : '创建')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
