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
