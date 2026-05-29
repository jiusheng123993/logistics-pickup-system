# 管理员端功能修复实现计划

> **For agentic workers:** 按照以下步骤逐步实现，每个模块完成后等待确认再进行下一个

**Goal:** 修复管理员端的数据概览、快递管理、用户管理页面的增删改查功能

**Architecture:** 
- 保持现有 Next.js App Router 结构
- 扩展 API 路由添加 PUT/DELETE 方法
- 完善前端页面的 CRUD 交互，使用模态框处理表单
- 添加 Toast 组件提供用户反馈

**Tech Stack:** Next.js 15, React 19, Prisma, Tailwind CSS

---

## 模块一：完善类型定义

**Files:**
- Modify: `src/types/index.ts`

### 任务 1.1：扩展类型定义

- [ ] **步骤 1：更新类型文件**

```typescript
export type UserRole = 'USER' | 'COURIER' 'ADMIN';

export type PackageStatus = 'PENDING' | 'IN_STORAGE' | 'PICKED_UP' | 'EXPIRED' | 'RETURNED';

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface Package {
  id: string;
  trackingNumber: string;
  recipientName: string;
  recipientPhone: string;
  courierId?: string;
  pickupCode: string;
  status: PackageStatus;
  storageLocation?: string;
  notes?: string;
  arrivedAt?: Date;
  pickedUpAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Pickup {
  id: string;
  packageId: string;
  userId: string;
  pickupCode: string;
  verified: boolean;
  createdAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  packageId?: string;
  title: string;
  content: string;
  read: boolean;
  createdAt: Date;
}

// API 请求类型
export interface CreatePackageRequest {
  trackingNumber: string;
  recipientName: string;
  recipientPhone: string;
  storageLocation?: string;
  notes?: string;
}

export interface UpdatePackageRequest {
  trackingNumber?: string;
  recipientName?: string;
  recipientPhone?: string;
  status?: PackageStatus;
  storageLocation?: string;
  notes?: string;
}

export interface CreateUserRequest {
  name: string;
  phone: string;
  email?: string;
  password: string;
  role: UserRole;
}

export interface UpdateUserRequest {
  name?: string;
  phone?: string;
  email?: string;
  role?: UserRole;
}

// API 响应类型
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface UserWithCount extends User {
  _count?: {
    packagesAsRecipient: number;
    packagesAsCourier: number;
    pickups: number;
  };
}

export interface StatsData {
  totalPackages: number;
  pendingPackages: number;
  pickedUpToday: number;
  activeUsers: number;
  weeklyData: Array<{
    day: string;
    date: string;
    inbound: number;
    picked: number;
  }>;
  statusDistribution: Record<string, number>;
}
```

---

## 模块二：扩展 API 路由 - 快递管理

**Files:**
- Modify: `src/app/api/packages/route.ts`

### 任务 2.1：添加 PUT 方法（更新快递）

- [ ] **步骤 1：在 route.ts 中添加 PUT 函数**

```typescript
/**
 * 更新快递
 */
export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return errorResponse('未登录', 401);
    }

    // 只有快递员和管理员可以更新
    if (user.role !== 'COURIER' && user.role !== 'ADMIN') {
      return errorResponse('无权操作', 403);
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return errorResponse('缺少快递ID', 400);
    }

    const data = await request.json();

    // 验证快递是否存在
    const existingPackage = await prisma.package.findUnique({
      where: { id },
    });

    if (!existingPackage) {
      return errorResponse('快递不存在', 404);
    }

    // 如果要更新运单号，检查是否已被其他快递使用
    if (data.trackingNumber && data.trackingNumber !== existingPackage.trackingNumber) {
      const duplicatePackage = await prisma.package.findUnique({
        where: { trackingNumber: data.trackingNumber },
      });

      if (duplicatePackage) {
        return errorResponse('该运单号已存在', 400);
      }

      if (!validateTrackingNumber(data.trackingNumber)) {
        return errorResponse('运单号格式不正确', 400);
      }
    }

    // 如果要更新手机号，验证格式
    if (data.recipientPhone && !validatePhone(data.recipientPhone)) {
      return errorResponse('手机号格式不正确', 400);
    }

    // 更新快递
    const updatedPackage = await prisma.package.update({
      where: { id },
      data: {
        trackingNumber: data.trackingNumber,
        recipientName: data.recipientName,
        recipientPhone: data.recipientPhone,
        status: data.status,
        storageLocation: data.storageLocation,
        notes: data.notes,
      },
    });

    return successResponse(updatedPackage, '更新成功');
  } catch (error) {
    console.error('更新快递失败:', error);
    return errorResponse('更新快递失败', 500);
  }
}
```

### 任务 2.2：添加 DELETE 方法（删除快递）

- [ ] **步骤 1：在 route.ts 中添加 DELETE 函数**

```typescript
/**
 * 删除快递
 */
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return errorResponse('未登录', 401);
    }

    // 只有管理员可以删除
    if (user.role !== 'ADMIN') {
      return errorResponse('无权操作', 403);
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return errorResponse('缺少快递ID', 400);
    }

    // 验证快递是否存在
    const existingPackage = await prisma.package.findUnique({
      where: { id },
    });

    if (!existingPackage) {
      return errorResponse('快递不存在', 404);
    }

    // 删除相关的取件记录和通知（级联删除）
    await prisma.pickup.deleteMany({
      where: { packageId: id },
    });

    await prisma.notification.deleteMany({
      where: { packageId: id },
    });

    // 删除快递
    await prisma.package.delete({
      where: { id },
    });

    return successResponse(null, '删除成功');
  } catch (error) {
    console.error('删除快递失败:', error);
    return errorResponse('删除快递失败', 500);
  }
}
```

---

## 模块三：扩展 API 路由 - 用户管理

**Files:**
- Modify: `src/app/api/users/route.ts`

### 任务 3.1：添加 PUT 方法（更新用户）

- [ ] **步骤 1：在 route.ts 中添加 PUT 函数**

```typescript
/**
 * 更新用户
 */
export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return errorResponse('未登录', 401);
    }

    // 只有管理员可以访问
    if (user.role !== 'ADMIN') {
      return errorResponse('无权访问', 403);
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return errorResponse('缺少用户ID', 400);
    }

    const data = await request.json();

    // 验证用户是否存在
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return errorResponse('用户不存在', 404);
    }

    // 如果要更新手机号，检查是否已被其他用户使用
    if (data.phone && data.phone !== existingUser.phone) {
      const duplicateUser = await prisma.user.findUnique({
        where: { phone: data.phone },
      });

      if (duplicateUser) {
        return errorResponse('该手机号已注册', 400);
      }

      if (!validatePhone(data.phone)) {
        return errorResponse('手机号格式不正确', 400);
      }
    }

    // 更新用户（不更新密码）
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        name: data.name,
        phone: data.phone,
        email: data.email,
        role: data.role,
      },
    });

    // 不返回密码
    const { password, ...userWithoutPassword } = updatedUser;

    return successResponse(userWithoutPassword, '更新成功');
  } catch (error) {
    console.error('更新用户失败:', error);
    return errorResponse('更新用户失败', 500);
  }
}
```

### 任务 3.2：添加 DELETE 方法（删除用户）

- [ ] **步骤 1：在 route.ts 中添加 DELETE 函数**

```typescript
/**
 * 删除用户
 */
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return errorResponse('未登录', 401);
    }

    // 只有管理员可以访问
    if (user.role !== 'ADMIN') {
      return errorResponse('无权访问', 403);
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return errorResponse('缺少用户ID', 400);
    }

    // 验证用户是否存在
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return errorResponse('用户不存在', 404);
    }

    // 不能删除自己
    if (id === user.id) {
      return errorResponse('不能删除当前登录用户', 400);
    }

    // 删除相关数据前先清理关联
    // 1. 删除通知
    await prisma.notification.deleteMany({
      where: { userId: id },
    });

    // 2. 删除取件记录
    await prisma.pickup.deleteMany({
      where: { userId: id },
    });

    // 3. 更新快递的 courierId 为 null（如果用户是快递员）
    await prisma.package.updateMany({
      where: { courierId: id },
      data: { courierId: null },
    });

    // 4. 更新快递的 recipient 关系（通过设置 recipientPhone 为其他值或保留）
    // 这里保留 recipientPhone 以便历史记录查询

    // 删除用户
    await prisma.user.delete({
      where: { id },
    });

    return successResponse(null, '删除成功');
  } catch (error) {
    console.error('删除用户失败:', error);
    return errorResponse('删除用户失败', 500);
  }
}
```

---

## 模块四：扩展 API 客户端

**Files:**
- Modify: `src/lib/api-client.ts`

### 任务 4.1：扩展 packagesApi

- [ ] **步骤 1：在 packagesApi 中添加 update 和 delete 方法**

```typescript
export const packagesApi = {
  /**
   * 获取快递列表
   */
  getList: async (params?: {
    status?: string;
    search?: string;
  }): Promise<ApiResponse<any[]>> => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set('status', params.status);
    if (params?.search) searchParams.set('search', params.search);
    
    const url = `/api/packages?${searchParams.toString()}`;
    return request(url);
  },

  /**
   * 创建快递（入库）
   */
  create: async (data: {
    trackingNumber: string;
    recipientName: string;
    recipientPhone: string;
    storageLocation?: string;
    notes?: string;
  }): Promise<ApiResponse<any>> => {
    return request('/api/packages', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * 更新快递
   */
  update: async (id: string, data: {
    trackingNumber?: string;
    recipientName?: string;
    recipientPhone?: string;
    status?: string;
    storageLocation?: string;
    notes?: string;
  }): Promise<ApiResponse<any>> => {
    const searchParams = new URLSearchParams();
    searchParams.set('id', id);
    const url = `/api/packages?${searchParams.toString()}`;
    return request(url, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * 删除快递
   */
  delete: async (id: string): Promise<ApiResponse<any>> => {
    const searchParams = new URLSearchParams();
    searchParams.set('id', id);
    const url = `/api/packages?${searchParams.toString()}`;
    return request(url, {
      method: 'DELETE',
    });
  },

  /**
   * 取件
   */
  pickup: async (data: {
    pickupCode: string;
    packageId?: string;
  }): Promise<ApiResponse<any>> => {
    return request('/api/packages/pickup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};
```

### 任务 4.2：扩展 usersApi

- [ ] **步骤 1：在 usersApi 中添加 create、update 和 delete 方法**

```typescript
export const usersApi = {
  /**
   * 获取用户列表
   */
  getList: async (params?: {
    role?: string;
    search?: string;
  }): Promise<ApiResponse<any[]>> => {
    const searchParams = new URLSearchParams();
    if (params?.role) searchParams.set('role', params.role);
    if (params?.search) searchParams.set('search', params.search);
    
    const url = `/api/users?${searchParams.toString()}`;
    return request(url);
  },

  /**
   * 创建用户
   */
  create: async (data: {
    name: string;
    phone: string;
    email?: string;
    password: string;
    role: string;
  }): Promise<ApiResponse<any>> => {
    return request('/api/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * 更新用户
   */
  update: async (id: string, data: {
    name?: string;
    phone?: string;
    email?: string;
    role?: string;
  }): Promise<ApiResponse<any>> => {
    const searchParams = new URLSearchParams();
    searchParams.set('id', id);
    const url = `/api/users?${searchParams.toString()}`;
    return request(url, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * 删除用户
   */
  delete: async (id: string): Promise<ApiResponse<any>> => {
    const searchParams = new URLSearchParams();
    searchParams.set('id', id);
    const url = `/api/users?${searchParams.toString()}`;
    return request(url, {
      method: 'DELETE',
    });
  },
};
```

---

## 模块五：创建 Toast 组件（如果不存在）

**Files:**
- Check: `src/components/Toast.tsx`
- Create/Modify: `src/components/Toast.tsx`

### 任务 5.1：创建 Toast 组件

- [ ] **步骤 1：检查并创建 Toast 组件**

```tsx
'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ToastContextType {
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`px-4 py-3 rounded-lg shadow-lg border ${
              toast.type === 'success'
                ? 'bg-green-50 border-green-200 text-green-800'
                : toast.type === 'error'
                ? 'bg-red-50 border-red-200 text-red-800'
                : 'bg-blue-50 border-blue-200 text-blue-800'
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
```

### 任务 5.2：在 layout 中添加 ToastProvider

- [ ] **步骤 1：检查并更新 admin layout**

先查看现有的 admin layout：
`src/app/admin/layout.tsx`

---

## 模块六：完善快递管理页面

**Files:**
- Modify: `src/app/admin/packages/page.tsx`

### 任务 6.1：重写快递管理页面，添加完整 CRUD 功能

- [ ] **步骤 1：完全重写 packages/page.tsx**

```tsx
'use client';

import { useState, useEffect } from 'react';
import { packagesApi } from '@/lib/api-client';
import { Package, PackageStatus } from '@/types';
import { useToast } from '@/components/Toast';

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

  useEffect(() => {
    loadPackages();
  }, []);

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

  const handleSearch = () => {
    loadPackages();
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.trackingNumber || !formData.recipientName || !formData.recipientPhone) {
      showToast('请填写必填字段', 'error');
      return;
    }

    try {
      setFormLoading(true);
      
      let response;
      if (editingPackage) {
        response = await packagesApi.update(editingPackage.id, formData);
      } else {
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

      {/* 模态框 */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold mb-4">
              {editingPackage ? '编辑快递' : '添加快递'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
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
```

---

## 模块七：完善用户管理页面

**Files:**
- Modify: `src/app/admin/users/page.tsx`

### 任务 7.1：重写用户管理页面，添加完整 CRUD 功能

- [ ] **步骤 1：完全重写 users/page.tsx**

```tsx
'use client';

import { useState, useEffect } from 'react';
import { usersApi } from '@/lib/api-client';
import { User, UserRole, UserWithCount } from '@/types';
import { useToast } from '@/components/Toast';

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

  useEffect(() => {
    loadUsers();
  }, []);

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

  const handleSearch = () => {
    loadUsers();
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone) {
      showToast('请填写必填字段', 'error');
      return;
    }

    if (!editingUser && !formData.password) {
      showToast('请设置密码', 'error');
      return;
    }

    try {
      setFormLoading(true);
      
      let response;
      if (editingUser) {
        // 编辑时不发送密码
        const { password, ...updateData } = formData;
        response = await usersApi.update(editingUser.id, updateData);
      } else {
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">用户管理</h1>
        <div className="flex gap-4">
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
          <input
            type="text"
            placeholder="搜索用户..."
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
            添加用户
          </button>
        </div>
      </div>

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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.phone}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-xs ${getRoleColor(user.role)}`}>
                      {getRoleText(user.role)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user._count?.packagesAsRecipient || user._count?.packagesAsCourier || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
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

      {/* 模态框 */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold mb-4">
              {editingUser ? '编辑用户' : '添加用户'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
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
```

---

## 模块八：更新管理员 Layout 添加 ToastProvider

**Files:**
- Check/Modify: `src/app/admin/layout.tsx`

### 任务 8.1：检查并更新 admin layout

先查看现有内容，然后添加 ToastProvider

---

## 测试验证

### 任务 9.1：测试快递管理功能

- [ ] 使用管理员账号登录（13800000000 / admin123）
- [ ] 访问 /admin/packages
- [ ] 测试搜索功能
- [ ] 测试添加新快递
- [ ] 测试编辑现有快递
- [ ] 测试删除快递

### 任务 9.2：测试用户管理功能

- [ ] 访问 /admin/users
- [ ] 测试角色筛选
- [ ] 测试搜索功能
- [ ] 测试添加新用户
- [ ] 测试编辑现有用户
- [ ] 测试删除用户（不能删除自己）

### 任务 9.3：测试数据概览

- [ ] 访问 /admin
- [ ] 确认统计数据正常显示

---

## 完成标准

1. ✅ API 路由支持完整的 CRUD 操作
2. ✅ 前端页面有完整的增删改查功能
3. ✅ 模态框表单验证完善
4. ✅ Toast 提示用户操作结果
5. ✅ 权限控制正确工作
6. ✅ 错误处理完善
7. ✅ 代码注释清晰
