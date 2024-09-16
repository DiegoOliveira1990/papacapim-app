import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUser, updateUser, deleteUser } from '../api'; // Importe a função deleteUser

export default function EditProfileScreen({ navigation }) {
  const [login, setLogin] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem('sessionId');
        const storedLogin = await AsyncStorage.getItem('userLogin'); // Carregar o login armazenado
        if (storedUserId && storedLogin) {
          setUserId(storedUserId);
          setLogin(storedLogin); // Define o login do usuário logado
          const userData = await getUser(storedLogin); // Chama a função getUser com o login correto
          setName(userData.name); // Define o nome recebido da API
        }
      } catch (error) {
        Alert.alert('Erro', 'Falha ao carregar dados do usuário.');
      }
    };

    loadUserData();
  }, []);

  const handleUpdateProfile = async () => {
    if (password !== passwordConfirmation) {
      Alert.alert('Erro!', 'As senhas não coincidem!');
      return;
    }

    try {
      // Atualizar os dados do usuário
      await updateUser(userId, login, name, password, passwordConfirmation);

      Alert.alert('Perfil atualizado com sucesso! Faça o login novamente!');
      navigation.navigate('Login'); // Redirecionar para a tela de login
    } catch (error) {
      if (error.response && error.response.data.errors) {
        const errorMessage = Object.values(error.response.data.errors).flat().join('\n');
        Alert.alert('Update Error', errorMessage);
      } else {
        Alert.alert('Erro!', 'Falha ao atualizar o perfil. Tente novamente.');
      }
    }
  };

  const confirmDeleteAccount = () => {
    Alert.alert(
      'Confirmação',
      'Tem certeza que deseja excluir? Essa ação não pode ser desfeita.',
      [
        {
          text: 'Cancelar',
          style: 'cancel', // Botão de cancelar
        },
        {
          text: 'Excluir',
          onPress: handleDeleteAccount, // Função que será chamada ao confirmar a exclusão
          style: 'destructive', // Estilo destrutivo para destacar que é uma ação perigosa
        },
      ]
    );
  };

  const handleDeleteAccount = async () => {
    try {
      console.log('Deleting user with ID:', userId); // Log do ID para exclusão
      await deleteUser(userId); // Chama a função para deletar o usuário
      await AsyncStorage.clear(); // Limpa os dados da sessão
      Alert.alert('Conta excluída com sucesso');
      navigation.navigate('Login'); // Redireciona para a tela de cadastro
    } catch (error) {
      console.error('Delete User Error:', error.response ? error.response.data : error.message); // Log detalhado do erro
      Alert.alert('Erro!', 'Falha ao excluir a conta. Tente novamente.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Editar Perfil</Text>
      <TextInput
        style={styles.input}
        placeholder="Login"
        value={login}
        onChangeText={setLogin}
      />
      <TextInput
        style={styles.input}
        placeholder="Nome"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Nova Senha"
        value={password}
        secureTextEntry
        onChangeText={setPassword}
      />
      <TextInput
        style={styles.input}
        placeholder="Confirmar Nova Senha"
        value={passwordConfirmation}
        secureTextEntry
        onChangeText={setPasswordConfirmation}
      />
      <TouchableOpacity style={styles.button} onPress={handleUpdateProfile}>
        <Text style={styles.buttonText}>Salvar Alterações</Text>
      </TouchableOpacity>

      {/* Botão para excluir conta */}
      <TouchableOpacity style={[styles.button, styles.deleteButton]} onPress={confirmDeleteAccount}>
        <Text style={styles.buttonText}>Excluir Conta</Text>
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
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
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
  deleteButton: {
    backgroundColor: 'red', // Botão de exclusão com cor diferenciada
  },
});
