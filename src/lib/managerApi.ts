import { cookies } from 'next/headers';
import { MANAGER_TOKEN_COOKIE } from './managerAuthCookie';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8000';
export { MANAGER_TOKEN_COOKIE };

export interface ManagerUser {
  username: string;
  isManager: boolean;
  isContentUploader: boolean;
}

/**
 * Server-only fetch wrapper for the authenticated Django admin API.
 * Reads the manager's token from the httpOnly cookie - never exposed to
 * client-side JS, so all manager API calls must go through server code
 * (Server Actions / Server Components), never a direct browser fetch.
 */
export async function managerFetch(path: string, options: RequestInit = {}) {
  const cookieStore = await cookies();
  const token = cookieStore.get(MANAGER_TOKEN_COOKIE)?.value;

  const headers = new Headers(options.headers);
  if (token) {
    headers.set('Authorization', `Token ${token}`);
  }

  return fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    cache: 'no-store',
  });
}

export async function getManagerToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(MANAGER_TOKEN_COOKIE)?.value ?? null;
}

export async function getCurrentManager(): Promise<ManagerUser | null> {
  const token = await getManagerToken();
  if (!token) return null;

  const res = await managerFetch('/api/admin/auth/me/');
  if (!res.ok) return null;
  return res.json();
}
