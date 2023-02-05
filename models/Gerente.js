import Sequelize from "sequelize";
import db from "../config/db.js";
import { Hotel } from "./Hotel.js";

export const Gerente = db.define('gerentes', {
  id_grt: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: Sequelize.STRING,
  },
  apellido_paterno: {
    type: Sequelize.STRING,
  },
  apellido_materno: {
    type: Sequelize.STRING,
  },
  telefono: {
    type: Sequelize.STRING,
  },
  img_gerente: {
    type: Sequelize.STRING,
  },
},{timestamps:false});
Gerente.hasOne(Hotel, {
  foreignKey: {
    name: "id_grt",
  },
});

Hotel.belongsTo(Gerente, {
  foreignKey: {
    name: "id_grt",
  },
});







