/* eslint-disable prettier/prettier */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as bodyParser from 'body-parser';



async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  
  app.use(bodyParser.json()); // For parsing application/json
  app.use(bodyParser.urlencoded({ extended: true })); // For parsing appl
  await app.listen(3000);
  
  console.log(`server running on http://localhost:3000`)
  app.use((req, res, next) => {
    req.setTimeout(120000); 
    next();
  });
}

bootstrap();
