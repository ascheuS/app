import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, Alert, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { reportService } from '../services/api';

type CreateReportNavProp = NativeStackNavigationProp<RootStackParamList, 'CreateReport'>;

const CreateReportScreen: React.FC = () => {
  const navigation = useNavigation<CreateReportNavProp>();

  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [idArea, setIdArea] = useState<string>('1');
  const [idSeveridad, setIdSeveridad] = useState<string>('1');

  useEffect(() => {
    // Podríamos obtener catálogos aquí en el futuro
  }, []);

  const handleCreate = async () => {
    if (!titulo) {
      Alert.alert('Validación', 'El título es requerido');
      return;
    }
    try {
      const reportData = {
        titulo,
        descripcion,
        fecha_reporte: new Date().toISOString().split('T')[0],
        uuid_cliente: `${Date.now()}-${Math.random().toString(36).slice(2,8)}`,
        peticion_idempotencia: null,
        id_severidad: parseInt(idSeveridad, 10),
        id_area: parseInt(idArea, 10),
      };
      const res = await reportService.createReport(reportData);
      Alert.alert('Reporte enviado', `ID: ${res.id_reporte}`);
      setTitulo(''); setDescripcion('');
    } catch (err: any) {
      console.error(err);
      const detail = err.response?.data?.detail || err.message || 'Error al crear reporte';
      Alert.alert('Error', detail);
    }
  };

  return (
    <View style={styles.container}>
  <Text style={styles.title}>Crear Reporte</Text>
  <Text style={styles.subtitle}>Formulario temporal para crear reportes.</Text>
  <TextInput style={styles.input} placeholder="Título" value={titulo} onChangeText={setTitulo} />
  <TextInput style={[styles.input, {height:100}]} placeholder="Descripción" value={descripcion} onChangeText={setDescripcion} multiline />
  <TextInput style={styles.input} placeholder="ID Área (num)" value={idArea} onChangeText={setIdArea} keyboardType="numeric" />
  <TextInput style={styles.input} placeholder="ID Severidad (num)" value={idSeveridad} onChangeText={setIdSeveridad} keyboardType="numeric" />
  <Button title="Crear reporte" onPress={handleCreate} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex:1, justifyContent:'center', alignItems:'center', padding:20, backgroundColor:'#fff' },
  title: { fontSize:24, fontWeight:'700', marginBottom:8 },
  subtitle: { fontSize:14, color:'#666', marginBottom:20, textAlign:'center' },
});

export default CreateReportScreen;
