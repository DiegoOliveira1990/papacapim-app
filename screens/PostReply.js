import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { replyToPost } from '../api'; // Certifique-se de que essa função existe na API

export default function PostReplyScreen({ route, navigation }) {
  const [replyContent, setReplyContent] = useState('');
  const { postId } = route.params; // Obtém o ID da postagem

  const handleReply = async () => {
    if (!replyContent.trim()) {
      Alert.alert('Erro', 'O conteúdo da resposta não pode estar vazio.');
      return;
    }

    try {
      await replyToPost(postId, replyContent); // Envia a resposta para a API
      Alert.alert('Sucesso', 'Resposta enviada com sucesso.');
      navigation.goBack(); // Volta para a tela anterior
    } catch (error) {
      console.error('Erro ao enviar resposta:', error);
      Alert.alert('Erro', 'Falha ao enviar a resposta. Tente novamente.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Responder à Postagem</Text>
      <TextInput
        style={styles.input}
        placeholder="Escreva sua resposta aqui..."
        value={replyContent}
        onChangeText={setReplyContent}
        multiline
      />
      <TouchableOpacity style={styles.button} onPress={handleReply}>
        <Text style={styles.buttonText}>Enviar Resposta</Text>
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
