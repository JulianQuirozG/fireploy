import { Repositorio } from "src/modelos/repositorio/entities/repositorio.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Fichero {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 255 })
    nombre: string; // Esta es tu columna string

    @Column({ type: 'blob', nullable: true })
    contenido: Buffer; // Esta es tu columna BLOB

    @ManyToOne(() => Repositorio, (repositorio) => repositorio.ficheros, {
        onDelete: 'SET NULL',
    })
    repositorio: Repositorio;
}
