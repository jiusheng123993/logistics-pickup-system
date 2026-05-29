import bcrypt from 'bcryptjs';

/**
 * 加密密码
 * 
 * 使用 bcrypt 算法，salt rounds = 12
 * 
 * @param password - 明文密码
 * @returns 加密后的密码哈希
 */
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
};

/**
 * 验证密码
 * 
 * @param password - 明文密码
 * @param hashedPassword - 密码哈希
 * @returns 密码是否匹配
 */
export const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

/**
 * 生成取件码
 * 
 * 生成6位随机字符串，包含大写字母和数字
 * 
 * @returns 取件码
 */
export const generatePickupCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

/**
 * 验证手机号格式
 * 
 * 中国大陆手机号格式：1开头，第二位3-9，共11位数字
 * 
 * @param phone - 手机号
 * @returns 格式是否正确
 */
export const validatePhone = (phone: string): boolean => {
  return /^1[3-9]\d{9}$/.test(phone);
};

/**
 * 验证快递单号格式
 * 
 * 格式：8-20位大写字母和数字
 * 
 * @param trackingNumber - 快递单号
 * @returns 格式是否正确
 */
export const validateTrackingNumber = (trackingNumber: string): boolean => {
  return /^[A-Z0-9]{8,20}$/.test(trackingNumber.toUpperCase());
};
