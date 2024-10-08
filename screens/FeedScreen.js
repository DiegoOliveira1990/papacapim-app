import React, { useState, useEffect } from 'react';
import { View, Text, Image, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFeedPosts, logoutUser, deletePost, getRepliesForPost } from '../api'; // Adicionar getRepliesForPost

export default function FeedScreen({ navigation }) {
  const [sessionId, setSessionId] = useState(null);
  const [sessionToken, setSessionToken] = useState(null);
  const [userLogin, setUserLogin] = useState(null);
  const [posts, setPosts] = useState([]); // Estado para as postagens do feed
  const [loading, setLoading] = useState(true); // Estado para carregar o feed

  useEffect(() => {
    const fetchSessionData = async () => {
      try {
        const storedSessionId = await AsyncStorage.getItem('sessionId');
        const storedSessionToken = await AsyncStorage.getItem('sessionToken');
        const storedUserLogin = await AsyncStorage.getItem('userLogin');
        setSessionId(storedSessionId);
        setSessionToken(storedSessionToken);
        setUserLogin(storedUserLogin);

        // Carregar o feed de postagens e suas respostas
        const feedPosts = await getFeedPosts();
        const postsWithReplies = await Promise.all(
          feedPosts.map(async (post) => {
            const replies = await getRepliesForPost(post.id);
            return { ...post, replies };
          })
        );
        setPosts(postsWithReplies); // Atualiza com as respostas
      } catch (error) {
        console.error('Failed to load session or feed data:', error);
        Alert.alert('Error', 'Failed to load session or feed data.');
      } finally {
        setLoading(false);
      }
    };

    fetchSessionData();
  }, []);

  const handleLogout = async () => {
    try {
      if (sessionId && sessionToken) {
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

  const handleDeletePost = async (postId) => {
    Alert.alert(
      'Confirmação',
      'Você tem certeza que deseja deletar esta postagem?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Deletar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePost(postId);
              setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
              Alert.alert('Sucesso', 'Postagem deletada com sucesso.');
            } catch (error) {
              console.error('Erro ao deletar postagem:', error);
              Alert.alert('Erro', 'Falha ao deletar a postagem.');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.postContainer}>
      <TouchableOpacity onPress={() => navigation.navigate('Profile', { userId: item.user_login })}>
        <Image source={{ uri: `https://api.papacapim.just.pro.br/avatars/${item.user_login}.png` }} style={styles.avatar} />
      </TouchableOpacity>
      <View style={styles.postContent}>
        <Text style={styles.userName}>{item.user_login}</Text>
        <Text style={styles.postText}>{item.message}</Text>

        {/* Botões de curtir, responder e deletar */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('PostReply', { postId: item.id })}>
            <Text style={styles.actionText}>Responder</Text>
          </TouchableOpacity>
          {item.user_login === userLogin && (
            <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeletePost(item.id)}>
              <Text style={styles.deleteButtonText}>Deletar</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Exibe respostas da postagem */}
        {item.replies && item.replies.length > 0 && (
          <View style={styles.repliesContainer}>
            <Text style={styles.repliesTitle}>Respostas:</Text>
            {item.replies.map((reply) => (
              <View key={reply.id} style={styles.reply}>
                <Text style={styles.replyUser}>{reply.user_login}</Text>
                <Text style={styles.replyText}>{reply.message}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
      />
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Post')}>
          <Text style={styles.buttonText}>Novo Post</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Profile', { login: userLogin })}>
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
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    marginRight: 10,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  postText: {
    marginVertical: 5,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: 5,
  },
  actionButton: {
    backgroundColor: '#007bff',
    padding: 8,
    borderRadius: 5,
    marginRight: 10,
  },
  actionText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: '#ff0000',
    padding: 8,
    borderRadius: 5,
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  repliesContainer: {
    marginTop: 10,
    paddingLeft: 20,
  },
  repliesTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  reply: {
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  replyUser: {
    fontWeight: 'bold',
  },
  replyText: {
    marginTop: 2,
  },
  buttonContainer: {
    marginTop: 20,
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
