import axios from 'axios';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080').replace(/\/+$/, '');

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('bugcraft-token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = error?.config?.url ?? '';
    const isAuthRequest = requestUrl.includes('/api/auth/');
    const isPublicRoute = typeof window !== 'undefined' && ['/auth', '/register', '/reset-password', '/'].includes(window.location.pathname);
    const isDemoSession = localStorage.getItem('bugcraft-token') === 'demo-token';

    if (error.response?.status === 401 && !isAuthRequest && !isPublicRoute && !isDemoSession) {
      localStorage.removeItem('bugcraft-token');
      localStorage.removeItem('bugcraft-user');
      window.location.assign('/auth');
    }

    return Promise.reject(error);
  },
);

export async function loginUser(payload: { email?: string; username?: string; password: string }) {
  const credential = payload.email || payload.username || '';
  const { data } = await apiClient.post('/api/auth/login', {
    username: credential,
    email: credential,
    password: payload.password,
  });

  if (data && data.token && !data.user) {
    data.user = {
      id: data.username || credential,
      name: data.username || credential,
      email: data.email || credential,
      role: data.role || 'DEVELOPER',
      avatar: (data.username || 'U').substring(0, 2).toUpperCase(),
    };
  }

  return data;
}

export async function registerUser(payload: { name: string; email: string; username?: string; password: string }) {
  const credential = payload.email || payload.username || '';
  const { data } = await apiClient.post('/api/auth/register', {
    name: payload.name,
    email: credential,
    username: credential,
    password: payload.password,
  });

  // If response is a string or doesn't have token, auto-login to return full session
  if (typeof data === 'string' || !data?.token) {
    try {
      const loginData = await loginUser({ email: credential, password: payload.password });
      return loginData;
    } catch {
      return data;
    }
  }

  if (data && data.token && !data.user) {
    data.user = {
      id: data.username || credential,
      name: payload.name || data.username || credential,
      email: credential,
      role: data.role || 'DEVELOPER',
      avatar: (payload.name || data.username || 'U').substring(0, 2).toUpperCase(),
    };
  }

  return data;
}

export async function forgotPassword(email: string) {
  const { data } = await apiClient.post('/api/auth/forgot-password', { email });
  return data;
}

export async function resetPassword(resetToken: string, password: string) {
  const { data } = await apiClient.put(`/api/auth/reset-password/${resetToken}`, { password });
  return data;
}

export async function fetchCurrentUser() {
  const { data } = await apiClient.get('/api/auth/me');
  return data;
}

export async function fetchAdminUsers() {
  const { data } = await apiClient.get('/api/admin/users');
  return data?.users ?? [];
}

export async function updateAdminUserRole(id: string, role: 'ADMIN' | 'DEVELOPER') {
  const { data } = await apiClient.put(`/api/admin/users/${id}/role`, { role });
  return data;
}

export async function fetchBugs(params?: Record<string, string | number>) {
  if (localStorage.getItem('bugcraft-token') === 'demo-token') {
    return [];
  }

  const { data } = await apiClient.get('/api/bugs', { params });
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.bugs)) {
    return data.bugs;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  return [];
}

export async function fetchBugAnalytics() {
  if (localStorage.getItem('bugcraft-token') === 'demo-token') {
    return { overview: { total: 0, open: 0, inProgress: 0, resolved: 0, closed: 0, critical: 0, resolutionRate: 0 }, byCategory: [], bySeverity: [], byPriority: [], recentActivity: [] };
  }

  const { data } = await apiClient.get('/api/bugs/analytics/overview');
  const raw = data?.data ?? data ?? {};
  const overview = raw?.overview ?? raw ?? {};

  const total = Number(overview.total ?? 0);
  const resolved = Number(overview.resolved ?? 0);
  const closed = Number(overview.closed ?? 0);
  const resolutionRate = overview.resolutionRate ?? (total > 0 ? Math.round(((resolved + closed) / total) * 100) : 0);

  return {
    overview: {
      total,
      open: Number(overview.open ?? 0),
      inProgress: Number(overview.inProgress ?? 0),
      resolved,
      closed,
      critical: Number(overview.critical ?? 0),
      resolutionRate,
    },
    byCategory: raw?.byCategory ?? [],
    bySeverity: raw?.bySeverity ?? [],
    byPriority: raw?.byPriority ?? [],
    recentActivity: raw?.recentActivity ?? [],
  };
}

export async function submitTriagePrompt(prompt: string) {
  const { data } = await apiClient.post('/api/bugs/triage', { prompt });

  if (data && typeof data === 'object') {
    if (data.id && !data.result) {
      return {
        message: 'AI Triage completed successfully and ticket prepared.',
        result: {
          toolCalled: 'createBugTool',
          data: {
            id: data.id,
            title: data.title,
            status: data.status,
            priority: data.priority,
            possibleCause: data.description,
            suggestedFix: data.description,
          },
        },
        ...data,
      };
    }
    if (data.logId && !data.result) {
      return {
        message: data.agentResponse || 'AI Triage completed successfully.',
        result: {
          toolCalled: data.executedTool || 'AI-Agent',
          data: {
            possibleCause: data.rootCauseAnalysis,
            suggestedFix: data.suggestedFix,
          },
        },
        ...data,
      };
    }
  }

  return data;
}

export async function createBug(payload: Record<string, string | null | undefined>) {
  const { data } = await apiClient.post('/api/bugs', payload);
  return data;
}

export async function updateBug(id: string, payload: Record<string, string | null | undefined>) {
  const { data } = await apiClient.put(`/api/bugs/${id}`, payload);
  return data;
}

export async function deleteBug(id: string) {
  const { data } = await apiClient.delete(`/api/bugs/${id}`);
  return data;
}
