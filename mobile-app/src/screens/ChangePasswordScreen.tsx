// src/screens/ChangePasswordScreen.tsx
import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  rut: number;
  cargo: number;
  exp: number;
}

const ChangePasswordScreen: React.FC = () => {
  const { signIn } = useAuth() as any;
  const route = useRoute<RouteProp<RootStackParamList, 'ChangePassword'>>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const rutParam = route?.params?.rut;
  
  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  const handleChangePassword = async () => {
    setError('');
    setIsLoading(true);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Todos los campos son requeridos');
      setIsLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Las nuevas contraseñas no coinciden');
      setIsLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError('La nueva contraseña debe tener al menos 6 caracteres');
      setIsLoading(false);
      return;
    }

    try {
      const response = await authService.changePassword(currentPassword, newPassword, rutParam);

      if (response && response.access_token) {
        Alert.alert(
          'Éxito',
          'Contraseña cambiada correctamente',
          [
            {
              text: 'OK',
              onPress: async () => {
                await signIn(response.access_token);
                try {
                  const decodedToken = jwtDecode<JwtPayload>(response.access_token);
                  const userCargo = decodedToken.cargo;
                  
                  console.log('👤 Usuario cargo:', userCargo);
                  
                  // Navegar según el cargo del usuario
                  const destino = userCargo === 1 ? 'AdminHome' : 'Home';
                  
                  console.log('🔀 Navegando a:', destino);
                  
                  // Reset navigation stack
                  navigation.reset({
                    index: 0,
                    routes: [{ name: destino as any }],
                  });
                } catch (decodeError) {
                  console.error('Error decodificando token:', decodeError);
                  // Fallback: ir a Home por defecto
                  navigation.reset({
                    index: 0,
                    routes: [{ name: 'Home' as any }],
                  });
                }
              },
            },
          ]
        );
      }
    } catch (error: any) {
      console.error('Error al cambiar la contraseña:', error);
      const message = error.response?.data?.detail || 'Error al cambiar la contraseña';
      setError(message);
      Alert.alert('Error', message);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <View style={styles.container}>
      {/* LOGO */}
      <View style={styles.logoContainer}>
        <Image
          source={require('../../assets/images/sigraaa.jpeg')}
          style={styles.logo}
        />
      </View>

      <Text style={styles.title}>Cambiar Contraseña</Text>
      <Text style={styles.subtitle}>
        Es necesario cambiar tu contraseña en el primer inicio de sesión
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Contraseña actual"
        placeholderTextColor="#aaa"
        secureTextEntry
        value={currentPassword}
        onChangeText={setCurrentPassword}
        editable={!isLoading}
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Nueva contraseña"
        placeholderTextColor="#aaa"
        secureTextEntry
        value={newPassword}
        onChangeText={setNewPassword}
        editable={!isLoading}
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Confirmar nueva contraseña"
        placeholderTextColor="#aaa"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        editable={!isLoading}
        autoCapitalize="none"
      />

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {isLoading ? (
        <ActivityIndicator size="large" color="#FFAA00" style={styles.loader} />
      ) : (
        <TouchableOpacity
          style={styles.button}
          onPress={handleChangePassword}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>Cambiar Contraseña</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#000',
    paddingHorizontal: 25,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 25,
  },
  logo: {
    width: 300,
    height: 100,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    color: '#ccc',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 20,
  },
  input: {
    height: 50,
    borderColor: '#FFAA00',
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 15,
    backgroundColor: '#111',
    color: '#fff',
    fontSize: 16,
  },
  errorText: {
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 15,
    fontSize: 14,
  },
  loader: {
    marginTop: 20,
  },
  button: {
    backgroundColor: '#FFAA00',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#FFAA00',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ChangePasswordScreen;
