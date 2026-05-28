'use client';

import { useState } from 'react';

const mockUsers = [
  {
    id: '1',
    name: '张三',
    phone: '13800138000',
    email: 'zhangsan@example.com',
    role: 'USER',
    packageCount: 5,
    createdAt: '2024-01-01',
  },
  {
    id: '2',
    name: '李四',
    phone: '13900139000',
    email: 'lisi@example.com',
    role: 'COURIER',
    packageCount: 45,
    createdAt: '2024-01-05',
  },
  {
    id: '3',
    name: '王五',
    phone: '13700137000',
    email: 'wangwu@example.com',
    role: 'USER',
    packageCount: 3,
    createdAt: '2024-01-10',
  },
];

export default function UsersPage() {
  const [users] = useState(mockUsers);

  const getRoleText = (role: string) => {
    const map: Record<string, string> = {
      USER: '用户',
      COURIER: '快递员',
      ADMIN: '管理员',
    };
    return map[role] || role;
  };

  const getRoleColor = (role: string) => {
    const map: Record<string, string> = {
      USER: 'bg-gray-100 text-gray-800',
      COURIER: 'bg-blue-100 text-blue-800',
      ADMIN: 'bg-purple-100 text-purple-800',
    };
    return map[role] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">用户管理</h1>
        <button className="btn btn-primary">添加用户</button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
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
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                      <span className="text-gray-600 font-medium">{user.name[0]}</span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.phone}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded text-xs ${getRoleColor(user.role)}`}>
                    {getRoleText(user.role)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {user.packageCount}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.createdAt}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button className="text-primary hover:text-blue-800 mr-3">编辑</button>
                  <button className="text-red-600 hover:text-red-800">删除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
