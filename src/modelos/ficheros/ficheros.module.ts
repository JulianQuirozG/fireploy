import { forwardRef, Module } from '@nestjs/common';
import { FicherosService } from './ficheros.service';
import { FicherosController } from './ficheros.controller';
import { Repositorio } from '../repositorio/entities/repositorio.entity';
import { Fichero } from './entities/fichero.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RepositorioModule } from '../repositorio/repositorio.module';

@Module({
  imports:[
    TypeOrmModule.forFeature([Fichero]),
    forwardRef(() => RepositorioModule),
  ],
  controllers: [FicherosController],
  providers: [FicherosService],
  exports: [FicherosService],
})
export class FicherosModule {}
