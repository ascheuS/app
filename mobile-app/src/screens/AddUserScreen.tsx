import React, { useState } from 'react';
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
import { authService } from '../services/api';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

type AddUserNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'AddUser'
>;

const AddUserScreen: React.FC = () => {
  const navigation = useNavigation<AddUserNavigationProp>();
  const [rut, setRut] = useState('');
  const [nombre, setNombre] = useState('');
  const [apellido1, setApellido1] = useState('');
  const [apellido2, setApellido2] = useState('');
  const [cargo, setCargo] = useState('2');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!rut || !nombre || !apellido1) {
      Alert.alert('Error', 'RUT, Nombre y Apellido 1 son requeridos');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        RUT: parseInt(rut.replace(/[^0-9]/g, ''), 10),
        Nombre: nombre,
        Apellido_1: apellido1,
        Apellido_2: apellido2 || null,
        ID_Cargo: parseInt(cargo, 10),
        ID_Estado_trabajador: 1,
      };
      await authService.createUser(payload);
      Alert.alert('Éxito', 'Usuario creado');
      navigation.goBack();
    } catch (err: any) {
      console.error('Error creating user', err);
      Alert.alert(
        'Error',
        err.response?.data?.detail || 'No se pudo crear usuario'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* 🔶 Logo SIGRA arriba del título */}
      <View style={styles.logoContainer}>
        <Image
          source={require('../../assets/images/sigraaa.jpeg')}
          style={styles.logo}
        />
      </View>

      <Text style={styles.title}>Agregar Usuario</Text>

      <TextInput
        style={styles.input}
        placeholder="RUT"
        placeholderTextColor="#AFAFAF"
        keyboardType="numeric"
        value={rut}
        onChangeText={setRut}
      />
      <TextInput
        style={styles.input}
        placeholder="Nombre"
        placeholderTextColor="#AFAFAF"
        value={nombre}
        onChangeText={setNombre}
      />
      <TextInput
        style={styles.input}
        placeholder="Apellido 1"
        placeholderTextColor="#AFAFAF"
        value={apellido1}
        onChangeText={setApellido1}
      />
      <TextInput
        style={styles.input}
        placeholder="Apellido 2"
        placeholderTextColor="#AFAFAF"
        value={apellido2}
        onChangeText={setApellido2}
      />
      <TextInput
        style={styles.input}
        placeholder="ID Cargo (1=Admin, 2=Trabajador)"
        placeholderTextColor="#AFAFAF"
        keyboardType="numeric"
        value={cargo}
        onChangeText={setCargo}
      />

      {loading ? (
        <ActivityIndicator size="large" color="#FF9900" />
      ) : (
        <TouchableOpacity style={styles.button} onPress={handleCreate}>
          <Text style={styles.buttonText}>Crear</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000', // Fondo negro
    paddingHorizontal: 20,
    paddingTop: 80, // 🔼 Subimos todo el contenido
    justifyContent: 'flex-start', // 🔼 Alinea el contenido hacia arriba
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 25,
  },
  logo: {
    width: 140,
    height: 100,
  },
  title: {
    fontSize: 24,
    color: '#FF9900',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    height: 50,
    borderWidth: 1.5,
    borderColor: '#FFAA00',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 15,
    color: '#fff',
    backgroundColor: '#1C1C1E',
  },
  button: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#FFAA00',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#FFAA00',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: '#FF9900',
    fontWeight: 'bold',
    fontSize: 16,
  },
});


export default AddUserScreen;
