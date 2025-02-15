import { Proyecto } from 'src/modelos/proyecto/entities/proyecto.entity';
import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class BaseDeDato {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false, length: 50 })
  usuario: string;

  @Column({ nullable: false, length: 512 })
  contrasenia: string;

  @Column({ nullable: false, length: 512 })
  url: string;

  @Column({ type: 'char', nullable: false, length: 1 })
  tipo: string;

  @OneToOne(() => Proyecto, (proyecto) => proyecto.base_de_datos)
  proyecto: Proyecto;
}
