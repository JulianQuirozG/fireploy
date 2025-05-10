import { Usuario } from 'src/modelos/usuario/entities/usuario.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Notificacione {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false, length: 50 })
  titulo: string;

  @Column({ nullable: false, length: 255 })
  mensaje: string;

  @Column({ nullable: false })
  tipo: number;

  @Column({ nullable: false })
  fecha_creacion: Date;

  @Column({ nullable: false })
  visto: boolean;

  @ManyToOne(() => Usuario, (usuario) => usuario.notificaciones, {
    onDelete: 'SET NULL',
  })
  usuario: Usuario;
}
