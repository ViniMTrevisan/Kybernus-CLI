import { create } from 'zustand';
import { apiFetch } from '../../shared/lib/apiFetch';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  login(email: string, password: string): Promise<void>;
  register(name: string, email: string, password: string): Promise<void>;
  logout(): Promise<void>;
  init(): Promise<void>;
  updateProfile(data: { name?: string; email?: string }): Promise<void>;
  changePassword(data: { currentPassword: string; newPassword: string }): Promise<void>;
  deleteAccount(password: string): Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  // Access token is kept ONLY in memory — never persisted in localStorage.
  // This prevents XSS attacks from reading the token via JavaScript.
  // On page load, init() silently exchanges the httpOnly refresh-token cookie
  // for a fresh access token via POST /api/auth/refresh.
  accessToken: null,

  async login(email, password) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      credentials: 'include', // send & receive httpOnly cookie
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const data = (await res.json()) as { message?: string };
      throw new Error(data.message ?? 'Credenciais inválidas');
    }
    const data = (await res.json()) as { user: AuthUser; accessToken: string };
    set({ user: data.user, accessToken: data.accessToken });
  },

  async register(name, email, password) {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    if (!res.ok) {
      const data = (await res.json()) as { message?: string };
      throw new Error(data.message ?? 'Erro ao cadastrar');
    }
    const data = (await res.json()) as { user: AuthUser; accessToken: string };
    set({ user: data.user, accessToken: data.accessToken });
  },

  async logout() {
    const token = useAuthStore.getState().accessToken;
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    } catch {
      // ignore — clear local state regardless
    }
    set({ user: null, accessToken: null });
  },

  async init() {
    // Silently try to obtain a fresh access token using the httpOnly refresh
    // cookie. If the cookie is absent or expired the request returns 401 and
    // we leave the user unauthenticated without throwing.
    try {
      const res = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) return;
      const data = (await res.json()) as { accessToken: string };
      // Fetch user profile with the new token
      const meRes = await fetch('/api/auth/me', {
        credentials: 'include',
        headers: { Authorization: `Bearer ${data.accessToken}` },
      });
      if (!meRes.ok) return;
      const user = (await meRes.json()) as AuthUser;
      set({ user, accessToken: data.accessToken });
    } catch {
      // Network error or server unavailable — stay logged out
    }
  },

  async updateProfile(data) {
    const updated = await apiFetch<AuthUser>('/api/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    set((s) => ({ user: s.user ? { ...s.user, ...updated } : s.user }));
  },

  async changePassword(data) {
    const token = useAuthStore.getState().accessToken;
    const res = await fetch('/api/me/password', {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const body = (await res.json()) as { message?: string };
      throw new Error(body.message ?? `HTTP ${res.status}`);
    }
  },

  async deleteAccount(password) {
    const token = useAuthStore.getState().accessToken;
    const res = await fetch('/api/me', {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) {
      const body = (await res.json()) as { message?: string };
      throw new Error(body.message ?? `HTTP ${res.status}`);
    }
    set({ user: null, accessToken: null });
  },
}));
