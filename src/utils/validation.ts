import { z } from 'zod';

export function validateInput<T>(schema: z.ZodSchema<T>, input: unknown): T {
  try {
    return schema.parse(input);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join(', ');
      throw new Error(`Validation error: ${issues}`);
    }
    throw error;
  }
}

export function isValidSymbol(symbol: string): boolean {
  return /^[A-Z]{3,}[A-Z]{3,}$/.test(symbol);
}

export function validateSymbol(symbol: string): void {
  if (!isValidSymbol(symbol)) {
    throw new Error(`Invalid symbol format: ${symbol}. Expected format like BTCUSDT`);
  }
}

export function validateQuantity(quantity: string): void {
  const num = parseFloat(quantity);
  if (isNaN(num) || num <= 0) {
    throw new Error(`Invalid quantity: ${quantity}. Must be a positive number`);
  }
}

export function validatePrice(price: string): void {
  const num = parseFloat(price);
  if (isNaN(num) || num <= 0) {
    throw new Error(`Invalid price: ${price}. Must be a positive number`);
  }
}