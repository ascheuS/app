import { Model } from "@nozbe/watermelondb";
import { field} from "@nozbe/watermelondb/decorators";

export default class Reporte extends Model {
    static table = 'reportes'
    @field('titulo') titulo!: string;
    @field('descripcion') descripcion!: string;
    @field('fecha_reporte') fecha_reporte!: string
    @field('id_area') id_area!: number;
    @field('id_severidad') id_severidad!: number;
    @field('sincronizado') sincronizado!: boolean;
}