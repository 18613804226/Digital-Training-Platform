import path from 'node:path'
import errorHandler from './error';
// import { defineNitroConfig } from 'nitropack';

process.env.COMPATIBILITY_DATE = new Date().toISOString();
export default defineNitroConfig({
  preset: 'vercel', // 或 'vercel-serverless'
  alias: {
    '@': path.resolve(__dirname, '.'),
    '@utils': path.resolve(__dirname, '.utils'),
    '@error': path.resolve(__dirname, '.error'),
  },
  scanDirs: ['.', 'api', 'utils', 'error'],
  devErrorHandler: errorHandler,
  errorHandler: '@/error',
  routeRules: {
    '/api/**': {
      cors: true,
      headers: {
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Allow-Headers':
          'Accept, Authorization, Content-Length, Content-Type, If-Match, If-Modified-Since, If-None-Match, If-Unmodified-Since, X-CSRF-TOKEN, X-Requested-With',
        'Access-Control-Allow-Methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Expose-Headers': '*',
      },
    },
  },
});
// nitro.config.ts


