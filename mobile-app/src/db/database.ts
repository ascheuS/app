import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';

let db: SQLiteDatabase;

/**
 * Inicializa la base de datos SQLite local, creando las tablas
 * necesarias para el funcionamiento offline.
 */
export const initDatabase = async () => {
  db = await openDatabaseAsync('sigra_offline.db');

  // 1. Habilitar llaves foráneas (¡OBLIGATORIO!)
  await db.execAsync('PRAGMA foreign_keys = ON;');

  // --- CREACIÓN DE TABLAS DE CATÁLOGOS ---
  // Estas tablas se "sincronizan" (se descargan) desde la API
  // para llenar los menús desplegables (Pickers) offline.
  // Usamos el ID del servidor como Primary Key local.

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS Areas (
      ID_Area INTEGER PRIMARY KEY NOT NULL,
      Nombre_Area TEXT NOT NULL
    );
  `);

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS Severidad (
      ID_Severidad INTEGER PRIMARY KEY NOT NULL,
      Nombre_Severidad TEXT NOT NULL
    );
  `);

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS Estado_reportes (
      ID_Estado_Actual INTEGER PRIMARY KEY NOT NULL,
      Nombre_Estado TEXT NOT NULL
    );
  `);
  
  // --- CREACIÓN DE TABLAS DE DATOS ---
  // Estas tablas son creadas por el usuario en el teléfono.

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS Reportes (
      -- 1. IDs y Sincronización
      id_local INTEGER PRIMARY KEY AUTOINCREMENT,
      id_servidor INTEGER DEFAULT NULL,
      sincronizado INTEGER NOT NULL DEFAULT 0,
      
      -- 2. Datos del Reporte
      Titulo VARCHAR(255) NOT NULL,
      Descripcion TEXT,
      Fecha_Reporte DATE,
      UUID_Cliente CHAR(36) NOT NULL UNIQUE, -- El UUID para idempotencia
      
      -- 3. Timestamps
      Hora_Creado DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      Hora_Actualizado DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      -- (Recuerda: 'ON UPDATE' no existe, la app debe actualizar este campo)
      
      -- 4. Llaves Foráneas (apuntan a los catálogos locales)
      RUT BIGINT, -- RUT del usuario, guardado desde SecureStore
      ID_Severidad INT,
      ID_Area INT,
      ID_Estado_Actual INT,

      FOREIGN KEY (ID_Area) REFERENCES Areas(ID_Area) ON DELETE SET NULL,
      FOREIGN KEY (ID_Severidad) REFERENCES Severidad(ID_Severidad) ON DELETE SET NULL,
      FOREIGN KEY (ID_Estado_Actual) REFERENCES Estado_reportes(ID_Estado_Actual) ON DELETE SET NULL
    );
  `);

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS Multimedia_reportes (
      -- 1. IDs y Sincronización
      id_local_multimedia INTEGER PRIMARY KEY AUTOINCREMENT,
      id_servidor_multimedia INTEGER DEFAULT NULL,
      sincronizado INTEGER NOT NULL DEFAULT 0,

      -- 2. Llave Foránea (apunta al ID LOCAL del reporte)
      id_reporte_local INTEGER NOT NULL,
      
      -- 3. Datos del archivo
      Tipo_Multimedia VARCHAR(100),
      ruta TEXT NOT NULL, -- Ruta local (file:///...) de la foto/video

      FOREIGN KEY (id_reporte_local) REFERENCES Reportes(id_local) ON DELETE CASCADE
    );
  `);

  console.log('✅ Base de datos SQLite inicializada correctamente.');

  return db;
};


export const getDB = () => {
  if (!db) {
    throw new Error('La base de datos no ha sido inicializada. Llama a initDatabase() primero.');
  }
  return db;
};