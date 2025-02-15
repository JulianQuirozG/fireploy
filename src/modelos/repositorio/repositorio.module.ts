import { Module } from '@nestjs/common';
import { RepositorioService } from './repositorio.service';
import { RepositorioController } from './repositorio.controller';
import { Repositorio } from './entities/repositorio.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Repositorio])],
  controllers: [RepositorioController],
  providers: [RepositorioService],
})
export class RepositorioModule {}
