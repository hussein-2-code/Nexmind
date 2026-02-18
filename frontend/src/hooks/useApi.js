import { useAuth } from '../context/AuthContext';

export const useApi = () => {
  const { token, logout } = useAuth();

  const fetchWithAuth = async (url, options = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      // Handle 401 Unauthorized - token expired
      if (response.status === 401) {
        logout();
        throw new Error('Session expired. Please login again.');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      throw error;
    }
  };

  return {
    get: (url, options = {}) => fetchWithAuth(url, { ...options, method: 'GET' }),
    post: (url, body, options = {}) => fetchWithAuth(url, { 
      ...options, 
      method: 'POST',
      body: JSON.stringify(body) 
    }),
    put: (url, body, options = {}) => fetchWithAuth(url, { 
      ...options, 
      method: 'PUT',
      body: JSON.stringify(body) 
    }),
    delete: (url, options = {}) => fetchWithAuth(url, { ...options, method: 'DELETE' }),
    patch: (url, body, options = {}) => fetchWithAuth(url, { 
      ...options, 
      method: 'PATCH',
      body: JSON.stringify(body) 
    }),
  };
};