import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUser, updateUser, logoutUser } from '../api';

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
          const userData = await getUser(login); // Supondo que o login esteja salvo
          setLogin(userData.login);
          setName(userData.name);
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to load user data.');
      }
    };

    loadUserData();
  }, []);

  const handleUpdateProfile = async () => {
    if (password !== passwordConfirmation) {
      Alert.alert('Error', 'Passwords do not match!');
      return;
    }

    try {
      const result = await updateUser(userId, login, name, password, passwordConfirmation);

      // Verificação do sessionId antes do logout
      const sessionId = await AsyncStorage.getItem('sessionId');
      const sessionToken = await AsyncStorage.getItem('sessionToken');

      if (!sessionId || !sessionToken) {
        Alert.alert('Session Error', 'No active session found. Please login again.');
        navigation.navigate('Login');
        return;
      }

      // Logar informações antes de tentar o logout
      console.log('Attempting logout with Session ID:', sessionId);
      console.log('Attempting logout with Session Token:', sessionToken);

      // Logout após a atualização dos dados
      await logoutUser(sessionId);
      await AsyncStorage.removeItem('sessionId');
      await AsyncStorage.removeItem('sessionToken');
      Alert.alert('Profile Updated', 'Your profile has been updated successfully. Please log in again.');
      navigation.navigate('Login');
    } catch (error) {
      console.error('Logout Error:', error.response ? error.response.data : error.message);
      Alert.alert('Logout Error', error.response?.data?.message || 'Failed to logout. Please try again.');
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
        onChangeText={setPassword}
      />
      <TextInput
        style={styles.input}
        placeholder="Confirmar Senha"
        value={passwordConfirmation}
        secureTextEntry
        onChangeText={setPasswordConfirmation}
      />
      <TouchableOpacity style={styles.button} onPress={handleUpdateProfile}>
        <Text style={styles.buttonText}>Salvar Mudanças</Text>
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
