import { DataSource } from "typeorm";

let dbConnection: any;

if (process.env.IS_GOOGLE_DEPLOY) {
  // Cloud SQL uses Unix socket
  dbConnection = {
    host: `/cloudsql/${process.env.CLOUD_SQL_INSTANCE}`,
  };
} else {
  // Local development uses TCP
  dbConnection = {
    host: process.env.DB_HOST ?? "localhost",
    port: parseInt(process.env.DB_PORT ?? "5432", 10),
  };
}

export default new DataSource({
  ...dbConnection,
  type: "postgres",
  username: process.env.DB_USERNAME ?? "postgres",
  password: process.env.DB_PASSWORD ?? "postgres",
  database: process.env.DB_NAME ?? "atithi",
  synchronize: false,
  logging: false,
  extra: { max: 10 },
  migrations: ["dist/migrations/*.js"],
  entities: ["dist/**/*.entity.js"],
});
