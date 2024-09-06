// api.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

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

// Função para realizar o login e armazenar a sessão
export const loginUser = async (login, password) => {
  try {
    const response = await api.post('/sessions', {
      login,
      password,
    });

    const { id, token, user_login } = response.data;

    // Armazenando sessionId, sessionToken, e userLogin no AsyncStorage
    await AsyncStorage.setItem('sessionId', id.toString());
    await AsyncStorage.setItem('sessionToken', token);
    await AsyncStorage.setItem('userLogin', user_login);

    return response.data;
  } catch (error) {
    console.error('Login Error:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const logoutUser = async (sessionId) => {
  try {
    const token = await AsyncStorage.getItem('sessionToken');
    console.log('Attempting logout with Session ID:', sessionId);
    console.log('Attempting logout with Session Token:', token);

    if (!sessionId) {
      throw new Error('Session ID is missing or invalid.');
    }

    const response = await api.delete(`/sessions/${sessionId}`, {
      headers: { 'x-session-token': token },
    });

    console.log('Logout successful:', response.data);
  } catch (error) {
    if (error.response) {
      console.error('Logout Error Data:', error.response.data);
      console.error('Logout Error Status:', error.response.status);
      console.error('Logout Error Headers:', error.response.headers);
      Alert.alert('Logout Error', `Failed with status ${error.response.status}`);
    } else if (error.request) {
      console.error('Logout Request Error:', error.request);
      Alert.alert('Logout Error', 'No response received from server.');
    } else {
      console.error('Logout Unknown Error:', error.message);
      Alert.alert('Logout Error', error.message);
    }
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

//Deletar usuário
export const deleteUser = async (userId) => {
  try {
    const token = await AsyncStorage.getItem('sessionToken');
    const response = await api.delete(`/users/${userId}`, {
      headers: { 'x-session-token': token },
    });
    return response.data;
  } catch (error) {
    console.error('Delete User Error:', error.response ? error.response.data : error.message);
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
    console.log('Fetching user with login:', login); // Log para depuração
    const response = await api.get(`/users/${login}`); // Certifique-se de que o login está sendo usado corretamente
    return response.data;
  } catch (error) {
    console.error('Get User Error:', error.response ? error.response.data : error.message);
    throw error;
  }
};