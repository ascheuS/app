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
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

const LoginScreen: React.FC = () => {
  const { signIn } = useAuth();
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const [rut, setRut] = React.useState<string>('');
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
        const isPrimerInicio = response.access_token === 'primer_inicio' || response.require_password_change === true;
        if (isPrimerInicio) {
          // Validar rutNumber antes de navegar
          if (!Number.isFinite(rutNumber) || Number.isNaN(rutNumber)) {
            setError('RUT inválido para cambio de contraseña');
            Alert.alert('Error', 'RUT inválido para cambio de contraseña');
          } else {
            // Redirigir a la pantalla de cambio de contraseña y pasar el RUT
            navigation.navigate('ChangePassword', { rut: rutNumber });
          }
        } else {
          await signIn(response.access_token);
        }
      } else {
        setError('Respuesta inesperada del servidor.');
        Alert.alert('Error', 'Respuesta inesperada del servidor.');
      }
    } catch (error: any) {
      // Log interno para debugging (no se muestra al usuario)
      console.error('Error en la llamada a la API:', error);

      // Mapear errores del backend a mensajes amigables para el usuario.
      // Evitamos mostrar el `detail` exacto que devuelve el servidor.
      let userMessage = 'No se pudo iniciar sesión. Intenta nuevamente más tarde.';

      if (error.response) {
        const status = error.response.status;
        if (status === 401) {
          userMessage = 'RUT o contraseña incorrectos.';
        } else if (status === 403) {
          userMessage = 'La cuenta está inactiva. Contacta al administrador.';
        } else if (status === 400) {
          userMessage = 'Datos inválidos. Revisa el RUT y la contraseña.';
        } else if (status >= 500) {
          userMessage = 'Error del servidor. Intenta más tarde.';
        }

        setError(userMessage);
        Alert.alert('Error de Inicio de Sesión', userMessage);
      } else if (error.request) {
        userMessage = 'No se pudo conectar al servidor. Verifica tu conexión.';
        setError(userMessage);
        Alert.alert('Error de Red', userMessage);
      } else {
        setError(userMessage);
        Alert.alert('Error', userMessage);
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