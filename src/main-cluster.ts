// // This file should be placed in src/main-cluster.ts
// import { NestFactory } from '@nestjs/core';
// import { AppModule } from './app.module';
// import * as cluster from 'cluster';
// import * as os from 'os';
// import { ValidationPipe } from '@nestjs/common';
// import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
// import { ConfigService } from '@nestjs/config';
// import helmet from 'helmet';
// import { NestExpressApplication } from '@nestjs/platform-express';

// async function bootstrap() {
//   const app = await NestFactory.create<NestExpressApplication>(AppModule);
//   const configService = app.get(ConfigService);
//   // Global setup
//   app.enableCors();
//   app.use(helmet());
//   app.useGlobalPipes(new ValidationPipe({ transform: true }));

//   // Swagger setup
//   const swaggerConfig = new DocumentBuilder()
//     .setTitle('Event Management System API')
//     .setDescription('API for managing events, tickets, payments, and more')
//     .setVersion('1.0')
//     .addBearerAuth()
//     .build();
//   const document = SwaggerModule.createDocument(app, swaggerConfig);
//   SwaggerModule.setup('api/docs', app, document);
//   const port = configService.get<number>('API_PORT', 3000);
//   await app.listen(port);
//   console.log(`Application is running on port ${port}`);
// }

// // Check if current process is master
// if (cluster.isMaster) {
//   console.log(`Master server started on ${process.pid}`);

//   // Get number of CPUs
//   const numCPUs = os.cpus().length;
//   // Fork workers equal to number of CPUs
//   for (let i = 0; i < numCPUs; i++) {
//     cluster.fork();
//   }

//   // If worker dies, start another one
//   cluster.on('exit', (worker, code, signal) => {
//     console.log(`Worker ${worker.process.pid} died. Restarting...`);
//     cluster.fork();
//   });
// } else {
//   // Worker processes bootstrap the application
//   bootstrap();
// }
// }
