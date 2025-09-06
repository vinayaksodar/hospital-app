import { db } from "./drizzle";
import { sql } from "drizzle-orm";

async function main() {
  const tables = await db.execute(sql`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE';
  `);

  for (const table of tables.rows) {
    await db.execute(sql.raw(`DROP TABLE IF EXISTS "${table.table_name}" CASCADE;`));
  }

  const types = await db.execute(sql`
    SELECT typname
    FROM pg_type
    WHERE typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    AND typtype = 'e';
  `);

  for (const type of types.rows) {
    await db.execute(sql.raw(`DROP TYPE IF EXISTS "${type.typname}" CASCADE;`));
  }

  console.log("All tables and types dropped!");
}

main();