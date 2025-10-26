import React from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';

const LoginScreen: React.FC = () => {
  const { signIn } = useAuth(); // Obtiene la función signIn del contexto
  const [rut, setRut] = React.useState<string>(''); // Usa React.useState
  const [password, setPassword] = React.useState<string>('');
  const [error, setError] = React.useState<string>('');
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  const handleLogin = async () => {
    setError('');
    setIsLoading(true);

    if (!rut || !password) {
      setError('RUT y contraseña son requeridos');
      Alert.alert('Error', 'RUT y contraseña son requeridos');
      setIsLoading(false);
      return;
    }

    try {
      const rutNumber = parseInt(rut.replace(/[^0-9kK]/g, ''), 10);
      const response = await authService.login(rutNumber, password);

      if (response && response.access_token) {
        await signIn(response.access_token);
      } else {
        setError('Respuesta inesperada del servidor.');
        Alert.alert('Error', 'Respuesta inesperada del servidor.');
      }
    } catch (error: any) {
      console.error('Error en la llamada a la API:', error);
      
      if (error.response) {
        const detail = error.response.data?.detail || 'Error desconocido del servidor';
        setError(detail);
        Alert.alert('Error de Inicio de Sesión', detail);
      } else if (error.request) {
        setError('No se pudo conectar al servidor. Verifica tu conexión.');
        Alert.alert('Error de Red', 'No se pudo conectar al servidor.');
      } else {
        setError('Error al procesar la solicitud.');
        Alert.alert('Error', error.message || 'Error inesperado.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Iniciar Sesión SIGRA</Text>
      <TextInput
        style={styles.input}
        placeholder="RUT (ej: 123456789)"
        keyboardType="numeric"
        value={rut}
        onChangeText={setRut}
        editable={!isLoading}
      />
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        editable={!isLoading}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      {isLoading ? (
        <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
      ) : (
        <Button title="Ingresar" onPress={handleLogin} disabled={isLoading} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#f5f5f5' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 30, textAlign: 'center', color: '#333' },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  errorText: { color: 'red', marginBottom: 15, textAlign: 'center', fontSize: 14 },
  loader: {
    marginTop: 20,
  },
});

export default LoginScreen;