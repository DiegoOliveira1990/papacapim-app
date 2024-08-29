// api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.papacapim.just.pro.br:8000', // Substitua pela URL correta da sua API
  timeout: 5000,
});

export const registerUser = async (name, email, username, password) => {
  try {
    const response = await api.post('/register', {
      name,
      email,
      username,
      password,
    });
    return response.data;
  } catch (error) {
    console.error('Registration Error:', error);
    throw error;
  }
};

export const loginUser = async (username, password) => {
  try {
    const response = await api.post('/login', {
      username,
      password,
    });
    return response.data;
  } catch (error) {
    console.error('Login Error:', error);
    throw error;
  }
};

// Adicione outras funções para editar perfil, excluir conta, etc.
