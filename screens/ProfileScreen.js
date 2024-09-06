import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { getUser } from '../api'; // Função para buscar o usuário

export default function ProfileScreen({ route }) {
  const { login } = route.params; // Obtendo o login passado pela navegação
  const [user, setUser] = useState(null); // Estado para armazenar os dados do usuário
  const [loading, setLoading] = useState(true); // Estado para controlar o carregamento

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        console.log('Fetching user data for login:', login); // Verificando o login passado
        const userData = await getUser(login); // Chamando a função da API para obter os dados do usuário
        setUser(userData); // Armazenando os dados do usuário no estado
        setLoading(false); // Finalizando o carregamento
      } catch (error) {
        console.error('Failed to fetch user data:', error);
        setLoading(false); // Finalizando o carregamento, mesmo em caso de erro
      }
    };

    fetchUserData(); // Executa a busca dos dados do usuário quando a tela é carregada
  }, [login]);

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  if (!user) {
    return <Text style={styles.errorText}>Usuário não encontrado</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.userName}>Nome: {user.name}</Text>
      <Text style={styles.userLogin}>Login: {user.login}</Text>
      <Text style={styles.userCreatedAt}>Criado em: {new Date(user.created_at).toLocaleDateString()}</Text>
      {/* Adicione outras informações do usuário conforme necessário */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  userName: {
    fontSize: 24,
    
  },
  userLogin: {
    fontSize: 18,
    color: 'gray',
  },
  userCreatedAt: {
    fontSize: 16,
    color: 'blue',
    marginTop: 10,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
  },
});