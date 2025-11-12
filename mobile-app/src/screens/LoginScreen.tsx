import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
  TouchableOpacity,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

type LoginScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Login'
>;

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
      const msg = 'RUT y contraseña son requeridos';
      setError(msg);
      Alert.alert('Error', msg);
      setIsLoading(false);
      return;
    }

    try {
      const rutNumber = parseInt(rut.replace(/[^0-9kK]/g, ''), 10);
      const response = await authService.login(rutNumber, password);

      if (response && response.access_token) {
        const isPrimerInicio =
          response.access_token === 'primer_inicio' ||
          response.require_password_change === true;

        if (isPrimerInicio) {
          if (!Number.isFinite(rutNumber) || Number.isNaN(rutNumber)) {
            const msg = 'RUT inválido para cambio de contraseña';
            setError(msg);
            Alert.alert('Error', msg);
          } else {
            navigation.navigate('ChangePassword', { rut: rutNumber });
          }
        } else {
          await signIn(response.access_token);
        }
      } else {
        const msg = 'Respuesta inesperada del servidor.';
        setError(msg);
        Alert.alert('Error', msg);
      }
    } catch (error: any) {
      console.error('Error en la llamada a la API:', error);

      let userMessage =
        'No se pudo iniciar sesión. Intenta nuevamente más tarde.';

      if (error.response) {
        const status = error.response.status;
        if (status === 401) userMessage = 'RUT o contraseña incorrectos.';
        else if (status === 403)
          userMessage = 'La cuenta está inactiva. Contacta al administrador.';
        else if (status === 400)
          userMessage = 'Datos inválidos. Revisa el RUT y la contraseña.';
        else if (status >= 500)
          userMessage = 'Error del servidor. Intenta más tarde.';
      } else if (error.request) {
        userMessage = 'No se pudo conectar al servidor. Verifica tu conexión.';
      }

      setError(userMessage);
      Alert.alert('Error de Inicio de Sesión', userMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* LOGO */}
      <View style={styles.logoContainer}>
        <Image
          source={require('../../assets/images/sigraa.jpeg')}
          style={styles.logo}
        />

      </View>

      {/* INPUT RUT */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>RUT</Text>
        <TextInput
          style={styles.inputUnderline}
          placeholder="Ingresa tu RUT (Ej: 12345678)"
          placeholderTextColor="#999"
          keyboardType="numeric"
          value={rut}
          onChangeText={setRut}
          editable={!isLoading}
        />
      </View>

      {/* INPUT CONTRASEÑA */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Contraseña</Text>
        <TextInput
          style={styles.inputUnderline}
          placeholder="********"
          placeholderTextColor="#999"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          editable={!isLoading}
        />
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {/* BOTÓN */}
      {isLoading ? (
        <ActivityIndicator size="large" color="#FFC107" style={styles.loader} />
      ) : (
        <TouchableOpacity style={styles.buttonContainer} onPress={handleLogin}>
          <Text style={styles.buttonText}>Ingresar</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logoContainer: {
    marginBottom: 50,
    alignItems: 'center',
  },
  logo: {
    width: 400,
    height: 200,
    resizeMode: 'contain',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 25,
  },
  label: {
    color: '#FFC107',
    fontWeight: 'bold',
    marginBottom: 5,
    fontSize: 14,
  },
  inputUnderline: {
    height: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#fff',
    color: '#fff',
    fontSize: 16,
    paddingHorizontal: 5,
  },
  buttonContainer: {
    backgroundColor: '#fff',
    width: '60%',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 30,
  },
  buttonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#FF5252',
    marginTop: 10,
    fontSize: 14,
    textAlign: 'center',
  },
  loader: {
    marginTop: 20,
  },
});

export default LoginScreen;
