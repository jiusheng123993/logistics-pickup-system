/**
 * API 客户端
 * 
 * 统一管理 API 调用
 */

import type { ApiResponse as ApiResponseType } from '@/types';

// 使用类型定义文件中的类型，同时保持向后兼容
type ApiResponse<T = any> = ApiResponseType<T>;

/**
 * 通用 API 请求函数
 */
async function request<T>(
  url: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  };

  const response = await fetch(url, defaultOptions);
  const data = await response.json();

  return data;
}

/**
 * 快递相关 API
 */
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

/**
 * 取件记录相关 API
 */
export const pickupsApi = {
  /**
   * 获取取件历史
   */
  getHistory: async (): Promise<ApiResponse<any[]>> => {
    return request('/api/pickups');
  },
};

/**
 * 用户相关 API
 */
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

/**
 * 统计相关 API
 */
export const statsApi = {
  /**
   * 获取统计数据
   */
  getStats: async (): Promise<ApiResponse<any>> => {
    return request('/api/stats');
  },
};
