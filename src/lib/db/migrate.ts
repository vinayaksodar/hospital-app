import { drizzle } from 'drizzle-orm/neon-http';
import { migrate } from 'drizzle-orm/neon-http/migrator';
import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';

config({ path: '.env' });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

async function main() {
  try {
    console.log('Running migrations...');
    await migrate(db, { migrationsFolder: 'src/lib/db/migrations' });
    console.log('Migrations ran successfully');
  } catch (error) {
    console.error('Error running migrations:', error);
    process.exit(1);
  }
}

main();