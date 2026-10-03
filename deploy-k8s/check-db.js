const { Pool } = require("pg");
const pool = new Pool({
  connectionString:
    "postgresql://postgres:f8901ad184cec701ca2e3767dec6a033d01ade35593a4f61@localhost:30432/app_db",
});

pool
  .query("SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY 1")
  .then((r) => {
    console.log("TABLES:", r.rows.map((x) => x.tablename).join(", "));
    return pool.end();
  })
  .catch((e) => {
    console.error("ERR", e.message);
    process.exit(1);
  });
