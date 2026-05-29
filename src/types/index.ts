export type UserRole = 'USER' | 'COURIER' | 'ADMIN';

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
