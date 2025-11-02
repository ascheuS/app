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
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

const ChangePasswordScreen: React.FC = () => {
  const { signIn, userCargo } = useAuth() as any;
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

    // Validaciones básicas
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
  // Llamar al endpoint de cambio de contraseña
  // Si vinimos desde login en primer inicio, enviamos el RUT como respaldo
  const response = await authService.changePassword(currentPassword, newPassword, rutParam);
      
      if (response && response.access_token) {
        Alert.alert(
          'Éxito',
          'Contraseña cambiada correctamente',
          [
            {
                  text: 'OK',
                  onPress: async () => {
                    // Iniciar sesión con el nuevo token
                    await signIn(response.access_token);
                    // Después de signIn, userCargo debería estar disponible en el contexto.
                    // Navegar condicionalmente según cargo: admin -> AdminUsers, trabajador -> Home
                    const destino = (userCargo === 1) ? 'AdminUsers' : 'Home';
                    navigation.reset({ index: 0, routes: [{ name: destino as any }] });
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
      <Text style={styles.title}>Cambiar Contraseña</Text>
      <Text style={styles.subtitle}>
        Es necesario cambiar tu contraseña en el primer inicio de sesión
      </Text>
      
      <TextInput
        style={styles.input}
        placeholder="Contraseña actual"
        secureTextEntry
        value={currentPassword}
        onChangeText={setCurrentPassword}
        editable={!isLoading}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Nueva contraseña"
        secureTextEntry
        value={newPassword}
        onChangeText={setNewPassword}
        editable={!isLoading}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Confirmar nueva contraseña"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        editable={!isLoading}
      />

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      
      {isLoading ? (
        <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
      ) : (
        <Button 
          title="Cambiar Contraseña" 
          onPress={handleChangePassword} 
          disabled={isLoading}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 30,
    textAlign: 'center',
    color: '#666',
  },
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
  errorText: {
    color: 'red',
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 14,
  },
  loader: {
    marginTop: 20,
  },
});

export default ChangePasswordScreen;