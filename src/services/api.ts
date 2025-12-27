/**
 * API Service untuk komunikasi dengan backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const API_VERSION = 'v1';
const API_URL = `${API_BASE_URL}/api/${API_VERSION}`;

// Get token from localStorage
const getToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

// Set token to localStorage
export const setToken = (token: string): void => {
  localStorage.setItem('auth_token', token);
};

// Remove token from localStorage
export const removeToken = (): void => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user_data');
};

// Set user data
export const setUserData = (user: any): void => {
  localStorage.setItem('user_data', JSON.stringify(user));
};

// Get user data
export const getUserData = (): any | null => {
  const data = localStorage.getItem('user_data');
  return data ? JSON.parse(data) : null;
};

// Generic fetch function with authentication
const apiFetch = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_URL}${endpoint}`;
  
  // Log request in development
  if (import.meta.env.DEV) {
    console.log(`[API] ${options.method || 'GET'} ${url}`);
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Handle 401 Unauthorized - token expired or invalid
    if (response.status === 401) {
      removeToken();
      // Redirect to login if not already there
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/#/login';
      }
      throw new Error('Unauthorized - Please login again');
    }

    return response;
  } catch (error: any) {
    // Enhanced error handling for network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      const errorMessage = `Failed to connect to backend. Please check:
1. Backend server is running at ${API_BASE_URL}
2. CORS is configured correctly
3. Network connection is available`;
      
      console.error('[API Error]', errorMessage);
      console.error('[API URL]', url);
      console.error('[API Base URL]', API_BASE_URL);
      
      throw new Error(`Cannot connect to server. Make sure backend is running at ${API_BASE_URL}`);
    }
    throw error;
  }
};

// Generic API response handler
const handleResponse = async <T>(response: Response): Promise<T> => {
  let data;
  
  try {
    const text = await response.text();
    if (!text) {
      throw new Error('Empty response from server');
    }
    data = JSON.parse(text);
  } catch (error) {
    console.error('[API Error] Failed to parse response:', error);
    throw new Error(`Invalid response from server (Status: ${response.status})`);
  }

  if (!response.ok) {
    const errorMessage = data.message || data.error || `HTTP error! status: ${response.status}`;
    console.error('[API Error]', errorMessage, data);
    throw new Error(errorMessage);
  }

  return data;
};

// API Methods

// ============ Authentication ============
export const authAPI = {
  login: async (username: string, password: string) => {
    const response = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    const data = await handleResponse<{
      success: boolean;
      data: { token: string; user: any };
    }>(response);
    
    if (data.success && data.data.token) {
      setToken(data.data.token);
      setUserData(data.data.user);
    }
    
    return data;
  },

  register: async (userData: {
    username: string;
    password: string;
    email?: string;
    fullName?: string;
    roleId: string;
  }) => {
    const response = await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    return handleResponse(response);
  },

  getMe: async () => {
    const response = await apiFetch('/auth/me');
    return handleResponse(response);
  },

  changePassword: async (oldPassword: string, newPassword: string) => {
    const response = await apiFetch('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ oldPassword, newPassword }),
    });
    return handleResponse(response);
  },
};

// ============ Terapis ============
export const terapisAPI = {
  getAll: async (params?: { page?: number; limit?: number; search?: string; cabang?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.cabang) {
      const cabangValue = params.cabang.trim();
      if (cabangValue !== '') {
        queryParams.append('cabang', cabangValue);
        console.log('Adding cabang to query:', cabangValue);
      }
    }

    const queryString = queryParams.toString();
    const endpoint = `/terapis${queryString ? `?${queryString}` : ''}`;
    console.log('API Call:', endpoint);
    console.log('Full params received:', params);
    const response = await apiFetch(endpoint);
    return handleResponse(response);
  },

  getById: async (id: string) => {
    const response = await apiFetch(`/terapis/${id}`);
    return handleResponse(response);
  },

  create: async (data: any) => {
    const response = await apiFetch('/terapis', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  update: async (id: string, data: any) => {
    const response = await apiFetch(`/terapis/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  delete: async (id: string) => {
    const response = await apiFetch(`/terapis/${id}`, {
      method: 'DELETE',
    });
    return handleResponse(response);
  },
};

// ============ Requirement ============
export const requirementAPI = {
  getAll: async (params?: { page?: number; limit?: number; search?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);

    const queryString = queryParams.toString();
    const endpoint = `/requirement${queryString ? `?${queryString}` : ''}`;
    const response = await apiFetch(endpoint);
    return handleResponse(response);
  },

  getById: async (id: string) => {
    const response = await apiFetch(`/requirement/${id}`);
    return handleResponse(response);
  },

  create: async (data: any) => {
    const response = await apiFetch('/requirement', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  accept: async (id: string, cabang?: string) => {
    const response = await apiFetch(`/requirement/${id}/accept`, {
      method: 'POST',
      body: JSON.stringify({ cabang: cabang || null }),
    });
    return handleResponse(response);
  },

  reject: async (id: string) => {
    const response = await apiFetch(`/requirement/${id}`, {
      method: 'DELETE',
    });
    return handleResponse(response);
  },
};

// ============ TNA ============
export const tnaAPI = {
  getAll: async (params?: { page?: number; limit?: number; search?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);

    const queryString = queryParams.toString();
    const endpoint = `/tna${queryString ? `?${queryString}` : ''}`;
    const response = await apiFetch(endpoint);
    return handleResponse(response);
  },

  getByTerapisId: async (terapisId: string) => {
    const response = await apiFetch(`/tna/terapis/${terapisId}`);
    return handleResponse(response);
  },

  createOrUpdate: async (data: any) => {
    const response = await apiFetch('/tna', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  delete: async (id: string) => {
    const response = await apiFetch(`/tna/${id}`, {
      method: 'DELETE',
    });
    return handleResponse(response);
  },
};

// ============ Evaluasi ============
export const evaluasiAPI = {
  getAll: async (params?: { page?: number; limit?: number; search?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);

    const queryString = queryParams.toString();
    const endpoint = `/evaluasi${queryString ? `?${queryString}` : ''}`;
    const response = await apiFetch(endpoint);
    return handleResponse(response);
  },

  getByTerapisId: async (terapisId: string) => {
    const response = await apiFetch(`/evaluasi/terapis/${terapisId}`);
    return handleResponse(response);
  },

  createOrUpdate: async (data: any) => {
    const response = await apiFetch('/evaluasi', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  delete: async (id: string) => {
    const response = await apiFetch(`/evaluasi/${id}`, {
      method: 'DELETE',
    });
    return handleResponse(response);
  },
};

// ============ Training ============
export const trainingAPI = {
  getModules: async (params?: { year?: number; category?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.year) queryParams.append('year', params.year.toString());
    if (params?.category) queryParams.append('category', params.category);

    const queryString = queryParams.toString();
    const endpoint = `/training/modules${queryString ? `?${queryString}` : ''}`;
    const response = await apiFetch(endpoint);
    return handleResponse(response);
  },

  getModuleById: async (id: string) => {
    const response = await apiFetch(`/training/modules/${id}`);
    return handleResponse(response);
  },

  create: async (data: any) => {
    const response = await apiFetch('/training/modules', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  update: async (id: string, data: any) => {
    const response = await apiFetch(`/training/modules/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  delete: async (id: string) => {
    const response = await apiFetch(`/training/modules/${id}`, {
      method: 'DELETE',
    });
    return handleResponse(response);
  },
};

// ============ Roles (Admin Only) ============
export const rolesAPI = {
  getAll: async () => {
    const response = await apiFetch('/roles');
    return handleResponse(response);
  },

  getById: async (id: string) => {
    const response = await apiFetch(`/roles/${id}`);
    return handleResponse(response);
  },

  create: async (data: any) => {
    const response = await apiFetch('/roles', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  update: async (id: string, data: any) => {
    const response = await apiFetch(`/roles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  delete: async (id: string) => {
    const response = await apiFetch(`/roles/${id}`, {
      method: 'DELETE',
    });
    return handleResponse(response);
  },
};

// ============ Users (Admin Only) ============
export const usersAPI = {
  getAll: async (params?: { page?: number; limit?: number; search?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);

    const queryString = queryParams.toString();
    const endpoint = `/users${queryString ? `?${queryString}` : ''}`;
    const response = await apiFetch(endpoint);
    return handleResponse(response);
  },

  getById: async (id: string) => {
    const response = await apiFetch(`/users/${id}`);
    return handleResponse(response);
  },

  update: async (id: string, data: any) => {
    const response = await apiFetch(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  delete: async (id: string) => {
    const response = await apiFetch(`/users/${id}`, {
      method: 'DELETE',
    });
    return handleResponse(response);
  },
};

// ============ Statistics ============
export const statisticsAPI = {
  getStatistics: async () => {
    const response = await apiFetch('/statistics');
    return handleResponse(response);
  },
};

// ============ Audit Logs (Admin Only) ============
export const auditAPI = {
  getAll: async (params?: {
    tableName?: string;
    action?: string;
    userId?: string;
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.tableName) queryParams.append('tableName', params.tableName);
    if (params?.action) queryParams.append('action', params.action);
    if (params?.userId) queryParams.append('userId', params.userId);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);

    const queryString = queryParams.toString();
    const endpoint = `/audit${queryString ? `?${queryString}` : ''}`;
    const response = await apiFetch(endpoint);
    return handleResponse(response);
  },

  getByRecord: async (tableName: string, recordId: string, limit?: number) => {
    const queryParams = new URLSearchParams();
    if (limit) queryParams.append('limit', limit.toString());

    const queryString = queryParams.toString();
    const endpoint = `/audit/record/${tableName}/${recordId}${queryString ? `?${queryString}` : ''}`;
    const response = await apiFetch(endpoint);
    return handleResponse(response);
  },

  getByUser: async (userId: string, limit?: number) => {
    const queryParams = new URLSearchParams();
    if (limit) queryParams.append('limit', limit.toString());

    const queryString = queryParams.toString();
    const endpoint = `/audit/user/${userId}${queryString ? `?${queryString}` : ''}`;
    const response = await apiFetch(endpoint);
    return handleResponse(response);
  },
};

