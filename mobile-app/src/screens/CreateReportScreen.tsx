import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { Area, Severidad } from '../types/reportes';
import { generateUUIDv4 } from '../utils/uuidGenerator';
import { getDB } from '../db/database';
import { useAuth } from '../context/AuthContext';

type CreateReportNavProp = NativeStackNavigationProp<RootStackParamList, 'CreateReport'>;

const CreateReportScreen: React.FC = () => {
  const navigation = useNavigation<CreateReportNavProp>();
  const auth = useAuth();

  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [idArea, setIdArea] = useState<string>();
  const [idSeveridad, setIdSeveridad] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCatalogos, setIsLoadingCatalogos] = useState(true);
  const [areas, setAreas] = useState<Area[]>([]);
  const [severidades, setSeveridades] = useState<Severidad[]>([]);

  useEffect(() => {
    const loadCatalogos = async () => {
      setIsLoadingCatalogos(true);
      try {
        const db = getDB();
        const areasRes: Area[] = await db.getAllAsync('SELECT * FROM Areas;');
        const severidadesRes: Severidad[] = await db.getAllAsync('SELECT * FROM Severidad;');
        setAreas(areasRes);
        setSeveridades(severidadesRes);
        if (areasRes.length > 0) setIdArea(areasRes[0].ID_Area.toString());
        if (severidadesRes.length > 0) setIdSeveridad(severidadesRes[0].ID_Severidad.toString());
      } catch (err) {
        console.error('Error al cargar catálogos:', err);
        Alert.alert('Error', 'No se pudieron cargar los catálogos. Intenta más tarde.');
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

    if (!idArea || !idSeveridad) {
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
      const uuid = generateUUIDv4();
      const fecha = new Date().toISOString().split('T')[0];

      const sql = `
        INSERT INTO Reportes 
        (Titulo, Descripcion, Fecha_Reporte, UUID_Cliente, RUT, ID_Area, ID_Severidad, ID_Estado_Actual, sincronizado)
        VALUES (?, ?, ?, ?, ?, ?, ?, 1, 0);
      `;
      await db.runAsync(sql, [
        titulo,
        descripcion,
        fecha,
        uuid,
        rutUsuario,
        parseInt(idArea, 10),
        parseInt(idSeveridad, 10),
      ]);

      Alert.alert('✅ Reporte Guardado', 'El reporte se guardó localmente. Sincroniza cuando tengas conexión.');

      setTitulo('');
      setDescripcion('');
      if (areas.length > 0) setIdArea(areas[0].ID_Area.toString());
      if (severidades.length > 0) setIdSeveridad(severidades[0].ID_Severidad.toString());
    } catch (err: any) {
      console.error(err);
      const mensaje =
        err.response?.data?.detail ||
        err.message ||
        'No se pudo crear el reporte en el teléfono. Intenta nuevamente.';
      Alert.alert('Error', mensaje);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingCatalogos) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF9800" />
        <Text style={styles.loadingText}>Cargando catálogos...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.container}>
        <Text style={styles.title}>📝 Crear Reporte</Text>

        <TextInput
          style={styles.input}
          placeholder="Título"
          placeholderTextColor="#aaa"
          value={titulo}
          onChangeText={setTitulo}
        />

        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Descripción"
          placeholderTextColor="#aaa"
          value={descripcion}
          onChangeText={setDescripcion}
          multiline
          numberOfLines={4}
        />

        <View style={styles.pickerContainer}>
          <Text style={styles.label}>Área afectada:</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={idArea}
              onValueChange={(value) => setIdArea(value.toString())}
              dropdownIconColor="#FF9800"
              style={styles.picker}
            >
              {areas.map((area) => (
                <Picker.Item
                  key={area.ID_Area}
                  label={area.Nombre_Area}
                  value={area.ID_Area.toString()}
                  color="#fff"
                />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.pickerContainer}>
          <Text style={styles.label}>Severidad:</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={idSeveridad}
              onValueChange={(value) => setIdSeveridad(value.toString())}
              dropdownIconColor="#FF9800"
              style={styles.picker}
            >
              {severidades.map((sev) => (
                <Picker.Item
                  key={sev.ID_Severidad}
                  label={sev.Nombre_Severidad}
                  value={sev.ID_Severidad.toString()}
                  color="#fff"
                />
              ))}
            </Picker>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.orangeButton, isLoading && { opacity: 0.5 }]}
          onPress={handleCreate}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? '⏳ Creando...' : '🟠 Crear Reporte'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#000000ff',
  },
  container: {
    padding: 20,
    backgroundColor: '#000000ff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  loadingText: {
    color: '#ccc',
    marginTop: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 45,
    borderColor: '#333',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    backgroundColor: '#1E1E1E',
    color: '#fff',
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
    color: '#ccc',
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    backgroundColor: '#1E1E1E',
  },
  picker: {
    color: '#fff',
  },
  orangeButton: {
    backgroundColor: '#FF9800',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default CreateReportScreen;
