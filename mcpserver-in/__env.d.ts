// __env.d.ts
// Environment variable type declarations

interface Env {
  DATABASE_URL: string;
  NEXT_PUBLIC_URL: string;
  NEXT_PUBLIC_REGION: string;
  AUTH_SECRET: string;
  AUTH_SERVER_URL: string;
  AUTH_JWKS_URL?: string;
  UPSTASH_REDIS_URL: string;
  UPSTASH_REDIS_TOKEN: string;
  CLIENT_ID: string;
  CLIENT_SECRET: string;
  REVALIDATE_TOKEN?: string;
  NODE_ENV: 'development' | 'production' | 'test';
}

declare interface ProcessEnv extends Env {
  [key: string]: string | undefined;
}

declare global {
  namespace NodeJS {
    interface ProcessEnv extends Env {}
  }
}

export type {};
