import { config } from 'dotenv';
import path from 'path';
config();

export function Log(service: string, message: string) {
    process.stdout.write(`${new Date().toISOString()} | ${service}: ${message}\n`)
}

// Deployment Constants
export const
    VERSION = process.env.VERSION || Date.now(),
    WEB_ADDR = process.env.WEB_ADDR || '127.0.0.1',
    WEB_PORT = process.env.WEB_PORT || '80',
    DIR_ASSETS = path.join(process.cwd(), 'assets'),
    DIR_VIEWS = path.join(process.cwd(), 'views')