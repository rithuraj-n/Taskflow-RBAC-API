const API_BASE_URL = 'http://localhost:5000/api/v1';

class ApiError extends Error {
  public status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('token');
  const headers = new Headers(options.headers || {});

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    let data: any;

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = { message: await response.text() };
    }

    if (!response.ok) {
      // Automatic logout on 401 Unauthorized (invalid or expired token)
      if (response.status === 401 && !endpoint.includes('/auth/login')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.dispatchEvent(new Event('auth-logout'));
      }
      throw new ApiError(data.message || 'Something went wrong', response.status);
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new Error('Network error. Please make sure the backend server is running.');
  }
}

export const api = {
  auth: {
    register: (data: any) => request<any>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    login: (data: any) => request<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    getProfile: () => request<any>('/auth/profile', {
      method: 'GET',
    }),
  },
  tasks: {
    getTasks: (filters: Record<string, string | number> = {}) => {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          queryParams.set(key, String(val));
        }
      });
      const queryString = queryParams.toString();
      return request<any>(`/tasks${queryString ? `?${queryString}` : ''}`, {
        method: 'GET',
      });
    },
    getTaskById: (id: string) => request<any>(`/tasks/${id}`, {
      method: 'GET',
    }),
    createTask: (data: any) => request<any>('/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    updateTask: (id: string, data: any) => request<any>(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    deleteTask: (id: string) => request<any>(`/tasks/${id}`, {
      method: 'DELETE',
    }),
  },
  users: {
    getAllUsers: () => request<any>('/users', {
      method: 'GET',
    }),
  },
};
