import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useAuth } from '../context/AuthContext';

type AdminHomeNav = NativeStackNavigationProp<RootStackParamList, 'AdminHome'>;

const AdminHome: React.FC = () => {
  const navigation = useNavigation<AdminHomeNav>();
  const { signOut } = useAuth() as any;

  return (
    <View style={styles.container}>
      {/* LOGO */}

      <Image
        source={require('../../assets/images/sigraa.jpeg')}
        style={styles.logo}
        resizeMode="contain"
      />
      {/* TÍTULOS */}
      <Text style={styles.title}>Panel Administrador</Text>
      <Text style={styles.subtitle}>
        Accesos rápidos para tareas de administración
      </Text>

      {/* BOTONES */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('AdminPanel')}
      >
        <Text style={styles.buttonText}>📊 Ver Reportes</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('AdminUsers')}
      >
        <Text style={styles.buttonText}>👥 Gestión de Usuarios</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.logoutButton]}
        onPress={async () => {
          await signOut();
        }}
      >
        <Text style={[styles.buttonText, styles.logoutText]}>🚪 Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000', // fondo oscuro como el login
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  logo: {
    width: 400,
    height: 200,
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#aaa',
    textAlign: 'center',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#FFAA00',
    width: '80%',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 8,
    shadowColor: '#FFAA00',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '700',
  },
  logoutButton: {
    backgroundColor: '#222',
    borderWidth: 1,
    borderColor: '#FF3B30',
    marginTop: 20,
  },
  logoutText: {
    color: '#FF3B30',
  },
});

export default AdminHome;
