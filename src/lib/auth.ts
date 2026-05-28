import bcrypt from 'bcryptjs';

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
};

export const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

export const generatePickupCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

export const validatePhone = (phone: string): boolean => {
  return /^1[3-9]\d{9}$/.test(phone);
};

export const validateTrackingNumber = (trackingNumber: string): boolean => {
  return /^[A-Z0-9]{8,20}$/.test(trackingNumber.toUpperCase());
};
