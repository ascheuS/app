import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
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
      <Text style={styles.title}>Panel Administrador</Text>
      <Text style={styles.subtitle}>Accesos rápidos para tareas de administración</Text>
      <Button title="Gestión de Usuarios" onPress={() => navigation.navigate('AdminUsers')} />
      <View style={{height:12}} />
      <Button title="Cerrar sesión" color="#FF3B30" onPress={async () => { await signOut(); }} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex:1, justifyContent:'center', alignItems:'center', padding:20, backgroundColor:'#fff' },
  title: { fontSize:24, fontWeight:'700', marginBottom:8 },
  subtitle: { fontSize:14, color:'#666', marginBottom:20, textAlign:'center' },
});

export default AdminHome;
