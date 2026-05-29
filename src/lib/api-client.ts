/**
 * API 客户端
 * 
 * 统一管理 API 调用
 */

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

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
