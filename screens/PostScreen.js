import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

export default function PostScreen({ navigation }) {
  const [postContent, setPostContent] = useState('');

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
      <TouchableOpacity style={styles.button} onPress={() => {
        // Aqui você pode adicionar a lógica para enviar o post para a API ou simular a postagem
        // Por enquanto, vamos apenas voltar para a tela de feed
        navigation.goBack();
      }}>
        <Text style={styles.buttonText}>Postar</Text>
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
