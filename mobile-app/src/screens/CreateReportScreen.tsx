import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, TextInput, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { Area, Severidad } from '../types/reportes';
import {getDB} from '../db/database';
import { useAuth } from '../context/AuthContext';

type CreateReportNavProp = NativeStackNavigationProp<RootStackParamList, 'CreateReport'>;

const CreateReportScreen: React.FC = () => {
  const navigation = useNavigation<CreateReportNavProp>();
  const auth = useAuth();

  // Estados del formulario
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [idArea, setIdArea] = useState<string>();
  const [idSeveridad, setIdSeveridad] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCatalogos, setIsLoadingCatalogos] = useState(true);
  const [areas, setAreas] = useState<Area[]>([]);
  const [severidades, setSeveridades] = useState<Severidad[]>([]);

  // Cargar catálogos al montar el componente
  useEffect(() => {
    const loadCatalogos = async () => {
      setIsLoadingCatalogos(true);
      try {
        const db = getDB();
        const areasRes: Area[] = await db.getAllAsync('SELECT * FROM Areas;');
        const severidadesRes: Severidad[] = await db.getAllAsync('SELECT * FROM Severidad;');
        console.log('Catálogo de áreas cargado:', areasRes);
        console.log('Catálogo de severidades cargado:', severidadesRes);

        setAreas(areasRes);
        setSeveridades(severidadesRes);
        if (areasRes.length > 0) setIdArea(areasRes[0].ID_Area.toString());
        if (severidadesRes.length > 0) setIdSeveridad(severidadesRes[0].ID_Severidad.toString());
      } catch (err) {
        console.error('Error al cargar catálogos:', err);
        Alert.alert('Error', `No se pudieron cargar los catálogos. Intenta más tarde.`);
      } finally {
        setIsLoadingCatalogos(false);
      }
    };
    loadCatalogos();
  }, []);

  const handleCreate = async () => {
    if (!titulo) {
      Alert.alert('Validación', 'El título es requerido');
      return;
    }

    if(!idArea || !idSeveridad) {
      Alert.alert('Validación', 'Debes seleccionar un área y una severidad');
      return;
    }

    const rutUsuario = auth?.userRUT;
    if (!rutUsuario) {
      Alert.alert('Error', 'No se pudo obtener la información del usuario. Por favor, inicia sesión nuevamente.');
      return;
    }

    setIsLoading(true);
    try {
      const db = getDB();

      const uuid = `${Date.now()}-${Math.random().toString(36).substr(2, 8)}`;
      const fecha = new Date().toISOString().split('T')[0]; // Formato YYYY-MM-DD

      const sql= `
        INSERT INTO Reportes 
        (Titulo, Descripcion, Fecha_Reporte, UUID_Cliente, RUT, ID_Area, ID_Severidad, ID_Estado_Actual, sincronizado)
        VALUES
        (?, ?, ?, ?, ?, ?, ?, 1, 0);
      `;
      await db.runAsync(sql,[
        titulo,
        descripcion,
        fecha,
        uuid,
        rutUsuario,
        parseInt(idArea,10),
        parseInt(idSeveridad,10)

      ]);

      Alert.alert('Reporte Guardado', 'El reporte se guardó localmente. Sincroniza cuando tengas conexión.');

      // Limpiar formulario
      setTitulo('');
      setDescripcion('');
      //Resetear pickers a la primera opción
      if (areas.length > 0) setIdArea(areas[0].ID_Area.toString());
      if (severidades.length > 0) setIdSeveridad(severidades[0].ID_Severidad.toString());

    } catch (err: any) {
      console.error(err);
      const mensaje = err.response?.data?.detail || err.message || 'No se pudo crear el reporte en el telefono. Por favor intenta nuevamente.';
      Alert.alert('Error', mensaje);
    } finally {
      setIsLoading(false);
    }
  };



  if (isLoadingCatalogos) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Cargando catálogos...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.container}>
        <Text style={styles.title}>Crear Reporte</Text>
        
        <TextInput 
          style={styles.input} 
          placeholder="Título" 
          value={titulo} 
          onChangeText={setTitulo}
        />
        
        <TextInput 
          style={[styles.input, styles.textArea]} 
          placeholder="Descripción" 
          value={descripcion} 
          onChangeText={setDescripcion} 
          multiline 
          numberOfLines={4}
        />

        <View style={styles.pickerContainer}>
          <Text style={styles.label}>Área afectada:</Text>
          <Picker
            selectedValue={idArea}
            onValueChange={(value) => setIdArea(value.toString())}
            style={styles.picker}
          >
            {areas.map(area => (
              <Picker.Item 
                key={area.ID_Area} 
                label={area.Nombre_Area} 
                value={area.ID_Area.toString()} 
              />
            ))}
          </Picker>
        </View>

        <View style={styles.pickerContainer}>
          <Text style={styles.label}>Severidad:</Text>
          <Picker
            selectedValue={idSeveridad}
            onValueChange={(value) => setIdSeveridad(value.toString())}
            style={styles.picker}
          >
            {severidades.map(sev => (
              <Picker.Item 
                key={sev.ID_Severidad} 
                label={sev.Nombre_Severidad} 
                value={sev.ID_Severidad.toString()} 
              />
            ))}
          </Picker>
        </View>

        <View style={styles.buttonContainer}>
          <Button title="Crear reporte" onPress={handleCreate} disabled={isLoading } />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    padding: 20,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  pickerContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  picker: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  buttonContainer: {
    marginTop: 20,
    marginBottom: 40,
  },
});

export default CreateReportScreen;
