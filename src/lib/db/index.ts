import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL!;

const client = postgres(connectionString, {
  ssl: false, // Disable SSL as required
  max: 1, // Limit connections for development
});

export const db = drizzle(client, { schema });