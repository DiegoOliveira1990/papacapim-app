import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { getFeedPosts, searchPosts, deletePost, likePost, unlikePost, getLikesForPost, logoutUser } from '../api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome } from '@expo/vector-icons';

export default function FeedScreen({ navigation }) {
  const [posts, setPosts] = useState([]); // Estado para armazenar postagens
  const [loading, setLoading] = useState(true); // Estado para indicar o carregamento do feed
  const [searchTerm, setSearchTerm] = useState(''); // Estado para armazenar o termo de busca
  const [menuOpen, setMenuOpen] = useState(false); // Estado para controlar a abertura do menu
  const [userLogin, setUserLogin] = useState(null); // Estado para armazenar o login do usuário
  const [likesState, setLikesState] = useState({}); // Estado para armazenar curtidas por post
  const [isSearchActive, setIsSearchActive] = useState(false); // Estado para controlar se a busca está ativa

  // Função para carregar postagens do feed e verificar curtidas
  const loadFeed = async (user) => {
    try {
      console.log('Carregando postagens do feed...');
      const feedPosts = await getFeedPosts(); // Chama a API para buscar as postagens
      console.log('Postagens recebidas:', feedPosts);

      if (feedPosts.length > 0) {
        const likesMap = {};
        // Verifica as curtidas para cada postagem
        for (let post of feedPosts) {
          const likes = await getLikesForPost(post.id);
          likesMap[post.id] = likes.some((like) => like.user_login === user); // Define se o post está curtido
        }
        setLikesState(likesMap); // Armazena o estado de curtidas
        setPosts(feedPosts); // Atualiza o estado com as postagens
      } else {
        Alert.alert('Aviso', 'Nenhuma postagem disponível.');
      }
    } catch (error) {
      console.error('Erro ao carregar o feed:', error);
      Alert.alert('Erro', 'Falha ao carregar as postagens.');
    } finally {
      setLoading(false); // Para de exibir o indicador de carregamento
    }
  };

  // Função para curtir ou descurtir uma postagem
  const handleLikeOrUnlikePost = async (postId) => {
    try {
      if (likesState[postId]) {
        // Se já curtiu, descurtir
        const likes = await getLikesForPost(postId);
        const userLike = likes.find((like) => like.user_login === userLogin);
        if (userLike) {
          await unlikePost(postId, userLike.id);
          setLikesState((prevState) => ({ ...prevState, [postId]: false })); // Atualiza estado para descurtido
        }
      } else {
        // Se não curtiu, curtir
        await likePost(postId);
        setLikesState((prevState) => ({ ...prevState, [postId]: true })); // Atualiza estado para curtido
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
              await deletePost(postId); // Chama a API para deletar a postagem
              setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId)); // Atualiza o estado do feed
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

  // Função para buscar postagens pelo termo de pesquisa
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      Alert.alert('Erro', 'Por favor, insira um termo de busca.');
      return;
    }

    setLoading(true);

    try {
      const searchResults = await searchPosts(searchTerm); // Chama a função de busca da API
      console.log('Resultados da busca:', searchResults);
      if (searchResults.length > 0) {
        setPosts(searchResults); // Atualiza o estado com os resultados da busca
        setIsSearchActive(true); // Define a busca como ativa
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

  // Função para voltar ao feed após a busca
  const handleBackToFeed = () => {
    setSearchTerm('');
    setIsSearchActive(false);
    loadFeed(userLogin); // Carrega o feed original
  };

  // Carrega as postagens ao montar o componente
  useEffect(() => {
    const fetchUserLogin = async () => {
      const storedUserLogin = await AsyncStorage.getItem('userLogin'); // Obtenha o login do usuário atual
      setUserLogin(storedUserLogin);
      if (storedUserLogin) {
        await loadFeed(storedUserLogin); // Carrega o feed para o usuário logado
      }
    };
    fetchUserLogin();
  }, []);

  // Função de logout
  const handleLogout = async () => {
    const sessionId = await AsyncStorage.getItem('sessionId');
    try {
      await logoutUser(sessionId);
      await AsyncStorage.clear(); // Limpar dados armazenados localmente
      navigation.navigate('Login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      Alert.alert('Erro', 'Falha ao fazer logout.');
    }
  };

  // Renderização de cada item (post) da lista
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
            name={likesState[item.id] ? "thumbs-up" : "thumbs-o-up"} // Muda o ícone conforme curtido ou não
            size={20}
            color={likesState[item.id] ? '#00ff00' : '#ccc'} // Verde se curtido, cinza se não curtido
          />
        </TouchableOpacity>
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

      {/* Menu Expansível */}
      <View style={styles.menuContainer}>
        {/* Botão principal do menu */}
        <TouchableOpacity style={styles.menuButtonMain} onPress={() => setMenuOpen(!menuOpen)}>
          <FontAwesome name={menuOpen ? "times" : "bars"} size={24} color="#fff" />
        </TouchableOpacity>

        {/* Menu de Ações */}
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
            <TouchableOpacity style={styles.menuButton} onPress={handleLogout}>
              <FontAwesome name="sign-out" size={24} color="#fff" />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
