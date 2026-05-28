import { UserRole } from '@/types';

interface SessionPayload {
  userId: string;
  phone: string;
  name: string;
  role: UserRole;
}

export const createSessionToken = (payload: SessionPayload): string => {
  return Buffer.from(JSON.stringify(payload)).toString('base64');
};

export const parseSessionToken = (token: string): SessionPayload | null => {
  try {
    return JSON.parse(Buffer.from(token, 'base64').toString());
  } catch {
    return null;
  }
};
