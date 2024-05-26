import { createHash } from 'crypto';

export function generateRandomRefCode(len: number): string {
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < len; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

export function generateTransactionHash(): string {
  // Get the current timestamp in milliseconds
  const timestamp = Date.now().toString();

  // Generate a random string to add uniqueness (optional)
  const randomString = Math.random().toString(36).substring(2);

  // Concatenate timestamp and random string (if needed)
  const dataToHash = timestamp + randomString;

  // Create a hash using SHA-256
  return createHash('sha256').update(dataToHash).digest('hex');
}

export function generateIdWithTime(): string {
  // Get the current timestamp in milliseconds
  const timestamp = Date.now().toString();

  // Generate a random string to add uniqueness
  const randomString = Math.random().toString(25).substring(2);

  // Concatenate timestamp and random string
  return timestamp + randomString;
}

export function formatBalance(amount: number, currency: string): any {
  switch (currency) {
    case 'btc': // Bitcoin
      return formatNumber(amount, 8); // 8 decimal places
    case 'usdt': // Tether
    case 'usdc': // USD Coin
    case 'usd': // USD Coin
    case 'ngn': // NGN Fiat
      return formatNumber(amount, 2); // 2 decimal places
    case 'eth': // Ethereum
      return formatNumber(amount,8); // 18 decimal places
    case 'sol': // Solana
      return formatNumber(amount, 9); // 9 decimal places
    case 'matic': // Polygon (MATIC)
      return formatNumber(amount,8); // 18 decimal places
    case 'bnb': // Binance Coin
      return formatNumber(amount, 8); // 8 decimal places
    default:
      return formatNumber(amount, 2); // Default to 2 decimal places if coin type is unknown
  }
}

function formatNumber(num, currency) {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: currency,
  }).format(num);
}

export function formatChange(newRate, oldRate) {
  const percentageChange = ((newRate - oldRate) / oldRate) * 100;
  return {
    percentageChange: percentageChange.toFixed(2), // Formatting to 2 decimal places
    isPositive: percentageChange >= 0, // Check if the change is positive or negative
  };
}
