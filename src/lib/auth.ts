import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { prisma } from './prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'bk-smp41-jkt-secret-key-2026-super-secure';

export interface UserSession {
  id: string;
  username: string;
  email: string | null;
  name: string;
  role: 'ADMIN' | 'GURU_BK' | 'WALI_KELAS' | 'MURID';
  nipNis?: string | null;
  activeClassId?: string | null;
  studentId?: string | null;
  mustChangePassword?: boolean;
}

export function createToken(payload: UserSession): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): UserSession | null {
  try {
    return jwt.verify(token, JWT_SECRET) as UserSession;
  } catch (error) {
    return null;
  }
}

export async function getSession(): Promise<UserSession | null> {
  const cookieStore = cookies();
  const token = cookieStore.get('bk_session')?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function requireAuth(allowedRoles?: string[]): Promise<UserSession> {
  const session = await getSession();
  if (!session) {
    throw new Error('Unauthorized');
  }
  if (allowedRoles && !allowedRoles.includes(session.role)) {
    throw new Error('Forbidden');
  }
  return session;
}
