import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.TCP,
      options: {
        host: process.env.BIOMETRIC_SERVICE_HOST || 'localhost',
        port: parseInt(process.env.BIOMETRIC_SERVICE_PORT || '3003'),
      },
    },
  );

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
  }));

  await app.listen();
  console.log(`Biometric Service is running on TCP port ${process.env.BIOMETRIC_SERVICE_PORT || 3003}`);
}
bootstrap();
