require("dotenv").parse(".env");

module.exports = {
  // tslint:disable:object-literal-sort-keys
  type: "sqlite",
  /*
  host: process.env.HOST,
  username: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE, //*/
  database: "sqlite.db",
  synchronize: false,
  logging: true,
  entities: ["src/**/**.entity.ts"],
  migrations: ["src/typeorm/migration/**/*.ts"],
  subscribers: ["src/typeorm/subscriber/**/*.ts"],
  cli: {
    entitiesDir: "src/typeorm/entity",
    migrationsDir: "src/typeorm/migration",
    subscribersDir: "src/typeorm/subscriber",
  },
};
