import axios from 'axios';

const API = import.meta.env.VITE_Backend_API;

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

export const logout = () => {
  clearTokens();
};

export const refreshAccessToken = async () => {
  const { refreshToken } = getStoredTokens();
  if (!refreshToken) throw new Error('No refresh token');

  const response = await axios.post(`${API}/auth/refresh`, { refresh_token: refreshToken });
  const { access_token, refresh_token } = response.data;
  storeTokens(access_token, refresh_token);
  return access_token;
};

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        await refreshAccessToken();
        return axios(originalRequest);
      } catch (refreshError) {
        clearTokens();
        window.location.href = '/login';
        return Promise.reject(refreshError);
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
  const response = await axios.post(`${API}/survey`, preferences);
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
  const response = await axios.get(`${API}/profile`);
  return response.data;
};

export const getConfig = async () => {
  const response = await axios.get(`${API}/config`);
  return response.data;
};