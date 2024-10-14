import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { getFeedPosts, searchPosts, logoutUser } from '../api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome } from '@expo/vector-icons';

export default function FeedScreen({ navigation }) {
  const [posts, setPosts] = useState([]); // Estado para armazenar postagens
  const [loading, setLoading] = useState(true); // Estado para indicar o carregamento do feed
  const [searchTerm, setSearchTerm] = useState(''); // Estado para armazenar o termo de busca
  const [menuOpen, setMenuOpen] = useState(false); // Estado para controlar a abertura do menu
  const [userLogin, setUserLogin] = useState(null); // Estado para armazenar o login do usuário
  const [isSearchActive, setIsSearchActive] = useState(false); // Estado para controlar se a busca está ativa

  // Função para carregar postagens do feed
  const loadFeed = async () => {
    try {
      console.log('Carregando postagens do feed...');
      const feedPosts = await getFeedPosts(); // Chama a API para buscar as postagens
      console.log('Postagens recebidas:', feedPosts);
      if (feedPosts.length > 0) {
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
    loadFeed(); // Carrega o feed original
  };

  // Carrega as postagens ao montar o componente
  useEffect(() => {
    const fetchUserLogin = async () => {
      const storedUserLogin = await AsyncStorage.getItem('userLogin'); // Obtenha o login do usuário atual
      setUserLogin(storedUserLogin);
    };
    fetchUserLogin();
    loadFeed();
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
      <Text style={styles.postUserName}>
        {item.user_login ? item.user_login : 'Usuário Desconhecido'}
      </Text> 
      <Text style={styles.postText}>
        {item.message}
      </Text>
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
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  postUserName: { // Estilo para o nome do usuário
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: 5,
  },
  postText: {
    fontSize: 16,
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
    bottom: 80, // Move o menu para cima quando aberto
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
