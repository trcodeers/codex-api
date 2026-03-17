import { Logger, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import configuration from './config/configuration';
import { validateEnv } from './config/validate-env';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ExamsModule } from './exams/exams.module';
import { TestsModule } from './tests/tests.module';
import { QuestionsModule } from './questions/questions.module';
import { AttemptsModule } from './attempts/attempts.module';
import { RequestLoggerMiddleware } from './common/middleware/request-logger.middleware';

const logger = new Logger('MongoConnection');

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate: validateEnv,
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('mongo.uri'),
        connectionFactory: (connection: Connection) => {
          connection.on('connected', () => {
            logger.log(`MongoDB connected successfully at ${connection.host}:${connection.port}/${connection.name}`);
          });
          connection.on('error', (error) => {
            logger.error(`MongoDB connection failed: ${error.message}`);
          });
          connection.on('disconnected', () => {
            logger.warn('MongoDB disconnected');
          });
          return connection;
        },
      }),
    }),
    AuthModule,
    UsersModule,
    ExamsModule,
    TestsModule,
    QuestionsModule,
    AttemptsModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggerMiddleware).forRoutes('*');
  }
}
