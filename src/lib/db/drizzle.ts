import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from "./schema"
export const db = drizzle(process.env.DATABASE_URL!, { schema });

//https://orm.drizzle.team/docs/connect-neon for more configuration options