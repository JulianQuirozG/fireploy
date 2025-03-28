import { forwardRef, Module } from '@nestjs/common';
import { BaseDeDatosService } from './base_de_datos.service';
import { BaseDeDatosController } from './base_de_datos.controller';
import { BaseDeDato } from './entities/base_de_dato.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProyectoModule } from '../proyecto/proyecto.module';
import { DockerfileService } from 'src/services/docker.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([BaseDeDato]),
    forwardRef(() => ProyectoModule),
  ],
  controllers: [BaseDeDatosController],
  providers: [BaseDeDatosService,
    DockerfileService
  ],
  exports: [BaseDeDatosService],
})
export class BaseDeDatosModule { }
