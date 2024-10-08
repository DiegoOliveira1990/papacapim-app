// api.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

const api = axios.create({
  baseURL: 'https://api.papacapim.just.pro.br', // URL base da API
  timeout: 5000,
});

// Interceptor para adicionar o token de sessão a todas as requisições
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('sessionToken');
    if (token) {
      config.headers['x-session-token'] = token; // Adiciona o token ao cabeçalho de autenticação
      console.log('Token enviado:', token); // Confirme o envio do token
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

    await AsyncStorage.removeItem('sessionToken'); // Remover token após logout
    console.log('Logout successful:', response.data);
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
export const listUsers = async (searchTerm = '') => {
  try {
    const response = await api.get('/users', {
      params: { search: searchTerm.trim() }, // Apenas o termo de busca
    });
    console.log('Status da API:', response.status);
    console.log('Dados retornados pela API:', response.data);
    return response.data;
  } catch (error) {
    console.error('Erro ao listar usuários:', error.response ? error.response.data : error.message);
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
    console.error('Get User Error:', error.response ? error.response.data : error.message); // Mostra detalhes do erro
    throw error; // Repassa o erro para ser tratado na tela
  }
};

// Função para buscar usuários
export const searchUsers = async (searchTerm, page = 1) => {
  try {
    console.log('Fazendo requisição para API com:', { search: searchTerm, page });
    const response = await api.get('/users', {
      params: { search: searchTerm, page }
    });
    console.log('Usuários encontrados:', response.data); // Log para verificar a resposta
    return response.data;
  } catch (error) {
    console.error('Search Users Error:', error.response ? error.response.data : error.message);
    throw error;
  }
};

// Função para seguir usuário
export const followUser = async (login) => {
  try {
    const response = await api.post(`/users/${login}/followers`);
    console.log('Follow User Response:', response.data); // Log da resposta
    return response.data;
  } catch (error) {
    console.error('Follow User Error:', error.response ? error.response.data : error.message);
    throw error;
  }
};

// Função para deixar de seguir usuário
export const unfollowUser = async (login, followerId) => {
  try {
    const response = await api.delete(`/users/${login}/followers/${followerId}`);
    console.log('Unfollow User Response:', response.data); // Log para verificar a resposta
    return response.data;
  } catch (error) {
    console.error('Unfollow User Error:', error.response ? error.response.data : error.message);
    throw error;
  }
};

// Função para listar seguidores de um usuário
export const listFollowers = async (login) => {
  try {
    const response = await api.get(`/users/${login}/followers`);
    console.log('Followers Response:', response.data); // Log para verificar a resposta
    return response.data;
  } catch (error) {
    console.error('Erro ao listar seguidores:', error.response ? error.response.data : error.message);
    throw error;
  }
};

// Função para buscar postagens do feed
export const getFeedPosts = async () => {
  try {
    const response = await api.get('/posts');
    console.log('Feed posts response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Erro ao obter postagens do feed:', error.response ? error.response.data : error.message);
    throw error;
  }
};

// Função para buscar o feed
export const fetchFeed = async () => {
  try {
    const response = await api.get('/posts'); // Endpoint que retorna o feed
    console.log('Feed carregado com sucesso:', response.data); // Log para verificar a resposta
    return response.data;
  } catch (error) {
    console.error('Erro ao carregar o feed:', error.response ? error.response.data : error.message);
    throw error;
  }
};


// Função para criar uma nova postagem
export const createPost = async (message) => {
  try {
    const response = await api.post('/posts', {
      post: {
        message,
      },
    });
    console.log('Post criado com sucesso:', response.data); // Log da resposta
    return response.data;
  } catch (error) {
    console.error('Erro ao criar a postagem:', error.response ? error.response.data : error.message);
    throw error;
  }
};

// Função para deletar uma postagem
export const deletePost = async (postId) => {
  try {
    const response = await api.delete(`/posts/${postId}`);
    return response.data;
  } catch (error) {
    console.error('Delete Post Error:', error.response ? error.response.data : error.message);
    throw error;
  }
};

// Função para responder a uma postagem
export const replyToPost = async (postId, message) => {
  try {
    const response = await api.post(`/posts/${postId}/replies`, {
      reply: {
        message,
      },
    });
    console.log('Reply to post response:', response.data); // Log da resposta
    return response.data;
  } catch (error) {
    console.error('Erro ao responder a postagem:', error.response ? error.response.data : error.message);
    throw error;
  }
};

// Função para obter as respostas de uma postagem
export const getRepliesForPost = async (postId) => {
  try {
    const response = await api.get(`/posts/${postId}/replies`);
    console.log('Replies Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Erro ao obter respostas da postagem:', error.response ? error.response.data : error.message);
    throw error;
  }
};

// Curtir postagem
export const likePost = async (postId) => {
  try {
    const response = await api.post(`/posts/${postId}/likes`);
    return response.data;
  } catch (error) {
    console.error('Erro ao curtir postagem:', error);
    throw error;
  }
};

// Descurtir postagem
export const unlikePost = async (postId, likeId) => {
  try {
    const response = await api.delete(`/posts/${postId}/likes/${likeId}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao descurtir postagem:', error);
    throw error;
  }
};

// Buscar postagens
export const searchPosts = async (searchTerm) => {
  try {
    const response = await api.get('/posts', { params: { search: searchTerm } });
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar postagens:', error);
    throw error;
  }
};
