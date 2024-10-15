import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Modal } from 'react-native';
import { getFeedPosts, searchPosts, deletePost, likePost, unlikePost, getLikesForPost, getRepliesForPost, replyToPost, logoutUser } from '../api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons';

export default function FeedScreen({ navigation }) {
  const [posts, setPosts] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [userLogin, setUserLogin] = useState(null);
  const [likesState, setLikesState] = useState({});
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [isReplyModalVisible, setReplyModalVisible] = useState(false);

  // Função para carregar postagens e respostas
  const loadFeed = async (user) => {
    setLoading(true); // Ativa o estado de carregamento
    try {
      const feedPosts = await getFeedPosts();
      if (feedPosts.length > 0) {
        const likesMap = {};
        for (let post of feedPosts) {
          const likes = await getLikesForPost(post.id);
          likesMap[post.id] = likes.some((like) => like.user_login === user);
          post.replies = await getRepliesForPost(post.id);
        }
        setLikesState(likesMap);
        setPosts(feedPosts);
      } else {
        Alert.alert('Aviso', 'Nenhuma postagem disponível.');
      }
    } catch (error) {
      console.error('Erro ao carregar o feed:', error);
      Alert.alert('Erro', 'Falha ao carregar as postagens.');
    } finally {
      setLoading(false); // Desativa o estado de carregamento
    }
  };

  // Função para curtir ou descurtir uma postagem
  const handleLikeOrUnlikePost = async (postId) => {
    try {
      if (likesState[postId]) {
        const likes = await getLikesForPost(postId);
        const userLike = likes.find((like) => like.user_login === userLogin);
        if (userLike) {
          await unlikePost(postId, userLike.id);
          setLikesState((prevState) => ({ ...prevState, [postId]: false }));
        }
      } else {
        await likePost(postId);
        setLikesState((prevState) => ({ ...prevState, [postId]: true }));
      }
    } catch (error) {
      console.error('Erro ao curtir/descurtir postagem:', error.response?.data || error.message);
      Alert.alert('Erro', 'Falha ao curtir/descurtir a postagem.');
    }
  };

  // Função para deletar postagem
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

  // Função para abrir o modal de resposta
  const handleReply = (postId) => {
    setSelectedPostId(postId);
    setReplyModalVisible(true);
  };

  // Função para enviar resposta
  const handleSendReply = async () => {
    if (!replyMessage.trim()) {
      Alert.alert('Erro', 'Por favor, escreva uma mensagem.');
      return;
    }

    try {
      await replyToPost(selectedPostId, replyMessage);
      setReplyModalVisible(false);
      setReplyMessage('');
      loadFeed(userLogin);
      Alert.alert('Sucesso', 'Resposta enviada com sucesso.');
    } catch (error) {
      console.error('Erro ao responder a postagem:', error);
      Alert.alert('Erro', 'Falha ao responder a postagem.');
    }
  };

  // Função para buscar postagens
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      Alert.alert('Erro', 'Por favor, insira um termo de busca.');
      return;
    }

    setLoading(true);

    try {
      const searchResults = await searchPosts(searchTerm);
      if (searchResults.length > 0) {
        setPosts(searchResults);
        setIsSearchActive(true);
      } else {
        Alert.alert('Nenhuma postagem encontrada.');
      }
    } catch (error) {
      console.error('Erro ao buscar postagens:', error);
      Alert.alert('Erro', 'Falha ao buscar postagens.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToFeed = () => {
    setSearchTerm('');
    setIsSearchActive(false);
    loadFeed(userLogin);
  };

  useEffect(() => {
    const fetchUserLogin = async () => {
      const storedUserLogin = await AsyncStorage.getItem('userLogin');
      setUserLogin(storedUserLogin);
      if (storedUserLogin) {
        await loadFeed(storedUserLogin);
      }
    };
    fetchUserLogin();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadFeed(userLogin); // Carrega o feed quando a tela for foco
    }, [userLogin])
  );
  
  // Função de logout
  const handleLogout = async () => {
    if (loading) return; // Evita logout durante o carregamento
    const sessionId = await AsyncStorage.getItem('sessionId');
    try {
      await logoutUser(sessionId);
      await AsyncStorage.clear();
      navigation.navigate('Login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      Alert.alert('Erro', 'Falha ao fazer logout.');
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.postContainer}>
      <View style={styles.postContent}>
        <Text style={styles.postUserName}>
          {item.user_login ? item.user_login : 'Usuário Desconhecido'}
        </Text>
        <Text style={styles.postText}>
          {item.message}
        </Text>
      </View>
      <View style={styles.actions}>
        {item.user_login === userLogin && (
          <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeletePost(item.id)}>
            <FontAwesome name="trash" size={20} color="#fff" />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.likeButton}
          onPress={() => handleLikeOrUnlikePost(item.id)}
        >
          <FontAwesome
            name={likesState[item.id] ? "thumbs-up" : "thumbs-o-up"}
            size={20}
            color={likesState[item.id] ? '#00ff00' : '#ccc'}
          />
        </TouchableOpacity>
        {/* Botão de responder */}
        <TouchableOpacity style={styles.replyButton} onPress={() => handleReply(item.id)}>
          <FontAwesome name="reply" size={20} color="#fff" />
          <Text style={styles.replyButtonText}>Responder</Text>
        </TouchableOpacity>
      </View>
      {/* Exibir respostas */}
      {item.replies && item.replies.length > 0 && (
        <View style={styles.repliesContainer}>
          <Text style={styles.repliesTitle}>Respostas:</Text>
          {item.replies.map((reply) => (
            <View key={reply.id} style={styles.replyItem}>
              <Text style={styles.replyUserName}>{reply.user_login}</Text>
              <Text>{reply.message}</Text>
            </View>
          ))}
        </View>
      )}
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
      {/* Campo de busca */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Pesquisar postagens..."
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <FontAwesome name="search" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Lista de postagens */}
      <FlatList
        data={posts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
      />

      {/* Botão de Voltar ao Feed */}
      {isSearchActive && (
        <TouchableOpacity style={styles.backToFeedButton} onPress={handleBackToFeed}>
          <Text style={styles.backToFeedButtonText}>Voltar ao Feed</Text>
        </TouchableOpacity>
      )}

      {/* Modal de Resposta */}
      <Modal
        visible={isReplyModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setReplyModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TextInput
              style={styles.replyInput}
              placeholder="Escreva sua resposta..."
              value={replyMessage}
              onChangeText={setReplyMessage}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalButton} onPress={handleSendReply}>
                <Text style={styles.modalButtonText}>Enviar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButton} onPress={() => setReplyModalVisible(false)}>
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Menu Expansível */}
      <View style={styles.menuContainer}>
        <TouchableOpacity style={styles.menuButtonMain} onPress={() => setMenuOpen(!menuOpen)}>
          <FontAwesome name={menuOpen ? "times" : "bars"} size={24} color="#fff" />
        </TouchableOpacity>

        {menuOpen && (
          <View style={styles.menu}>
            <TouchableOpacity style={styles.menuButton} onPress={() => navigation.navigate('Post')}>
              <FontAwesome name="pencil" size={24} color="#fff" />
              <Text style={styles.menuButtonText}>Novo Post</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuButton} onPress={() => navigation.navigate('Profile', { login: userLogin })}>
              <FontAwesome name="user" size={24} color="#fff" />
              <Text style={styles.menuButtonText}>Perfil</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuButton} onPress={() => navigation.navigate('EditProfile')}>
              <FontAwesome name="edit" size={24} color="#fff" />
              <Text style={styles.menuButtonText}>Editar Perfil</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuButton} onPress={() => navigation.navigate('SearchUser')}>
              <FontAwesome name="search" size={24} color="#fff" />
              <Text style={styles.menuButtonText}>Buscar Usuários</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuButton} onPress={handleLogout} disabled={loading}>
              <FontAwesome name="sign-out" size={24} color={loading ? "#ccc" : "#fff"} />
              <Text style={styles.menuButtonText}>Logout</Text>
            </TouchableOpacity>
          </View>
        )}
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
    flexDirection: 'column',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  postContent: {
    flex: 1,
  },
  postUserName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: 5,
  },
  postText: {
    fontSize: 16,
  },
  actions: {
    flexDirection: 'row',
    marginTop: 10,
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#ff4d4d',
    padding: 5,
    borderRadius: 5,
    marginLeft: 10,
  },
  likeButton: {
    backgroundColor: '#007bff',
    padding: 5,
    borderRadius: 5,
    marginLeft: 10,
  },
  replyButton: {
    backgroundColor: '#007bff',
    padding: 5,
    borderRadius: 5,
    marginLeft: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  replyButtonText: {
    color: '#fff',
    marginLeft: 5,
  },
  repliesContainer: {
    marginTop: 10,
    paddingLeft: 20,
    borderLeftWidth: 2,
    borderLeftColor: '#007bff',
  },
  repliesTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#007bff',
  },
  replyItem: {
    marginBottom: 10,
  },
  replyUserName: {
    fontWeight: 'bold',
    color: '#007bff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
  },
  searchButton: {
    backgroundColor: '#007bff',
    padding: 10,
    marginLeft: 10,
    borderRadius: 5,
  },
  backToFeedButton: {
    backgroundColor: '#28a745',
    padding: 10,
    marginTop: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  backToFeedButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
  },
  replyInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  menuContainer: {
    position: 'absolute',
    bottom: 60,
    right: 30,
    alignItems: 'center',
  },
  menuButtonMain: {
    backgroundColor: '#007bff',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  menu: {
    position: 'absolute',
    bottom: 80,
    right: 0,
    alignItems: 'center',
  },
  menuButton: {
    backgroundColor: '#007bff',
    width: 150,
    paddingVertical: 10,
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    elevation: 5,
  },
  menuButtonText: {
    color: '#fff',
    marginLeft: 10,
    fontSize: 14,
  },
});
