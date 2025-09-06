import { drizzle } from 'drizzle-orm/postgres-js';
import { sql } from 'drizzle-orm';
import postgres from 'postgres';
import 'dotenv/config'; // Ensure dotenv is loaded for process.env.DATABASE_URL

async function resetDatabase() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL environment variable is not set.');
    process.exit(1);
  }

  const client = postgres(process.env.DATABASE_URL, { max: 1 });
  const db = drizzle(client);

  try {
    console.log('Attempting to reset database...');
    // Drop and recreate the public schema to clear all tables and data
    await db.execute(sql`DROP SCHEMA public CASCADE;`);
    await db.execute(sql`CREATE SCHEMA public;`);
    console.log('Database reset successfully: public schema dropped and recreated.');
  } catch (error) {
    console.error('Error resetting database:', error);
    process.exit(1);
  } finally {
    await client.end(); // Close the database connection
  }
}

resetDatabase();
