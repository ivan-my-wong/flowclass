import {
  BadRequestException,
  INestApplication,
  ValidationError,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory, Reflector } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { useContainer } from 'class-validator'
import * as admin from 'firebase-admin'
import { initializeApp } from 'firebase-admin/app'
import { initializeTransactionalContext } from 'typeorm-transactional'

import { BadRequestExceptionFilter } from './common/filters/bad-request.filter'
import { HttpExceptionFilter } from './common/filters/http-exception.filter'
import { TransformInterceptor } from './common/middlewares/transform.interceptor'
import { TAppConfig } from './config/config.schema'
import { AppModule } from './modules/app.module'
import { initExtensions } from './exts'

async function initFirebase(config: ConfigService<TAppConfig>) {
  const firebasePrivateKey = config.get('FIREBASE_PRIVATE_KEY')

  initializeApp({
    // credential: applicationDefault(),
    credential: admin.credential.cert({
      projectId: config.get('FIREBASE_PROJECT_ID'),
      privateKey: JSON.parse(firebasePrivateKey.replace(/\n/g, '\\n')).replace(/\\n/g, '\n'),
      clientEmail: config.get('FIREBASE_CLIENT_EMAIL'),
    } as admin.ServiceAccount),

    projectId: config.get('FIREBASE_PROJECT_ID'),
  })
}

async function initSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('Flowclass API Swagger')
    .setDescription('Backend of Flowclass')
    .setVersion('1.1')
    .addBearerAuth(
      {
        // I was also testing it without prefix 'Bearer ' before the JWT
        description: `[just text field] Please enter token in following format: Bearer <JWT>`,
        name: 'Authorization',
        bearerFormat: 'Bearer', // I`ve tested not to use this field, but the result was the same
        scheme: 'Bearer',
        type: 'http', // I`ve attempted type: 'apiKey' too
        in: 'Header',
      },
      'access-token'
    )
    .addTag('Flowclass API Document')
    .build()
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api', app, document)
}

async function bootstrap() {
  initExtensions()
  initializeTransactionalContext()

  const isNodeEnvProduction = process.env.NODE_ENV === 'production'
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
    logger: isNodeEnvProduction ? ['error', 'warn'] : ['error', 'warn', 'log'],
  })

  useContainer(app.select(AppModule), { fallbackOnErrors: true })

  const reflector = app.get(Reflector)

  app.useGlobalInterceptors(new TransformInterceptor())
  app.useGlobalFilters(new HttpExceptionFilter(reflector))
  app.useGlobalFilters(new BadRequestExceptionFilter(reflector))
  app.enableVersioning({
    type: VersioningType.URI,
  })
  const options = {
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    preflightContinue: false,
    optionsSuccessStatus: 204,
    credentials: true,
  }
  app.enableCors(options)
  app.useGlobalPipes(
    new ValidationPipe({
      enableDebugMessages: true,
      whitelist: true,
      transform: true,
      dismissDefaultMessages: true,
      validationError: { target: false },
      exceptionFactory: (errors: ValidationError[]): BadRequestException => {
        return new BadRequestException(errors)
      },
      transformOptions: {
        enableImplicitConversion: true, // allow conversion underneath
      },
    })
  )

  const config: ConfigService<TAppConfig> = app.get(ConfigService)
  const isSwaggerEnabled = config.get('SWAGGER_ENABLED')
  if (isSwaggerEnabled) {
    await initSwagger(app)
  }

  await initFirebase(config)

  await app.listen(parseInt(config.get('APP_PORT'), 10) || 5000)
}
bootstrap()
