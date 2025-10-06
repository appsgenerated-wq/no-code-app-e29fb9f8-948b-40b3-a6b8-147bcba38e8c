// Custom main.js to override Manifest's CORS settings for proper preview support
const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('manifest/dist/manifest/src/app.module');
const { ValidationPipe } = require('@nestjs/common');
const { ConfigService } = require('@nestjs/config');
const connectLiveReload = require('connect-livereload');
const express = require('express');
const livereload = require('livereload');
const fs = require('fs');
const yaml = require('js-yaml');
const { readFileSync } = require('fs');
const { join } = require('path');
const { OpenApiService } = require('manifest/dist/manifest/src/open-api/services/open-api.service');
const { EntityTypeService } = require('manifest/dist/manifest/src/entity/services/entity-type.service');
const { EntityTsTypeInfo } = require('manifest/dist/manifest/src/entity/types/entity-ts-type-info');
const {
  API_PATH,
  DEFAULT_PORT,
  DEFAULT_TOKEN_SECRET_KEY,
  STORAGE_PATH
} = require('manifest/dist/manifest/src/constants');

async function bootstrap() {
  // Create app with custom CORS configuration
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        // Define allowed origins for previews and development
        const allowedOrigins = [
          'http://localhost:3000',
          'https://*.stackblitz.io',
          'https://*.webcontainer.io',
          'https://*.vercel.app',
          'https://*.netlify.app',
          'https://*.github.io'
        ];

        // Check if the origin matches any allowed pattern
        const isAllowed = allowedOrigins.some(pattern => {
          if (pattern.includes('*')) {
            // Simple wildcard matching for *.domain.com
            const basePattern = pattern.replace('*.', '');
            return origin && origin.endsWith(basePattern);
          } else {
            return pattern === origin;
          }
        });

        if (isAllowed) {
          return callback(null, true);
        } else {
          console.log('🚫 [CORS] Blocked origin:', origin);
          return callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-App-ID', 'Accept', 'Origin', 'X-Requested-With']
    },
    logger: ['error', 'warn']
  });

  // Get the underlying Express instance and disable X-Powered-By header
  app.getHttpAdapter().getInstance().disable('x-powered-by');

  const configService = app.get(ConfigService);

  app.setGlobalPrefix(API_PATH);
  app.use(express.urlencoded({ limit: '50mb', extended: true }));
  app.useGlobalPipes(new ValidationPipe());

  // Live reload for development
  const isProduction = configService.get('NODE_ENV') === 'production';
  const isTest = configService.get('NODE_ENV') === 'test';

  if (!isProduction && !isTest) {
    const liveReloadServer = livereload.createServer();
    liveReloadServer.server.once('connection', () => {
      setTimeout(() => {
        liveReloadServer.refresh('/');
      }, 100);
    });
    app.use(connectLiveReload());
  }

  const adminPanelFolder = configService.get('paths').adminPanelFolder;
  app.use(express.static(adminPanelFolder));

  const publicFolder = configService.get('paths').publicFolder;
  const storagePath = join(publicFolder, STORAGE_PATH);
  app.use(`/${STORAGE_PATH}`, express.static(storagePath));

  // Redirect all requests to the client app index
  app.use((req, res, next) => {
    if (req.url.startsWith(`/${API_PATH}`) || req.url.startsWith(`/${STORAGE_PATH}`)) {
      next();
    } else {
      res.sendFile(join(adminPanelFolder, 'index.html'));
    }
  });

  // Open API documentation
  if (configService.get('showOpenApiDocs')) {
    const openApiService = app.get(OpenApiService);
    const entityTypeService = app.get(EntityTypeService);
    const entityTypeInfos = entityTypeService.generateEntityTypeInfos();

    SwaggerModule.setup('api', app, openApiService.generateOpenApiObject(entityTypeInfos));

    // Write OpenAPI spec to file
    const yamlString = yaml.dump(openApiService.generateOpenApiObject(entityTypeInfos));
    fs.writeFileSync(join(configService.get('paths').generatedFolder, 'openapi.yml'), yamlString, 'utf8');
  }

  const port = configService.get('port') || DEFAULT_PORT;
  await app.listen(port);

  console.log(`🚀 Manifest backend running on port ${port}`);
  console.log(`🌐 Environment: ${configService.get('NODE_ENV') || 'development'}`);
  console.log(`🔗 Admin panel: http://localhost:${port}`);
  console.log(`📚 API docs: http://localhost:${port}/api`);
}

bootstrap().catch(console.error);
