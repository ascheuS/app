# 🔍 Guía: Implementación del Módulo de Inspecciones

## 📚 1. Definición del Módulo

Una inspección de seguridad es una revisión programada de un área específica, con una lista de verificación de puntos a revisar.

### Características principales:
- Crear inspecciones programadas
- Lista de verificación personalizable
- Fotos de evidencia
- Funcionamiento offline
- Aprobación por supervisores

## 🖥️ 2. Backend (FastAPI)

### 2.1 Modelos ORM (`modulos/modelosORM.py`)
```python
from sqlalchemy import Column, Integer, String, BIGINT, ForeignKey, Date, DateTime, Boolean
from sqlalchemy.orm import relationship
from database import Base

class Inspecciones(Base):
    __tablename__ = "Inspecciones"
    ID_Inspeccion = Column(Integer, primary_key=True, autoincrement=True)
    Titulo = Column(String(200), nullable=False)
    Fecha_Programada = Column(Date, nullable=False)
    Area_ID = Column(Integer, ForeignKey("Areas.ID_Area"))
    Estado = Column(String(50), nullable=False)  # programada, en_proceso, completada
    RUT_Responsable = Column(BIGINT, ForeignKey("Usuarios.RUT"))
    UUID_Cliente = Column(String(100), nullable=False, unique=True)
    Sincronizado = Column(Boolean, default=False)
    
    # Relaciones
    area_rel = relationship("Areas", back_populates="inspecciones")
    responsable_rel = relationship("Usuarios", back_populates="inspecciones")
    items = relationship("ItemsInspeccion", back_populates="inspeccion_rel")

class ItemsInspeccion(Base):
    __tablename__ = "ItemsInspeccion"
    ID_Item = Column(Integer, primary_key=True, autoincrement=True)
    ID_Inspeccion = Column(Integer, ForeignKey("Inspecciones.ID_Inspeccion"))
    Descripcion = Column(String(500), nullable=False)
    Cumple = Column(Boolean, nullable=True)
    Observacion = Column(String(1000))
    
    inspeccion_rel = relationship("Inspecciones", back_populates="items")
    fotos = relationship("FotosInspeccion", back_populates="item_rel")

class FotosInspeccion(Base):
    __tablename__ = "FotosInspeccion"
    ID_Foto = Column(Integer, primary_key=True, autoincrement=True)
    ID_Item = Column(Integer, ForeignKey("ItemsInspeccion.ID_Item"))
    Ruta = Column(String(1024), nullable=False)
    
    item_rel = relationship("ItemsInspeccion", back_populates="fotos")
```

### 2.2 Esquemas Pydantic (`esquemas/inspecciones.py`)
```python
from pydantic import BaseModel
from datetime import date
from typing import List, Optional

class ItemInspeccionBase(BaseModel):
    descripcion: str
    cumple: Optional[bool] = None
    observacion: Optional[str] = None

class FotoInspeccion(BaseModel):
    ruta: str

class ItemInspeccionCreate(ItemInspeccionBase):
    fotos: List[str] = []

class ItemInspeccionResponse(ItemInspeccionBase):
    id: int
    fotos: List[FotoInspeccion]

    class Config:
        orm_mode = True

class InspeccionCreate(BaseModel):
    titulo: str
    fecha_programada: date
    area_id: int
    items: List[ItemInspeccionCreate]
    uuid_cliente: str

class InspeccionResponse(BaseModel):
    id: int
    titulo: str
    fecha_programada: date
    estado: str
    area: str
    responsable: str
    items: List[ItemInspeccionResponse]
    sincronizado: bool

    class Config:
        orm_mode = True
```

### 2.3 Rutas API (`routes/inspecciones.py`)
```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from modulos.modelosORM import Inspecciones, ItemsInspeccion
from esquemas.inspecciones import InspeccionCreate, InspeccionResponse

router = APIRouter(prefix="/inspecciones", tags=["Inspecciones"])

@router.post("/", response_model=InspeccionResponse)
async def crear_inspeccion(inspeccion: InspeccionCreate, db: Session = Depends(get_db)):
    db_inspeccion = Inspecciones(
        Titulo=inspeccion.titulo,
        Fecha_Programada=inspeccion.fecha_programada,
        Area_ID=inspeccion.area_id,
        Estado="programada",
        UUID_Cliente=inspeccion.uuid_cliente,
        Sincronizado=False
    )
    
    db.add(db_inspeccion)
    db.flush()  # Para obtener el ID
    
    # Crear items
    for item in inspeccion.items:
        db_item = ItemsInspeccion(
            ID_Inspeccion=db_inspeccion.ID_Inspeccion,
            Descripcion=item.descripcion
        )
        db.add(db_item)
    
    db.commit()
    return db_inspeccion

@router.get("/", response_model=List[InspeccionResponse])
async def listar_inspecciones(db: Session = Depends(get_db)):
    return db.query(Inspecciones).all()
```

## 📱 3. Frontend (React Native)

### 3.1 Tipos (`src/types/inspections.ts`)
```typescript
export interface InspectionItem {
  id?: string;
  description: string;
  compliant?: boolean;
  observation?: string;
  photos: string[];
}

export interface Inspection {
  id: string;
  title: string;
  scheduledDate: string;
  area: string;
  status: 'scheduled' | 'in_progress' | 'completed';
  items: InspectionItem[];
  isSync: boolean;
}

export interface CreateInspectionDTO {
  title: string;
  scheduledDate: string;
  areaId: number;
  items: Omit<InspectionItem, 'id'>[];
}
```

### 3.2 Datos Mock (`src/mocks/inspections.ts`)
```typescript
import { Inspection } from '../types/inspections';

export const mockInspections: Inspection[] = [
  {
    id: '1',
    title: 'Inspección Área de Soldadura',
    scheduledDate: '2025-10-27',
    area: 'Taller',
    status: 'scheduled',
    isSync: true,
    items: [
      {
        id: '1-1',
        description: 'Equipo de protección personal disponible',
        compliant: true,
        photos: ['mock_ppe_1.jpg']
      },
      {
        id: '1-2',
        description: 'Extintores en su lugar',
        compliant: false,
        observation: 'Falta extintor en zona norte',
        photos: ['mock_fire_1.jpg']
      }
    ]
  }
];

export const mockInspectionService = {
  getInspections: async () => {
    return mockInspections;
  },

  createInspection: async (data: CreateInspectionDTO) => {
    return {
      id: Date.now().toString(),
      ...data,
      status: 'scheduled' as const,
      isSync: false
    };
  },

  updateInspectionItem: async (id: string, itemId: string, update: Partial<InspectionItem>) => {
    console.log('Mock: Actualizando item', { id, itemId, update });
  }
};
```

### 3.3 Pantallas

#### Lista de Inspecciones (`src/modules/inspections/screens/InspectionListScreen.tsx`)
```typescript
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Inspection } from '../../../types/inspections';
import { mockInspectionService } from '../../../mocks/inspections';

export const InspectionListScreen = ({ navigation }: any) => {
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInspections();
  }, []);

  const loadInspections = async () => {
    try {
      setLoading(true);
      const data = await mockInspectionService.getInspections();
      setInspections(data);
    } catch (error) {
      console.error('Error loading inspections:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: Inspection }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('InspectionDetail', { id: item.id })}
    >
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.area}>Área: {item.area}</Text>
      <View style={styles.meta}>
        <Text style={styles.date}>
          {new Date(item.scheduledDate).toLocaleDateString()}
        </Text>
        <Text style={getStatusStyle(item.status)}>
          {item.status.toUpperCase()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Inspecciones</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('CreateInspection')}
        >
          <Text style={styles.addButtonText}>+ Nueva</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <Text style={styles.loading}>Cargando...</Text>
      ) : (
        <FlatList
          data={inspections}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    elevation: 2,
  },
  // ... más estilos
});
```

### 3.4 Servicios (`src/services/inspectionService.ts`)
```typescript
import axios from 'axios';
import { API_URL } from '../config';
import { CreateInspectionDTO, Inspection } from '../types/inspections';

export const inspectionService = {
  async getInspections(): Promise<Inspection[]> {
    const response = await axios.get(`${API_URL}/inspecciones`);
    return response.data;
  },

  async createInspection(data: CreateInspectionDTO): Promise<Inspection> {
    const response = await axios.post(`${API_URL}/inspecciones`, data);
    return response.data;
  },

  async updateInspection(id: string, data: Partial<Inspection>): Promise<Inspection> {
    const response = await axios.put(`${API_URL}/inspecciones/${id}`, data);
    return response.data;
  }
};
```

## 🔄 4. Implementación de Sincronización

### 4.1 Servicio SQLite (`src/services/sqliteService.ts`)
```typescript
import * as SQLite from 'expo-sqlite';
import { Inspection } from '../types/inspections';

const db = SQLite.openDatabase('inspections.db');

export const sqliteService = {
  async initDatabase() {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS inspections (
            id TEXT PRIMARY KEY,
            data TEXT,
            isSync INTEGER,
            lastModified INTEGER
          )`,
          [],
          () => resolve(true),
          (_, error) => reject(error)
        );
      });
    });
  },

  async saveInspection(inspection: Inspection) {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'INSERT OR REPLACE INTO inspections (id, data, isSync, lastModified) VALUES (?, ?, ?, ?)',
          [
            inspection.id,
            JSON.stringify(inspection),
            inspection.isSync ? 1 : 0,
            Date.now()
          ],
          (_, result) => resolve(result),
          (_, error) => reject(error)
        );
      });
    });
  }
};
```

## 📝 5. Pruebas

### 5.1 Backend (`tests/test_inspecciones.py`)
```python
from fastapi.testclient import TestClient
from main import app
import pytest

client = TestClient(app)

def test_crear_inspeccion():
    inspeccion = {
        "titulo": "Test Inspección",
        "fecha_programada": "2025-10-27",
        "area_id": 1,
        "items": [
            {
                "descripcion": "Item de prueba",
                "fotos": []
            }
        ],
        "uuid_cliente": "test-123"
    }
    
    response = client.post("/inspecciones/", json=inspeccion)
    assert response.status_code == 200
    data = response.json()
    assert data["titulo"] == inspeccion["titulo"]
```

### 5.2 Frontend (`src/__tests__/InspectionList.test.tsx`)
```typescript
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { InspectionListScreen } from '../modules/inspections/screens/InspectionListScreen';
import { mockInspectionService } from '../mocks/inspections';

jest.mock('../mocks/inspections');

describe('InspectionListScreen', () => {
  it('renders loading state initially', () => {
    const { getByText } = render(<InspectionListScreen navigation={{}} />);
    expect(getByText('Cargando...')).toBeTruthy();
  });

  it('renders inspections after loading', async () => {
    const { getByText } = render(<InspectionListScreen navigation={{}} />);
    await waitFor(() => {
      expect(getByText('Inspección Área de Soldadura')).toBeTruthy();
    });
  });
});
```

## 📚 6. Documentación

### 6.1 Swagger/OpenAPI (backend)
```yaml
/inspecciones:
  post:
    summary: Crear nueva inspección
    tags:
      - Inspecciones
    requestBody:
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/InspeccionCreate'
    responses:
      200:
        description: Inspección creada exitosamente
```

### 6.2 Comentarios en Código
```typescript
/**
 * InspectionListScreen - Pantalla principal de inspecciones
 * 
 * Esta pantalla muestra todas las inspecciones programadas y permite:
 * 1. Ver el listado de inspecciones
 * 2. Crear nuevas inspecciones
 * 3. Acceder a los detalles de cada inspección
 * 
 * El componente maneja:
 * - Estados de carga
 * - Sincronización con backend
 * - Navegación a otras pantallas
 */
```

## 🚀 7. Siguiente Paso

Para implementar este módulo:

1. Copiar y pegar los modelos en el backend
2. Ejecutar las migraciones de la base de datos
3. Implementar las rutas API
4. Crear los tipos y mocks en el frontend
5. Implementar las pantallas
6. Configurar la navegación
7. Probar la sincronización