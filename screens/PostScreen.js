import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { createPost } from '../api';

export default function PostScreen({ navigation }) {
  const [postContent, setPostContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePost = async () => {
    if (!postContent.trim()) {
      Alert.alert('Erro', 'O conteúdo da postagem não pode estar vazio.');
      return;
    }

    setLoading(true);

    try {
      await createPost(postContent);
      setLoading(false);
      Alert.alert('Sucesso', 'Postagem criada com sucesso.');
      navigation.goBack(); // Volta para a tela de feed
    } catch (error) {
      setLoading(false);
      console.error('Erro ao criar a postagem:', error);
      Alert.alert('Erro', 'Falha ao criar a postagem. Tente novamente.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nova postagem</Text>
      <TextInput
        style={styles.input}
        placeholder="O que você deseja postar?"
        value={postContent}
        onChangeText={setPostContent}
        multiline
      />
      <TouchableOpacity style={styles.button} onPress={handlePost} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Postando...' : 'Postar'}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
        <Text style={styles.buttonText}>Cancelar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    height: 100,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
    paddingVertical: 8,
    textAlignVertical: 'top',
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
