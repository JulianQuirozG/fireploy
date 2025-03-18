import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DockerfileService } from './services/docker.service';

async function bootstrap() {
  const dockerfileService = new DockerfileService;
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: ['Content-Type', 'Authorization', 'sessiontoken'],
  });

  dockerfileService.setupDatabases();

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}

void bootstrap();
