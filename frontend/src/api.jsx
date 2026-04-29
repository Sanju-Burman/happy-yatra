import axios from 'axios';

const apiBase = import.meta.env.VITE_Backend_API || 'http://localhost:9000/api';
const API = apiBase.replace(/\/+$/, '');

export const setAuthToken = (token) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
};

export const getStoredTokens = () => {
  return {
    accessToken: localStorage.getItem('accessToken'),
    refreshToken: localStorage.getItem('refreshToken'),
  };
};

export const storeTokens = (accessToken, refreshToken) => {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
  setAuthToken(accessToken);
};

export const clearTokens = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  setAuthToken(null);
};

export const getStoredUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const storeUser = (user) => {
  localStorage.setItem('user', JSON.stringify(user));
};

export const signup = async (email, password, name) => {
  const response = await axios.post(`${API}/auth/signup`, { email, password, name });
  const { access_token, refresh_token, user } = response.data;
  storeTokens(access_token, refresh_token);
  storeUser(user);
  return response.data;
};

export const login = async (email, password) => {
  const response = await axios.post(`${API}/auth/login`, { email, password });
  const { access_token, refresh_token, user } = response.data;
  storeTokens(access_token, refresh_token);
  storeUser(user);
  return response.data;
};

export const logout = async () => {
  try {
    const { accessToken, refreshToken } = getStoredTokens();
    if (accessToken && refreshToken) {
      await axios.post(`${API}/auth/logout`, {
        accessToken,
        refreshToken,
      });
    }
  } catch (error) {
    // Proceed with local cleanup even if the backend call fails
    console.error('Backend logout failed:', error);
  } finally {
    clearTokens();
  }
};

export const refreshAccessToken = async () => {
  const { refreshToken } = getStoredTokens();
  if (!refreshToken) throw new Error('No refresh token');

  const response = await axios.post(`${API}/auth/refresh`, { refresh_token: refreshToken });
  const { access_token, refresh_token } = response.data;
  storeTokens(access_token, refresh_token);
  return access_token;
};

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url.includes('/auth/refresh')) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest._retry = true;
          originalRequest.headers['Authorization'] = `Bearer ${token}`;
          return axios(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newAccessToken = await refreshAccessToken();
        processQueue(null, newAccessToken);
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        return axios(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearTokens();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

const { accessToken } = getStoredTokens();
if (accessToken) {
  setAuthToken(accessToken);
}

export const submitSurvey = async (preferences) => {
  // Map frontend state to backend validation schema requirements
  const budgetMapping = {
    'budget': 1,
    'moderate': 2,
    'expensive': 3,
    'luxury': 4
  };

  const payload = {
    travelStyle: preferences.travelStyle,
    budget: budgetMapping[preferences.budget] || 1,
    interests: preferences.interests,
    activities: preferences.activities
  };

  const response = await axios.post(`${API}/survey`, payload);
  return response.data;
};

export const getSurvey = async () => {
  const response = await axios.get(`${API}/survey`);
  return response.data;
};

export const getRecommendations = async () => {
  const response = await axios.post(`${API}/recommendations`);
  return response.data;
};

export const getDestinations = async (page = 1, limit = 12, trending = null) => {
  const params = { page, limit };
  if (trending !== null) params.trending = trending;
  const response = await axios.get(`${API}/destinations`, { params });
  return response.data;
};

export const getDestination = async (id) => {
  const response = await axios.get(`${API}/destinations/${id}`);
  return response.data;
};

export const saveDestination = async (id) => {
  const response = await axios.post(`${API}/saved-destinations/${id}`);
  return response.data;
};

export const unsaveDestination = async (id) => {
  const response = await axios.delete(`${API}/saved-destinations/${id}`);
  return response.data;
};

export const getSavedDestinations = async () => {
  const response = await axios.get(`${API}/saved-destinations`);
  return response.data;
};

export const getProfile = async () => {
  const response = await axios.get(`${API}/user/profile`);
  return response.data;
};

export const getConfig = async () => {
  const response = await axios.get(`${API}/config`);
  return response.data;
};
