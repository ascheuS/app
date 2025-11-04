import { Model } from "@nozbe/watermelondb";
import { field, date } from "@nozbe/watermelondb/decorators";

export default class Reporte extends Model {
    static table = 'reportes'
    
    
    @field('titulo') titulo
    @field('descripcion') descripcion
    @date('fecha_reporte') fecha_reporte
    @field('id_area') id_area
    @field('id_severidad') id_severidad
    @field('sincronizado') sincronizado
}