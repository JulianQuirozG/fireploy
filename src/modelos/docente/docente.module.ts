import { Module } from '@nestjs/common';
import { DocenteService } from './docente.service';
import { DocenteController } from './docente.controller';
import { Docente } from './entities/docente.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Docente])],
  controllers: [DocenteController],
  providers: [DocenteService],
  exports: [DocenteService],
})
export class DocenteModule {}
