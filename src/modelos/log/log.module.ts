import { Module } from '@nestjs/common';
import { LogService } from './log.service';
import { LogController } from './log.controller';
import { Log } from './entities/log.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RepositorioModule } from '../repositorio/repositorio.module';

@Module({
  imports: [TypeOrmModule.forFeature([Log]), RepositorioModule],
  controllers: [LogController],
  providers: [LogService],
  exports: [LogService],
})
export class LogModule {}
