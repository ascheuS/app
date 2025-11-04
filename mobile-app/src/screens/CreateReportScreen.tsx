import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, TextInput, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { reportService } from '../services/api';
import { Area, Severidad } from '../types/reportes';

type CreateReportNavProp = NativeStackNavigationProp<RootStackParamList, 'CreateReport'>;

const CreateReportScreen: React.FC = () => {
  const navigation = useNavigation<CreateReportNavProp>();

  // Estados del formulario
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [idArea, setIdArea] = useState<string>('1');
  const [idSeveridad, setIdSeveridad] = useState<string>('1');
  const [isLoading, setIsLoading] = useState(false);
  const [areas, setAreas] = useState<Area[]>([]);
  const [severidades, setSeveridades] = useState<Severidad[]>([]);

  // Cargar catálogos al montar el componente
  useEffect(() => {
    const loadCatalogos = async () => {
      try {
        const [areasData, severidadesData] = await Promise.all([
          reportService.getAreas(),
          reportService.getSeveridades()
        ]);
        setAreas(areasData);
        setSeveridades(severidadesData);
      } catch (err) {
        console.error('Error al cargar catálogos:', err);
        Alert.alert('Error', 'No se pudieron cargar los catálogos. Intenta más tarde.');
      }
    };
    loadCatalogos();
  }, []);

  const handleCreate = async () => {
    if (!titulo) {
      Alert.alert('Validación', 'El título es requerido');
      return;
    }

    setIsLoading(true);
    try {
      const reportData = {
        titulo,
        descripcion,
        fecha_reporte: new Date().toISOString().split('T')[0],
        uuid_cliente: `${Date.now()}-${Math.random().toString(36).slice(2,8)}`,
        peticion_idempotencia: `${Date.now()}-${Math.random().toString(36).slice(2,8)}`,
        id_severidad: parseInt(idSeveridad, 10),
        id_area: parseInt(idArea, 10),
      };
      const res = await reportService.createReport(reportData);
      Alert.alert('Reporte enviado', `ID: ${res.id_reporte}`);
      // Limpiar formulario
      setTitulo('');
      setDescripcion('');
      setIdArea(areas[0]?.ID_Area.toString() || '1');
      setIdSeveridad(severidades[0]?.ID_Severidad.toString() || '1');
    } catch (err: any) {
      console.error(err);
      const mensaje = err.response?.data?.detail || err.message || 'No se pudo crear el reporte. Por favor intenta nuevamente.';
      Alert.alert('Error', mensaje);
    } finally {
      setIsLoading(false);
    }
  };



  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Creando reporte...</Text>
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
                label={area.Nombre_area} 
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
                label={sev.Nombre_severidad} 
                value={sev.ID_Severidad.toString()} 
              />
            ))}
          </Picker>
        </View>

        <View style={styles.buttonContainer}>
          <Button title="Crear reporte" onPress={handleCreate} />
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
