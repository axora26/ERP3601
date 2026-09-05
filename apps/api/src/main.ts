import "reflect-metadata";
import cookieParser from "cookie-parser";
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";
import { RequestIdMiddleware } from "./common/middleware/request-id.middleware";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const webOrigin = process.env.WEB_ORIGIN ?? "http://localhost:3000";

  app.use(cookieParser());
  app.use(new RequestIdMiddleware().use);
  app.enableCors({ origin: webOrigin, credentials: true });
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  app.setGlobalPrefix("api/v1");

  const port = Number(process.env.API_PORT ?? 4000);
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`AXORA ONE API listening on :${port}`);
}

void bootstrap();
