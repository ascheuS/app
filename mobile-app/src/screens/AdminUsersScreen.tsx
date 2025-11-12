import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { authService } from '../services/api';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

type AdminUsersNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'AdminUsers'
>;

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
      Alert.alert(
        'Error',
        err.response?.data?.detail || 'No se pudieron cargar los usuarios'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleEstado = async (rut: number, currentEstado: number) => {
    const newEstado = currentEstado === 1 ? 2 : 1;
    try {
      await authService.updateUserState(rut, newEstado);
      Alert.alert('Éxito', 'Estado actualizado');
      fetchUsers();
    } catch (err: any) {
      console.error('Error updating state', err);
      Alert.alert(
        'Error',
        err.response?.data?.detail || 'No se pudo actualizar estado'
      );
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.userCard}>
      <View style={{ flex: 1 }}>
        <Text style={styles.userName}>
          {item.Nombre} {item.Apellido_1}
        </Text>
        <Text style={styles.userDetails}>
          RUT: {item.RUT} | Cargo: {item.ID_Cargo} | Estado:{' '}
          {item.ID_Estado_trabajador}
        </Text>
      </View>
      <TouchableOpacity
        style={[
          styles.actionButton,
          item.ID_Estado_trabajador === 1
            ? styles.deactivateButton
            : styles.activateButton,
        ]}
        onPress={() => handleToggleEstado(item.RUT, item.ID_Estado_trabajador)}
      >
        <Text style={styles.actionButtonText}>
          {item.ID_Estado_trabajador === 1 ? 'Desactivar' : 'Activar'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gestión de Usuarios</Text>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddUser')}
      >
        <Text style={styles.addButtonText}>Agregar Usuario</Text>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator size="large" color="#FF9500" style={{ marginTop: 30 }} />
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => String(item.RUT)}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000ff',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: '#FF9500',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#FF9500',
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 5,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  listContainer: {
    paddingBottom: 40,
  },
  userCard: {
    flexDirection: 'row',
    backgroundColor: '#1E1E1E',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  userDetails: {
    fontSize: 13,
    color: '#aaa',
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  deactivateButton: {
    backgroundColor: '#18ca00ff', // naranja
  },
  activateButton: {
    backgroundColor: '#f00808ff', // mismo color para consistencia
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
});

export default AdminUsersScreen;
