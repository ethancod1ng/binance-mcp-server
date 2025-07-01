export class BinanceError extends Error {
  constructor(
    message: string,
    public code?: string | number,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'BinanceError';
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class ConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigurationError';
  }
}

export function handleBinanceError(error: any): never {
  if (error.code) {
    switch (error.code) {
      case -1000:
        throw new BinanceError('Unknown error occurred', error.code, error);
      case -1001:
        throw new BinanceError('Internal error; unable to process your request', error.code, error);
      case -1002:
        throw new BinanceError('You are not authorized to execute this request', error.code, error);
      case -1003:
        throw new BinanceError('Too many requests; current limit is exceeded', error.code, error);
      case -1021:
        throw new BinanceError('Timestamp for this request is outside of the recvWindow', error.code, error);
      case -1022:
        throw new BinanceError('Signature for this request is not valid', error.code, error);
      case -2010:
        throw new BinanceError('New order rejected', error.code, error);
      case -2011:
        throw new BinanceError('Cancel rejected', error.code, error);
      default:
        throw new BinanceError(error.msg || 'Binance API error', error.code, error);
    }
  }

  if (error.message) {
    throw new BinanceError(error.message, undefined, error);
  }

  throw new BinanceError('Unknown Binance API error', undefined, error);
}

export function sanitizeError(error: Error): string {
  const message = error.message || 'Unknown error';
  
  return message
    .replace(/API key/gi, '[API_KEY]')
    .replace(/Secret/gi, '[SECRET]')
    .replace(/signature/gi, '[SIGNATURE]');
}

export function logError(error: Error): void {
  const sanitizedMessage = sanitizeError(error);
  console.error(`[ERROR] ${error.name}: ${sanitizedMessage}`);
  
  if (error.stack && process.env.LOG_LEVEL === 'debug') {
    console.error(error.stack);
  }
}