import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Alert, StyleSheet } from 'react-native';
import { listUsers, followUser, unfollowUser } from '../api';

export default function SearchUserScreen() {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Função para buscar usuários
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      Alert.alert('Aviso', 'Por favor, insira um termo de busca.');
      return;
    }

    setLoading(true);
    try {
      console.log('Termo de busca enviado (formatado):', searchTerm);
      const usersFound = await listUsers(searchTerm);

      if (Array.isArray(usersFound) && usersFound.length > 0) {
        console.log('Usuários encontrados:', usersFound);
        setUsers(usersFound);
      } else {
        console.warn('Nenhum usuário encontrado.');
        Alert.alert('Nenhum usuário encontrado.');
      }
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      Alert.alert('Erro', 'Não foi possível buscar os usuários.');
    } finally {
      setLoading(false);
    }
  };

  // Função para seguir usuário
  const handleFollow = async (login) => {
    try {
      await followUser(login);
      Alert.alert('Sucesso', `Agora você está seguindo ${login}`);
    } catch (error) {
      Alert.alert('Erro', 'Falha ao seguir o usuário.');
    }
  };

  // Função para deixar de seguir usuário
  const handleUnfollow = async (login, followerId) => {
    try {
      await unfollowUser(login, followerId);
      Alert.alert('Sucesso', `Você deixou de seguir ${login}`);
    } catch (error) {
      Alert.alert('Erro', 'Falha ao deixar de seguir o usuário.');
    }
  };

  // Renderizar cada usuário
  const renderUser = ({ item }) => (
    <View style={styles.userContainer}>
      <Text style={styles.userName}>{item.name}</Text>
      <Text style={styles.userLogin}>{item.login}</Text>
      <TouchableOpacity style={styles.followButton} onPress={() => handleFollow(item.login)}>
        <Text style={styles.followButtonText}>Seguir</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.unfollowButton} onPress={() => handleUnfollow(item.login, item.followerId)}>
        <Text style={styles.unfollowButtonText}>Deixar de Seguir</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Buscar usuário"
        value={searchTerm}
        onChangeText={setSearchTerm}
      />
      <TouchableOpacity style={styles.searchButton} onPress={handleSearch} disabled={loading}>
        <Text style={styles.searchButtonText}>{loading ? 'Buscando...' : 'Buscar'}</Text>
      </TouchableOpacity>

      {!loading && (
        <FlatList
          data={users}
          keyExtractor={(item) => item.login} // Use 'login' como chave única
          renderItem={renderUser}
        />
      )}

      {loading && <Text>Carregando...</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  searchButton: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 18,
  },
  userContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  userLogin: {
    fontSize: 14,
    color: 'gray',
  },
  followButton: {
    backgroundColor: '#28a745',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: 'center',
  },
  followButtonText: {
    color: '#fff',
  },
  unfollowButton: {
    backgroundColor: '#dc3545',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: 'center',
  },
  unfollowButtonText: {
    color: '#fff',
  },
});
