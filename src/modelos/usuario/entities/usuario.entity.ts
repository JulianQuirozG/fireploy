import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  TableInheritance,
} from 'typeorm';

@Entity()
@TableInheritance({
  column: { type: 'varchar', name: 'tipo', nullable: false, length: 7 },
})
export class Usuario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, nullable: false })
  nombre: string;

  @Column({ length: 50, nullable: false })
  apellido: string;

  @Column({ nullable: false })
  fecha_nacimiento: Date;

  @Column({ type: 'char', length: 1, nullable: false })
  sexo: string;

  @Column({ length: 512 })
  descripcion: string;

  @Column({ length: 50, unique: true, nullable: false })
  correo: string;

  @Column({ length: 512, nullable: false })
  contrasenia: string;

  @Column({ type: 'char', length: 1, nullable: false })
  estado: string;

  @Column({ length: 256 })
  red_social: string;

  @Column({ length: 256 })
  foto_perfil: string;
}
