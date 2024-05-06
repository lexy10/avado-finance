import {createHash} from 'crypto';

export function generateRandomRefCode(len: number): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
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