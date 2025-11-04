import {appSchema,tableSchema} from '@nozbe/watermelondb';

export default appSchema({
  version: 1,
  tables: [
    tableSchema({
    name: 'reportes',
    columns: [
      {name: 'titulo', type: 'string'},
      {name: 'descripcion', type: 'string'},
      {name: 'fecha_reporte', type: 'string'},
      {name: 'id_area', type: 'number',isIndexed: true},
      {name: 'id_severidad', type: 'number',isIndexed: true},
      {name: 'sincronizado', type: 'boolean'},
    ]
  }),
    tableSchema({
    name: 'areas',
    columns: [
      {name: 'id_area', type: 'number'},
      {name: 'nombre_area', type: 'string'},
    ]
  }),
    tableSchema({
    name: 'severidad',
    columns: [
      {name: 'id_severidad', type: 'number'},
      {name: 'nombre_severidad', type: 'string'},
    ]
  })
  ]
});

