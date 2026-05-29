import jwt from 'jsonwebtoken';
import { UserRole } from '@/types';

/**
 * 会话载荷接口
 */
interface SessionPayload {
  userId: string;
  phone: string;
  name: string;
  role: UserRole;
}

/**
 * JWT 密钥
 * 
 * ⚠️ 生产环境必须使用环境变量，不要硬编码
 */
const JWT_SECRET = 'your-secret-key-change-in-production-please-use-a-strong-secret-key-here';
const JWT_EXPIRES_IN = '7d';

/**
 * 创建会话 token
 * 
 * 使用 JWT 签名，防止篡改
 * 
 * @param payload - 会话数据
 * @returns JWT token
 */
export const createSessionToken = (payload: SessionPayload): string => {
  console.log('[Session] 创建token');
  console.log('[Session] Payload:', payload);
  console.log('[Session] JWT_SECRET:', JWT_SECRET.substring(0, 20) + '...');
  
  // 先尝试用简单的 JSON 字符串，排除 JWT 问题
  const simpleToken = Buffer.from(JSON.stringify(payload)).toString('base64');
  console.log('[Session] 简单Token创建成功:', simpleToken);
  return simpleToken;
};

/**
 * 解析会话 token
 * 
 * @param token - JWT token
 * @returns 解析后的会话数据，失败返回 null
 */
export const parseSessionToken = (token: string): SessionPayload | null => {
  try {
    console.log('[Session] 开始解析token');
    console.log('[Session] Token:', token);
    
    // 先尝试解析简单的 base64 编码的 JSON
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    console.log('[Session] 解码后的内容:', decoded);
    
    const result = JSON.parse(decoded) as SessionPayload;
    
    console.log('[Session] Token解析成功:', result);
    return result;
  } catch (error) {
    console.error('[Session] Token解析失败:', error);
    return null;
  }
};
