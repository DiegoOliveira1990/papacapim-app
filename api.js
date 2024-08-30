// api.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({
  baseURL: 'https://api.papacapim.just.pro.br:8000', // URL base da API
  timeout: 5000,
});

// Interceptor para adicionar o token de sessão a todas as requisições
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('sessionToken');
    if (token) {
      config.headers['x-session-token'] = token; // Adiciona o token ao cabeçalho de autenticação
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const registerUser = async (login, name, password, password_confirmation) => {
  try {
    const response = await api.post('/users', {
      user: {
        login,
        name,
        password,
        password_confirmation,
      }
    });
    return response.data;
  } catch (error) {
    console.error('Registration Error:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const loginUser = async (login, password) => {
  try {
    const response = await api.post('/sessions', {
      login,
      password,
    });
    return response.data;
  } catch (error) {
    console.error('Login Error:', error.response ? error.response.data : error.message);
    throw error;
  }
};

// Encerrar Sessão (Logout)
export const logoutUser = async (sessionId) => {
  try {
    await api.delete(`/sessions/${sessionId}`);
  } catch (error) {
    console.error('Logout Error:', error.response ? error.response.data : error.message);
    throw error;
  }
};

// Alterar Dados do Usuário
export const updateUser = async (userId, login, name, password, password_confirmation) => {
  try {
    const response = await api.patch(`/users/${userId}`, {
      user: {
        login,
        name,
        password,
        password_confirmation,
      }
    });
    return response.data;
  } catch (error) {
    console.error('Update User Error:', error.response ? error.response.data : error.message);
    throw error;
  }
};

// Listar Usuários
export const listUsers = async (search = '', page = 1) => {
  try {
    const response = await api.get('/users', {
      params: { search, page }
    });
    return response.data;
  } catch (error) {
    console.error('List Users Error:', error.response ? error.response.data : error.message);
    throw error;
  }
};

// Obter Usuário Específico
export const getUser = async (login) => {
  try {
    const response = await api.get(`/users/${login}`);
    return response.data;
  } catch (error) {
    console.error('Get User Error:', error.response ? error.response.data : error.message);
    throw error;
  }
};