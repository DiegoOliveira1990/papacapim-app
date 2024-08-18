import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function ProfileScreen({ route, navigation }) {
  const { userId } = route.params; // Recebe o userId do usuário passado pela navegação

  // Dados fictícios de usuários (poderia ser obtido de uma API)
  const users = {
    user1: {
      name: 'Diego Oliveira',
      bio: 'Estudante de tecnologia',
      posts: 5,
    },
    user2: {
      name: 'Rebeca',
      bio: 'Aventureira.',
      posts: 8,
    },
    user3: {
      name: 'Sérgio Reis',
      bio: 'Pai de Pet.',
      posts: 12,
    },
  };

  const user = users[userId];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{user.name}</Text>
      <Text style={styles.info}>Bio: {user.bio}</Text>
      <Text style={styles.info}>Posts: {user.posts}</Text>
      <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Voltar para o Feed</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
  },
  info: {
    fontSize: 18,
    marginBottom: 8,
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
