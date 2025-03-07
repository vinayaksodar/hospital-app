import { config } from "dotenv";
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from "./schema"
config({ path: ".env" }); // or .env.local
export const db = drizzle(process.env.DATABASE_URL!, { schema });

//https://orm.drizzle.team/docs/connect-neon for more configuration options