import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import session from 'express-session';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { DatabaseSeederService } from './database/database.seeder.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.setGlobalPrefix('api');
  app.enableCors({
    origin: true,
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  app.use(
    session({
      secret: configService.getOrThrow<string>('session.secret'),
      name: configService.get<string>('session.cookieName', 'mockprep.sid'),
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        maxAge: configService.get<number>('session.maxAge', 604800000),
        sameSite: configService.get<'lax' | 'strict' | 'none'>('session.sameSite', 'lax'),
        secure: configService.get<boolean>('session.secure', false),
      },
    }),
  );
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

  const port = configService.get<number>('port', 4000);
  await app.listen(port);
}

bootstrap();
