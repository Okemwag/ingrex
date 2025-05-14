// src/main-cluster.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cluster from 'cluster';
import os from 'os';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { NestExpressApplication } from '@nestjs/platform-express';

const logger = new Logger('ClusterMain');

async function bootstrapWorker() {
  try {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    const configService = app.get(ConfigService);

    // Security middleware
    app.use(helmet());
    app.enableCors();

    // Global pipes and filters
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );

    // Swagger documentation
    if (process.env.NODE_ENV !== 'production') {
      const config = new DocumentBuilder()
        .setTitle('Event Management API')
        .setDescription('Event management system API documentation')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
      const document = SwaggerModule.createDocument(app, config);
      SwaggerModule.setup('docs', app, document);
    }

    const port = configService.get<number>('PORT', 3000);
    await app.listen(port);
    logger.log(`Worker ${process.pid} started on port ${port}`);
  } catch (error) {
    logger.error(`Worker ${process.pid} failed to start`, error);
    process.exit(1);
  }
}

function setupCluster() {
  const numCPUs = os.cpus().length;

  logger.log(`Master ${process.pid} is running`);

  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    const message = `Worker ${worker.process.pid} died with ${signal || code}`;
    logger.warn(message);
    logger.log('Forking new worker...');
    cluster.fork();
  });

  // Handle graceful shutdown
  process.on('SIGTERM', () => {
    logger.log('Master received SIGTERM. Shutting down workers...');
    for (const id in cluster.workers) {
      cluster.workers[id]?.kill();
    }
    process.exit(0);
  });
}

// Check if current process is master
const isMaster =
  'isPrimary' in cluster && typeof cluster.isPrimary === 'boolean'
    ? cluster.isPrimary
    : cluster.isMaster;

if (isMaster) {
  setupCluster();
} else {
  void bootstrapWorker();
}
