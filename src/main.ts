import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { StorageConfig } from 'config/storage.config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useStaticAssets(StorageConfig.photo.destination,{
    prefix: StorageConfig.photo.urlPrefix,
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 dana traje
    index: false, 
  });

  await app.listen(3000);
}
bootstrap();
