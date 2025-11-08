// mobile-app/src/db/database.ts
import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';

let db: SQLiteDatabase;

/**
 * Inicializa la base de datos SQLite local.
 * Solo crea las tablas si no existen (no borra datos existentes).
 */
export const initDatabase = async () => {
  db = await openDatabaseAsync('sigra_offline.db');

  // 1. Habilitar llaves foráneas (¡OBLIGATORIO!)
  await db.execAsync('PRAGMA foreign_keys = ON;');

  console.log('🔄 Verificando estructura de la base de datos...');

  // --- CREACIÓN DE TABLAS (solo si NO EXISTEN) ---
  
  // Tabla de Áreas
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS Areas (
      ID_Area INTEGER PRIMARY KEY NOT NULL,
      Nombre_Area TEXT NOT NULL
    );
  `);

  // Tabla de Severidades
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS Severidad (
      ID_Severidad INTEGER PRIMARY KEY NOT NULL,
      Nombre_Severidad TEXT NOT NULL
    );
  `);

  // Tabla de Estados
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS Estado_reportes (
      ID_Estado_Actual INTEGER PRIMARY KEY NOT NULL,
      Nombre_Estado TEXT NOT NULL
    );
  `);
  
  // Tabla de Reportes
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS Reportes (
      id_local INTEGER PRIMARY KEY AUTOINCREMENT,
      id_servidor INTEGER DEFAULT NULL,
      sincronizado INTEGER NOT NULL DEFAULT 0,
      
      Titulo VARCHAR(255) NOT NULL,
      Descripcion TEXT,
      Fecha_Reporte DATE,
      UUID_Cliente CHAR(36) NOT NULL UNIQUE,
      
      Hora_Creado DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      Hora_Actualizado DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      
      RUT BIGINT,
      ID_Severidad INT,
      ID_Area INT,
      ID_Estado_Actual INT,

      FOREIGN KEY (ID_Area) REFERENCES Areas(ID_Area) ON DELETE SET NULL,
      FOREIGN KEY (ID_Severidad) REFERENCES Severidad(ID_Severidad) ON DELETE SET NULL,
      FOREIGN KEY (ID_Estado_Actual) REFERENCES Estado_reportes(ID_Estado_Actual) ON DELETE SET NULL
    );
  `);

  // Tabla de Multimedia
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS Multimedia_reportes (
      id_local_multimedia INTEGER PRIMARY KEY AUTOINCREMENT,
      id_servidor_multimedia INTEGER DEFAULT NULL,
      sincronizado INTEGER NOT NULL DEFAULT 0,

      id_reporte_local INTEGER NOT NULL,
      
      Tipo_Multimedia VARCHAR(100),
      ruta TEXT NOT NULL,

      FOREIGN KEY (id_reporte_local) REFERENCES Reportes(id_local) ON DELETE CASCADE
    );
  `);

  console.log('✅ Tablas verificadas/creadas');

  // Insertar catálogos solo si no existen
  await insertarCatalogosIniciales();

  console.log('✅ Base de datos SQLite lista');

  return db;
};

/**
 * Inserta los catálogos predefinidos SOLO si no existen.
 * Usa INSERT OR IGNORE para evitar duplicados.
 */
const insertarCatalogosIniciales = async () => {
  // IMPORTANTE: Los IDs deben coincidir EXACTAMENTE con los del backend

  // 1. ÁREAS
  const areas = [
    { id: 1, nombre: 'Perforación y Tronadura' },
    { id: 2, nombre: 'Carga y Transporte' },
    { id: 3, nombre: 'Chancado y Molienda' },
    { id: 4, nombre: 'Mantenimiento Mecánico' },
    { id: 5, nombre: 'Mantenimiento Eléctrico' },
    { id: 6, nombre: 'Seguridad Industrial' },
    { id: 7, nombre: 'Control de Producción' },
    { id: 8, nombre: 'Planta Concentradora' },
    { id: 9, nombre: 'Salud y Medio Ambiente' },
    { id: 10, nombre: 'Administración General' },
  ];

  // 2. SEVERIDADES
  const severidades = [
    { id: 1, nombre: 'Baja' },
    { id: 2, nombre: 'Media' },
    { id: 3, nombre: 'Alta' },
  ];

  // 3. ESTADOS
  const estados = [
    { id: 1, nombre: 'Pendiente' },
    { id: 2, nombre: 'Aprobado' },
    { id: 3, nombre: 'Rechazado' },
  ];

  try {
    // Verificar si ya existen catálogos
    const areasCount = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM Areas'
    );
    
    const severidadesCount = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM Severidad'
    );
    
    const estadosCount = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM Estado_reportes'
    );

    // Solo insertar si las tablas están vacías
    const needsAreas = (areasCount?.count || 0) === 0;
    const needsSeveridades = (severidadesCount?.count || 0) === 0;
    const needsEstados = (estadosCount?.count || 0) === 0;

    if (!needsAreas && !needsSeveridades && !needsEstados) {
      console.log('ℹ️ Catálogos ya existen, omitiendo inserción');
      return;
    }

    console.log('📝 Insertando catálogos iniciales...');

    await db.withTransactionAsync(async () => {
      // Insertar Áreas (si es necesario)
      if (needsAreas) {
        for (const area of areas) {
          await db.runAsync(
            'INSERT OR IGNORE INTO Areas (ID_Area, Nombre_Area) VALUES (?, ?)',
            [area.id, area.nombre]
          );
        }
        console.log(`   ✅ ${areas.length} áreas insertadas`);
      }

      // Insertar Severidades (si es necesario)
      if (needsSeveridades) {
        for (const sev of severidades) {
          await db.runAsync(
            'INSERT OR IGNORE INTO Severidad (ID_Severidad, Nombre_Severidad) VALUES (?, ?)',
            [sev.id, sev.nombre]
          );
        }
        console.log(`   ✅ ${severidades.length} severidades insertadas`);
      }

      // Insertar Estados (si es necesario)
      if (needsEstados) {
        for (const estado of estados) {
          await db.runAsync(
            'INSERT OR IGNORE INTO Estado_reportes (ID_Estado_Actual, Nombre_Estado) VALUES (?, ?)',
            [estado.id, estado.nombre]
          );
        }
        console.log(`   ✅ ${estados.length} estados insertados`);
      }
    });

    console.log('✅ Catálogos iniciales listos');
  } catch (error) {
    console.error('❌ Error insertando catálogos:', error);
    throw error;
  }
};

/**
 * Función auxiliar para resetear completamente la base de datos.
 * ⚠️ SOLO USAR PARA DESARROLLO/DEBUG - Borra todos los datos.
 */
export const resetDatabase = async () => {
  console.warn('⚠️ RESETEANDO BASE DE DATOS - Se perderán todos los datos');
  
  await db.execAsync('DROP TABLE IF EXISTS Multimedia_reportes;');
  await db.execAsync('DROP TABLE IF EXISTS Reportes;');
  await db.execAsync('DROP TABLE IF EXISTS Areas;');
  await db.execAsync('DROP TABLE IF EXISTS Severidad;');
  await db.execAsync('DROP TABLE IF EXISTS Estado_reportes;');
  
  console.log('🗑️ Tablas eliminadas');
  
  // Reinicializar
  await initDatabase();
  
  console.log('✅ Base de datos reseteada');
};

export const getDB = () => {
  if (!db) {
    throw new Error('La base de datos no ha sido inicializada. Llama a initDatabase() primero.');
  }
  return db;
};