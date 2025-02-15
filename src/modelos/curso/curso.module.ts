import { Module } from '@nestjs/common';
import { CursoService } from './curso.service';
import { CursoController } from './curso.controller';
import { Curso } from './entities/curso.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Curso])],
  controllers: [CursoController],
  providers: [CursoService],
})
export class CursoModule {}
