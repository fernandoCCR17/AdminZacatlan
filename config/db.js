import { Sequelize } from "sequelize";

const db = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  dialect: "mariadb",
  dialectOptions: {
    host: process.env.DB_HOST ,
    port: process.env.DB_PORT,
    timestamps: false,
    underscore: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    operatorAlies: false,
  },
});


export default db;