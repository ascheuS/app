import React, {useState} from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { authService } from '../services/api';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

type AddUserNavigationProp = NativeStackNavigationProp<RootStackParamList, 'AddUser'>;

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
        RUT: parseInt(rut.replace(/[^0-9]/g,''),10),
        Nombre: nombre,
        Apellido_1: apellido1,
        Apellido_2: apellido2 || null,
        ID_Cargo: parseInt(cargo,10),
        ID_Estado_trabajador: 1
      };
      await authService.createUser(payload);
      Alert.alert('Éxito','Usuario creado');
      navigation.goBack();
    } catch (err:any) {
      console.error('Error creating user', err);
      Alert.alert('Error', err.response?.data?.detail || 'No se pudo crear usuario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Agregar Usuario</Text>
      <TextInput style={styles.input} placeholder="RUT" keyboardType="numeric" value={rut} onChangeText={setRut} />
      <TextInput style={styles.input} placeholder="Nombre" value={nombre} onChangeText={setNombre} />
      <TextInput style={styles.input} placeholder="Apellido 1" value={apellido1} onChangeText={setApellido1} />
      <TextInput style={styles.input} placeholder="Apellido 2" value={apellido2} onChangeText={setApellido2} />
      <TextInput style={styles.input} placeholder="ID Cargo (1=Admin,2=Trabajador)" keyboardType='numeric' value={cargo} onChangeText={setCargo} />
      {loading ? <ActivityIndicator /> : <Button title="Crear" onPress={handleCreate} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex:1, padding:20, backgroundColor:'#fff' },
  title: { fontSize:20, fontWeight:'bold', marginBottom:10 },
  input: { height:50, borderWidth:1, borderColor:'#ccc', borderRadius:8, paddingHorizontal:12, marginBottom:12 }
});

export default AddUserScreen;
