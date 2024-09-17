import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Alert, StyleSheet } from 'react-native';
import { listUsers, followUser, unfollowUser, listFollowers } from '../api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SearchUserScreen() {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [followingStatus, setFollowingStatus] = useState({}); // Para armazenar o estado de seguir/deixar de seguir para cada usuário

  // Função para verificar se o usuário está sendo seguido
  const checkIfFollowing = async (login) => {
    try {
      const followers = await listFollowers(login);
      const currentUserLogin = await AsyncStorage.getItem('userLogin');
      if (followers.length === 0) {
        return false;
      }
      return followers.some(follower => follower.follower_login === currentUserLogin);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return false; // Trata o caso de login inválido ou sem seguidores
      }
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
            const isFollowing = await checkIfFollowing(user.login); // Verifica se o usuário já está sendo seguido
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
      const followData = await followUser(login); // Chamada da API para seguir
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
      const currentUserLogin = await AsyncStorage.getItem('userLogin');
      
      // Encontrar o seguidor correspondente ao usuário logado
      const followerData = followers.find(follower => follower.follower_login === currentUserLogin);
      
      if (followerData && followerData.follower_id) {
        console.log(`ID do seguidor para deixar de seguir: ${followerData.follower_id}`);
  
        // Chamada para a API com o ID do seguidor correto
        await unfollowUser(login, followerData.follower_id);
        
        // Atualizar o estado dos usuários
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
        {/* Botão de Seguir */}
        <TouchableOpacity
          style={[styles.followButton, { backgroundColor: !item.isFollowing ? '#28a745' : '#d3d3d3' }]}
          onPress={() => !item.isFollowing ? handleFollow(item.login) : null} // Torna inclicável
          disabled={item.isFollowing} // Desativa o botão se o usuário já estiver sendo seguido
        >
          <Text style={styles.followButtonText}>Seguir</Text>
        </TouchableOpacity>
  
        {/* Botão de Deixar de Seguir */}
        <TouchableOpacity
          style={[styles.unfollowButton, { backgroundColor: item.isFollowing ? '#dc3545' : '#d3d3d3' }]}
          onPress={() => item.isFollowing ? handleUnfollow(item.login) : null} // Torna inclicável
          disabled={!item.isFollowing} // Desativa o botão se o usuário não estiver sendo seguido
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



