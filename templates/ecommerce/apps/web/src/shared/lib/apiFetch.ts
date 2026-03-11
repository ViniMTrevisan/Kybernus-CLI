import { useAuthStore } from '../../modules/auth/useAuthStore';

export async function apiFetch<T>(url: string, opts: RequestInit = {}): Promise<T> {
  const token = useAuthStore.getState().accessToken;
  const res = await fetch(url, {
    ...opts,
    credentials: 'include', // always send httpOnly cookies (e.g. refreshToken)
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(opts.headers as Record<string, string> | undefined),
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<T>;
}
