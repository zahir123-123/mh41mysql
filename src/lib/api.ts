const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// Helper function to make API calls
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
};

// Auth API
export const authAPI = {
  register: (data: { email: string; password: string; full_name?: string; phone?: string }) =>
    apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  login: (data: { email: string; password: string }) =>
    apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getProfile: () => apiCall('/auth/profile'),
  
  updateProfile: (data: { full_name?: string; phone?: string }) =>
    apiCall('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

// Products API
export const productsAPI = {
  getAll: () => apiCall('/products'),
  getById: (id: string) => apiCall(`/products/${id}`),
  create: (data: any) =>
    apiCall('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    apiCall(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiCall(`/products/${id}`, {
      method: 'DELETE',
    }),
};

// Cars API
export const carsAPI = {
  getAll: () => apiCall('/cars'),
  getById: (id: string) => apiCall(`/cars/${id}`),
  create: (data: any) =>
    apiCall('/cars', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    apiCall(`/cars/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiCall(`/cars/${id}`, {
      method: 'DELETE',
    }),
};

// Bookings API
export const bookingsAPI = {
  getAll: () => apiCall('/bookings'),
  getById: (id: string) => apiCall(`/bookings/${id}`),
  create: (data: any) =>
    apiCall('/bookings', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    apiCall(`/bookings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiCall(`/bookings/${id}`, {
      method: 'DELETE',
    }),
};

// Services API
export const servicesAPI = {
  getAll: () => apiCall('/services'),
  getById: (id: string) => apiCall(`/services/${id}`),
  create: (data: any) =>
    apiCall('/services', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    apiCall(`/services/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiCall(`/services/${id}`, {
      method: 'DELETE',
    }),
};

// Categories API
export const categoriesAPI = {
  getAll: () => apiCall('/categories'),
  getById: (id: string) => apiCall(`/categories/${id}`),
  create: (data: any) =>
    apiCall('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    apiCall(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiCall(`/categories/${id}`, {
      method: 'DELETE',
    }),
};

// Notifications API
export const notificationsAPI = {
  getAll: () => apiCall('/notifications'),
  getById: (id: string) => apiCall(`/notifications/${id}`),
  create: (data: any) =>
    apiCall('/notifications', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    apiCall(`/notifications/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiCall(`/notifications/${id}`, {
      method: 'DELETE',
    }),
};

// Pickup Bookings API
export const pickupBookingsAPI = {
  getAll: () => apiCall('/pickup-bookings'),
  getById: (id: string) => apiCall(`/pickup-bookings/${id}`),
  create: (data: any) =>
    apiCall('/pickup-bookings', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    apiCall(`/pickup-bookings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiCall(`/pickup-bookings/${id}`, {
      method: 'DELETE',
    }),
};

// Engine Oil Services API
export const engineOilServicesAPI = {
  getAll: () => apiCall('/engine-oil-services'),
  getById: (id: string) => apiCall(`/engine-oil-services/${id}`),
  create: (data: any) =>
    apiCall('/engine-oil-services', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    apiCall(`/engine-oil-services/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiCall(`/engine-oil-services/${id}`, {
      method: 'DELETE',
    }),
};

// Foglights API
export const foglightsAPI = {
  getAll: () => apiCall('/foglights'),
  getById: (id: string) => apiCall(`/foglights/${id}`),
  create: (data: any) =>
    apiCall('/foglights', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    apiCall(`/foglights/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiCall(`/foglights/${id}`, {
      method: 'DELETE',
    }),
};

// Washing Services API
export const washingServicesAPI = {
  getAll: () => apiCall('/washing-services'),
  getById: (id: string) => apiCall(`/washing-services/${id}`),
  create: (data: any) =>
    apiCall('/washing-services', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    apiCall(`/washing-services/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiCall(`/washing-services/${id}`, {
      method: 'DELETE',
    }),
};

// Detailing Services API
export const detailingServicesAPI = {
  getAll: () => apiCall('/detailing-services'),
  getById: (id: string) => apiCall(`/detailing-services/${id}`),
  create: (data: any) =>
    apiCall('/detailing-services', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    apiCall(`/detailing-services/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiCall(`/detailing-services/${id}`, {
      method: 'DELETE',
    }),
};

// Detailing Gallery API
export const detailingGalleryAPI = {
  getAll: () => apiCall('/detailing-gallery'),
  getById: (id: string) => apiCall(`/detailing-gallery/${id}`),
  create: (data: any) =>
    apiCall('/detailing-gallery', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    apiCall(`/detailing-gallery/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiCall(`/detailing-gallery/${id}`, {
      method: 'DELETE',
    }),
};

// Addresses API
export const addressesAPI = {
  getAll: () => apiCall('/addresses'),
  getById: (id: string) => apiCall(`/addresses/${id}`),
  create: (data: any) =>
    apiCall('/addresses', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    apiCall(`/addresses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiCall(`/addresses/${id}`, {
      method: 'DELETE',
    }),
};

// Profiles API
export const profilesAPI = {
  getAll: () => apiCall('/profiles'),
  getById: (id: string) => apiCall(`/profiles/${id}`),
  create: (data: any) =>
    apiCall('/profiles', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    apiCall(`/profiles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiCall(`/profiles/${id}`, {
      method: 'DELETE',
    }),
};

// Upload API
export const uploadAPI = {
  uploadImage: async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    
    const token = getAuthToken();
    const headers: HeadersInit = {};
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(error.error || `Upload failed: ${response.status}`);
    }

    return response.json();
  },
};

// Auth utilities
export const authUtils = {
  setToken: (token: string) => localStorage.setItem('authToken', token),
  getToken: () => localStorage.getItem('authToken'),
  removeToken: () => localStorage.removeItem('authToken'),
  isAuthenticated: () => !!localStorage.getItem('authToken'),
}; 