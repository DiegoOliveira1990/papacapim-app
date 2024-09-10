import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUser, updateUser, loginUser } from '../api';

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
        if (storedUserId) {
          setUserId(storedUserId);
          const userData = await getUser(login);
          setLogin(userData.login);
          setName(userData.name);
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
});
