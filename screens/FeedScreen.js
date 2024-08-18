import React from 'react';
import { View, Text, Image, FlatList, TouchableOpacity, Button, StyleSheet } from 'react-native';

export default function FeedScreen({ navigation }) {
  // Dados fictícios de postagens
  const dummyPosts = [
    {
      id: '1',
      user: {
        id: 'user1',
        name: 'Diego Oliveira',
        avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
      },
      content: 'Olá, essa é minha primeira postagem!!!',
      image: 'https://picsum.photos/300/200', // Imagem fictícia para a postagem
    },
    {
      id: '2',
      user: {
        id: 'user2',
        name: 'Rebeca',
        avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
      },
      content: 'Algum dia, em algum lugar!',
      image: 'https://picsum.photos/300/201', // Imagem fictícia para a postagem
    },
    {
      id: '3',
      user: {
        id: 'user3',
        name: 'Sérgio Reis',
        avatar: 'https://randomuser.me/api/portraits/men/2.jpg',
      },
      content: 'Amo a vida no campo!',
      image: 'https://picsum.photos/300/202', // Imagem fictícia para a postagem
    },
  ];

  // Renderiza cada item da lista de postagens
  const renderItem = ({ item }) => (
    <View style={styles.postContainer}>
      <TouchableOpacity
        onPress={() => navigation.navigate('Profile', { userId: item.user.id })}
      >
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
      <FlatList
        data={dummyPosts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Post')}>
          <Text style={styles.buttonText}>Novo Post</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('EditProfile')}>
          <Text style={styles.buttonText}>Editar Perfil</Text>
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

