import React, { useState, useEffect } from 'react';
import { View, Text, Image, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logoutUser } from '../api';

export default function FeedScreen({ navigation }) {
  const [sessionId, setSessionId] = useState(null);
  const [sessionToken, setSessionToken] = useState(null);
  const [userLogin, setUserLogin] = useState(null); // Adiciona um estado para o login do usuário

  useEffect(() => {
    const fetchSessionData = async () => {
      try {
        const storedSessionId = await AsyncStorage.getItem('sessionId');
        const storedSessionToken = await AsyncStorage.getItem('sessionToken');
        const storedUserLogin = await AsyncStorage.getItem('userLogin'); // Obtém o login do usuário logado
        setSessionId(storedSessionId);
        setSessionToken(storedSessionToken);
        setUserLogin(storedUserLogin); // Armazena o login no estado
      } catch (error) {
        console.error('Failed to load session data:', error);
        Alert.alert('Error', 'Failed to load session data.');
      }
    };

    fetchSessionData();
  }, []);

  const handleLogout = async () => {
    try {
      if (sessionId && sessionToken) {
        console.log('Attempting logout with Session ID:', sessionId);
        console.log('Attempting logout with Session Token:', sessionToken);

        await logoutUser(sessionId);

        await AsyncStorage.removeItem('sessionId');
        await AsyncStorage.removeItem('sessionToken');
        await AsyncStorage.removeItem('userLogin');

        Alert.alert('Logged out', 'You have been logged out successfully.');
        navigation.navigate('Login');
      } else {
        Alert.alert('Error', 'No active session found.');
      }
    } catch (error) {
      console.error('Logout Error:', error.response ? error.response.data : error.message);
      Alert.alert('Logout Error', 'Failed to logout. Please try again.');
    }
  };

  const dummyPosts = [
    {
      id: '1',
      user: {
        id: 'user1',
        name: 'Diego Oliveira',
        avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
      },
      content: 'Olá, essa é minha primeira postagem!!!',
      image: 'https://picsum.photos/300/200',
    },
    {
      id: '2',
      user: {
        id: 'user2',
        name: 'Rebeca',
        avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
      },
      content: 'Algum dia, em algum lugar!',
      image: 'https://picsum.photos/300/201',
    },
  ];

  // Renderiza cada item da lista de postagens
  const renderItem = ({ item }) => (
    <View style={styles.postContainer}>
      <TouchableOpacity onPress={() => navigation.navigate('Profile', { userId: item.user.id })}>
        <Image source={{ uri: item.user.avatar }} style={styles.avatar} />
      </TouchableOpacity>
      <View style={styles.postContent}>
        <Text style={styles.userName}>{item.user.name}</Text>
        <Text style={styles.postText}>{item.content}</Text>
        <Image source={{ uri: item.image }} style={styles.postImage} />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList data={dummyPosts} renderItem={renderItem} keyExtractor={(item) => item.id} />
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Post')}>
          <Text style={styles.buttonText}>Novo Post</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Profile', { login: userLogin })}>
          <Text style={styles.buttonText}>Perfil</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('EditProfile')}>
          <Text style={styles.buttonText}>Editar Perfil</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('SearchUser')}>
          <Text style={styles.buttonText}>Buscar Usuários</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleLogout}>
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  postContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  postContent: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  postText: {
    marginVertical: 5,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
});

