import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUser, updateUser, deleteUser } from '../api';

export default function EditProfileScreen({ navigation }) {
  const [login, setLogin] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const storedUserLogin = await AsyncStorage.getItem('userLogin'); // Pegue o login do AsyncStorage
        if (storedUserLogin) {
          console.log('Login encontrado no AsyncStorage:', storedUserLogin);
          setLogin(storedUserLogin);
          const userData = await getUser(storedUserLogin); // Passe o login para obter os dados do usuário
          setName(userData.name); // Armazene o nome retornado
        } else {
          Alert.alert('Erro', 'Falha ao carregar o login do usuário.');
        }
      } catch (error) {
        console.error('Get User Error:', error.response ? error.response.data : error.message);
        Alert.alert('Erro', 'Falha ao carregar dados do usuário.');
      }
    };
  
    loadUserData(); // Chama a função ao carregar a tela
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
        Alert.alert('Erro de Atualização', errorMessage);
      } else {
        Alert.alert('Erro!', 'Falha ao atualizar o perfil. Tente novamente.');
      }
    }
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      'Confirmação',
      'Tem certeza de que deseja excluir sua conta? Essa ação não pode ser desfeita.',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Excluir',
          onPress: async () => {
            try {
              await deleteUser(userId); // Excluindo o usuário
              await AsyncStorage.clear(); // Limpando o AsyncStorage
              Alert.alert('Conta excluída com sucesso.');
              navigation.navigate('Login'); // Redirecionar para a tela de login
            } catch (error) {
              console.error('Delete Account Error:', error);
              Alert.alert('Erro', 'Falha ao excluir a conta.');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edital Perfil</Text>
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
      <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
        <Text style={styles.deleteButtonText}>Excluir Conta</Text>
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
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 5,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 18,
  },
});
