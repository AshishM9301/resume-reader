const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface RequestOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
}

async function request<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = 'GET', headers = {}, body } = options;

  const res = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(error.detail || `HTTP ${res.status}`);
  }

  return res.json();
}

async function getIdToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null
  try {
    const { getCurrentUser } = await import('@/lib/firebase')
    const user = getCurrentUser()
    if (!user) return null
    return await user.getIdToken()
  } catch {
    return null
  }
}

export const api = {
  register: async (data: {
    email: string;
    password: string;
    first_name?: string;
    last_name?: string;
    username?: string;
  }) => {
    const idToken = await getIdToken()
    const headers: Record<string, string> = {}
    if (idToken) {
      headers['Authorization'] = `Bearer ${idToken}`
    }
    return request<{ message: string; user: User }>("/users/register", {
      method: "POST",
      body: JSON.stringify(data),
      headers,
    })
  },

  login: (data: { email: string; password: string }) =>
    request<{ message: string; id_token?: string }>("/users/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  me: async (): Promise<User> => {
    const idToken = await getIdToken()
    if (!idToken) throw new Error('Not authenticated')
    return request<User>("/users/me", {
      headers: { Authorization: `Bearer ${idToken}` },
    })
  },

  upsertUser: async (data: {
    email: string;
    first_name?: string;
    last_name?: string;
    username?: string;
  }) => {
    const idToken = await getIdToken()
    if (!idToken) throw new Error('Not authenticated')
    return request<{ message: string; user: User }>("/users/upsert", {
      method: "POST",
      body: JSON.stringify(data),
      headers: { Authorization: `Bearer ${idToken}` },
    })
  },
};

export interface User {
  id: number;
  firebase_id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  username: string | null;
  created_at: string;
  updated_at: string;
}
