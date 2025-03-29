import { Usuario } from 'src/modelos/usuario/entities/usuario.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Solicitud {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Usuario, (usuario) => usuario.solicitudes, {
    onDelete: 'CASCADE',
  })
  usuario: Usuario;

  @ManyToOne(() => Usuario, (usuario) => usuario.solicitudes_pendientes, {
    onDelete: 'CASCADE',
  })
  aprobado_by: Usuario;

  @Column({ default: 'P', nullable: false, length: 10 })
  estado: string = 'P';

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fecha_solicitud: Date = new Date();

  @Column({ nullable: true })
  fecha_respuesta: Date;
}
