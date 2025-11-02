// src/screens/HomeScreen.tsx
import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
// Ya no necesitamos SecureStore aquí directamente
// import * as SecureStore from 'expo-secure-store';
// Ya no necesitamos los tipos de navigation si solo usamos signOut
// import { StackNavigationProp } from '@react-navigation/stack';
// import { RootStackParamList } from '../navigation/types';
import { useAuth } from '../context/AuthContext'; // Importa el hook de autenticación
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

// Ya no necesitamos definir tipos para navigation si no se usa
// type HomeScreenNavigationProp = ...
// type Props = { ... };

// El componente ya no necesita recibir 'navigation' como prop
const HomeScreen: React.FC = () => {
  // Obtiene la función signOut del contexto
  const { signOut, userCargo } = useAuth() as any;
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // handleLogout ahora solo necesita llamar a signOut
  const handleLogout = async () => {
    console.log('Cerrando sesión...');
    await signOut();
    // La navegación de vuelta a Login la maneja RootNavigator
    // al detectar el cambio en userToken
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>¡Bienvenido a SIGRA!</Text>
      <Text style={styles.subtitle}>Pantalla principal de la aplicación.</Text>
      {/* --- Aquí puedes empezar a agregar la funcionalidad de reportes --- */}
      <Text style={styles.placeholder}>
        (Próximamente: Lista de reportes)
      </Text>
      {/* Mostrar botón Crear Reporte sólo para trabajadores (no admin) */}
      {userCargo !== 1 && (
        <Button title="Crear Reporte" onPress={() => navigation.navigate('CreateReport')} />
      )}
      {/* Separador visual */}
      <View style={styles.separator} />
      {userCargo === 1 && (
        <Button title="Gestión de usuarios" onPress={() => navigation.navigate('AdminUsers')} />
      )}
      <Button title="Cerrar Sesión" onPress={handleLogout} color="#FF3B30" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center', // Centra el contenido verticalmente
    alignItems: 'center', // Centra el contenido horizontalmente
    padding: 20,
    backgroundColor: '#fff', // Fondo blanco
  },
  title: {
    fontSize: 26, // Ligeramente más grande
    fontWeight: 'bold', // Negrita
    marginBottom: 10, // Menos espacio debajo
    color: '#1C1C1E', // Color oscuro
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93', // Color grisáceo
    marginBottom: 40, // Más espacio debajo
    textAlign: 'center',
  },
  placeholder: {
    fontSize: 14,
    color: '#AEAEB2',
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 40,
  },
  separator: {
    height: 1,
    width: '80%',
    backgroundColor: '#E5E5EA', // Línea separadora gris claro
    marginVertical: 30, // Espacio vertical alrededor
  },
});

export default HomeScreen;