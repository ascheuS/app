import React, {useEffect, useState} from 'react';
import { View, Text, FlatList, Button, StyleSheet, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import { authService } from '../services/api';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

type AdminUsersNavigationProp = NativeStackNavigationProp<RootStackParamList, 'AdminUsers'>;

const AdminUsersScreen: React.FC = () => {
  const navigation = useNavigation<AdminUsersNavigationProp>();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await authService.getUsers();
      setUsers(data);
    } catch (err: any) {
      console.error('Error fetching users', err);
      Alert.alert('Error', err.response?.data?.detail || 'No se pudieron cargar los usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleEstado = async (rut: number, currentEstado: number) => {
    const newEstado = currentEstado === 1 ? 2 : 1; // ejemplo: 1=Activo,2=Inactivo
    try {
      await authService.updateUserState(rut, newEstado);
      Alert.alert('Éxito', 'Estado actualizado');
      fetchUsers();
    } catch (err:any) {
      console.error('Error updating state', err);
      Alert.alert('Error', err.response?.data?.detail || 'No se pudo actualizar estado');
    }
  };

  const renderItem = ({item}: {item:any}) => (
    <View style={styles.item}>
      <View style={{flex:1}}>
        <Text style={styles.name}>{item.Nombre} {item.Apellido_1}</Text>
        <Text style={styles.sub}>{`RUT: ${item.RUT} | Cargo: ${item.ID_Cargo} | Estado: ${item.ID_Estado_trabajador}`}</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.editBtn} onPress={() => handleToggleEstado(item.RUT, item.ID_Estado_trabajador)}>
          <Text style={styles.editText}>{item.ID_Estado_trabajador === 1 ? 'Desactivar' : 'Activar'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gestión de Usuarios</Text>
      <Button title="Agregar Usuario" onPress={() => navigation.navigate('AddUser')} />

      {loading ? (
        <ActivityIndicator size="large" style={{marginTop:20}} />
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => String(item.RUT)}
          renderItem={renderItem}
          contentContainerStyle={{paddingTop:20}}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex:1, padding:20, backgroundColor:'#fff' },
  title: { fontSize:22, fontWeight:'bold', marginBottom:10 },
  item: { flexDirection:'row', padding:12, borderBottomWidth:1, borderBottomColor:'#eee' },
  name: { fontSize:16, fontWeight:'600' },
  sub: { fontSize:12, color:'#666' },
  actions: { justifyContent:'center' },
  editBtn: { backgroundColor:'#007AFF', paddingVertical:6, paddingHorizontal:10, borderRadius:6 },
  editText: { color:'#fff' }
});

export default AdminUsersScreen;
