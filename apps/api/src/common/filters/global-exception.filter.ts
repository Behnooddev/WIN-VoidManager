import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse = exception instanceof HttpException
      ? exception.getResponse()
      : { message: 'Internal server error', statusCode: status };

    const message = typeof exceptionResponse === 'object'
      ? (exceptionResponse as any).message
      : exceptionResponse;

    // In production, we NEVER leak the original error if it's a 500
    const finalMessage = status === HttpStatus.INTERNAL_SERVER_ERROR
      ? 'An unexpected error occurred. Please contact your administrator.'
      : message;

    // Log the actual error for developers
    this.logger.error(
      `HTTP ${status} ${request.method} ${request.url} - ${JSON.stringify(exception)}`,
    );

    response.status(status).json({
      statusCode: status,
      message: finalMessage,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
