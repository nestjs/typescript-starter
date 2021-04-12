const {
  ORIGIN,
  BASE_URL,
  DB_HOST,
  DB_PASSWORD,
  DB_USER,
  DB_NAME,
  DB_PORT,
  DB_TYPE,
} = process.env;

const environment = {
  api: {
    origin: ORIGIN,
    base: BASE_URL,
  },
  db: {
    database: DB_NAME,
    host: DB_HOST,
    port: DB_PORT,
    username: DB_USER,
    password: DB_PASSWORD,
    type: DB_TYPE,
  },
};

export { environment };
