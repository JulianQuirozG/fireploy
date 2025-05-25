import { Module } from '@nestjs/common';
import { FicherosService } from './ficheros.service';
import { FicherosController } from './ficheros.controller';
import { Repositorio } from '../repositorio/entities/repositorio.entity';
import { Fichero } from './entities/fichero.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports:[
    TypeOrmModule.forFeature([Fichero]),
    Repositorio
  ],
  controllers: [FicherosController],
  providers: [FicherosService],
  exports: [FicherosService],
})
export class FicherosModule {}
