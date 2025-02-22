import { Module } from '@nestjs/common';
import { SeccionService } from './seccion.service';
import { SeccionController } from './seccion.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Seccion } from './entities/seccion.entity';
import { CursoModule } from '../curso/curso.module';

@Module({
  imports: [TypeOrmModule.forFeature([Seccion]), CursoModule],
  controllers: [SeccionController],
  providers: [SeccionService],
})
export class SeccionModule {}
