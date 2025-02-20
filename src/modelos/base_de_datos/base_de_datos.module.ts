import { Module } from '@nestjs/common';
import { BaseDeDatosService } from './base_de_datos.service';
import { BaseDeDatosController } from './base_de_datos.controller';
import { BaseDeDato } from './entities/base_de_dato.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([BaseDeDato])],
  controllers: [BaseDeDatosController],
  providers: [BaseDeDatosService],
})
export class BaseDeDatosModule {}
