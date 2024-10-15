import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Alert, StyleSheet } from 'react-native';
import { listUsers, followUser, unfollowUser, listFollowers } from '../api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SearchUserScreen({ navigation }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userLogin, setUserLogin] = useState(null); // Adicionando estado para o login do usuário
  const [followingStatus, setFollowingStatus] = useState({});

  useEffect(() => {
    const fetchUserLogin = async () => {
      const login = await AsyncStorage.getItem('userLogin'); // Obtenha o login do usuário atual
      setUserLogin(login);
    };
    fetchUserLogin();
  }, []);

  // Função para verificar se o usuário está sendo seguido
  const checkIfFollowing = async (login) => {
    try {
      const followers = await listFollowers(login);
      if (!userLogin) return false; // Verifica se o login do usuário está disponível
      return followers.some(follower => follower.follower_login === userLogin);
    } catch (error) {
      console.error('Erro ao verificar se está seguindo:', error);
      return false;
    }
  };

  // Função para buscar usuários
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      Alert.alert('Aviso', 'Por favor, insira um termo de busca.');
      return;
    }

    setLoading(true);
    try {
      const usersFound = await listUsers(searchTerm);
      if (usersFound.length > 0) {
        const updatedUsers = await Promise.all(
          usersFound.map(async (user) => {
            const isFollowing = await checkIfFollowing(user.login);
            return { ...user, isFollowing };
          })
        );
        setUsers(updatedUsers);
      } else {
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
      setUsers((prevUsers) =>
        prevUsers.map(user =>
          user.login === login ? { ...user, isFollowing: true } : user
        )
      );
      Alert.alert('Sucesso', `Agora você está seguindo ${login}`);
    } catch (error) {
      console.error('Erro ao seguir usuário:', error);
      Alert.alert('Erro', 'Falha ao seguir o usuário.');
    }
  };

  // Função para deixar de seguir usuário
  const handleUnfollow = async (login) => {
    try {
      const followers = await listFollowers(login);
      const followerData = followers.find(follower => follower.follower_login === userLogin);
      
      if (followerData && followerData.follower_id) {
        await unfollowUser(login, followerData.follower_id);
        setUsers((prevUsers) =>
          prevUsers.map(user =>
            user.login === login ? { ...user, isFollowing: false } : user
          )
        );
        Alert.alert('Sucesso', `Você deixou de seguir ${login}`);
      } else {
        Alert.alert('Erro', 'Não foi possível encontrar o ID do seguidor.');
      }
    } catch (error) {
      console.error('Erro ao deixar de seguir usuário:', error);
      Alert.alert('Erro', 'Falha ao deixar de seguir o usuário.');
    }
  };

  // Renderização de cada usuário com ambos botões
  const renderUser = ({ item }) => (
    <View style={styles.userContainer}>
      <Text style={styles.userName}>{item.name}</Text>
      <Text style={styles.userLogin}>{item.login}</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.followButton, { backgroundColor: !item.isFollowing ? '#28a745' : '#d3d3d3' }]}
          onPress={() => !item.isFollowing ? handleFollow(item.login) : null}
          disabled={item.isFollowing}
        >
          <Text style={styles.followButtonText}>Seguir</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.unfollowButton, { backgroundColor: item.isFollowing ? '#dc3545' : '#d3d3d3' }]}
          onPress={() => item.isFollowing ? handleUnfollow(item.login) : null}
          disabled={!item.isFollowing}
        >
          <Text style={styles.unfollowButtonText}>Deixar de Seguir</Text>
        </TouchableOpacity>
      </View>
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
      <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
        <Text style={styles.searchButtonText}>Buscar</Text>
      </TouchableOpacity>

      <FlatList
        data={users}
        keyExtractor={(item) => item.login}
        renderItem={renderUser}
      />
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  followButton: {
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginRight: 10,
    flex: 1,
  },
  followButtonText: {
    color: '#fff',
  },
  unfollowButton: {
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    flex: 1,
  },
  unfollowButtonText: {
    color: '#fff',
  },
});
