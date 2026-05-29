import { NextResponse } from 'next/server';

/**
 * 统一 API 响应格式
 */
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * 创建成功响应
 * 
 * @param data - 响应数据
 * @param message - 可选消息
 * @param status - HTTP 状态码，默认 200
 * @returns NextResponse
 */
export function successResponse<T>(
  data: T,
  message?: string,
  status: number = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      message,
    },
    { status }
  );
}

/**
 * 创建错误响应
 * 
 * @param error - 错误信息
 * @param status - HTTP 状态码，默认 400
 * @returns NextResponse
 */
export function errorResponse(
  error: string,
  status: number = 400
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error,
    },
    { status }
  );
}

/**
 * 验证必需字段
 * 
 * @param data - 数据对象
 * @param requiredFields - 必需字段列表
 * @returns 错误信息数组，如果全部有效返回空数组
 */
export function validateRequiredFields<T extends Record<string, any>>(
  data: T,
  requiredFields: (keyof T)[]
): string[] {
  const errors: string[] = [];
  
  for (const field of requiredFields) {
    if (data[field] === undefined || data[field] === null || data[field] === '') {
      errors.push(`${String(field)} 是必需字段`);
    }
  }
  
  return errors;
}
