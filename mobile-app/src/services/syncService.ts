import { getDB } from '../db/database'; // Tu archivo de initDatabase
import api  from './api'; // Tu servicio de API (Axios)

// Esta función hará todo el trabajo

export const sincronizarCatalogos = async () => {
  const db = getDB();
  console.log("Iniciando sincronización de catálogos...");

  try {
    const [areasRes, severidadRes, estadosRes] = await Promise.all([
      api.get('/reportes/catalogos/areas'),
      api.get('/reportes/catalogos/severidad'),
      api.get('/reportes/catalogos/estados'),
    ]);

    // Si llegamos aquí, la descarga fue exitosa, entonces borramos y insertamos
    await db.withTransactionAsync(async () => {
      await db.runAsync('DELETE FROM Areas;');
      await db.runAsync('DELETE FROM Severidad;');
      await db.runAsync('DELETE FROM Estado_reportes;');

      for (const area of areasRes.data)
        await db.runAsync(
          'INSERT INTO Areas (ID_Area, Nombre_Area) VALUES (?, ?)',
          [area.ID_Area, area.Nombre_Area]
        );

      for (const sev of severidadRes.data)
        await db.runAsync(
          'INSERT INTO Severidad (ID_Severidad, Nombre_Severidad) VALUES (?, ?)',
          [sev.ID_Severidad, sev.Nombre_Severidad]
        );

      for (const est of estadosRes.data)
        await db.runAsync(
          'INSERT INTO Estado_reportes (ID_Estado_Actual, Nombre_Estado) VALUES (?, ?)',
          [est.ID_Estado_Actual, est.Nombre_Estado]
        );
    });

    console.log("✅ Sincronización completada");
  } catch (e) {
    // Si falla, no borramos los catálogos y dejamos los que había
    console.error("❌ Error en sincronización:", e);
    console.log("Se mantienen los catálogos locales existentes.");
  }
};