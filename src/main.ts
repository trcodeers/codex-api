import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { DatabaseSeederService } from './database/database.seeder.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.enableCors({
    origin: ['https://ais-dev-hhpi5apkdqlmlgi6pu3u7w-301705739685.asia-east1.run.app'], // 👈 Only allow this domain
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,

  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalFilters(new GlobalExceptionFilter());

  const seederService = app.get(DatabaseSeederService);
  await seederService.seedOnStartup();

  const port = process.env.PORT || 4000;
  await app.listen(port);
}

bootstrap();
