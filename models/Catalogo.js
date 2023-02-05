import Sequelize from "sequelize";
import db from "../config/db.js";
import { Habitacion } from "./Habitacion.js";
import { hab_img } from "./hab_img.js";
export const Catalogo = db.define('catalogo',{
    id_cat: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    tipo: {
      type: Sequelize.STRING,
    },
  },{ timestamps: false,freezeTableName: true, }
);

Catalogo.hasOne(Habitacion, {
  foreignKey: {
    name: "id_cat",
  },
});

Habitacion.belongsTo(Catalogo, {
  foreignKey: {
    name: "id_cat",
  },
});

Catalogo.hasOne(hab_img, {
  foreignKey: {
    name: "id_cat",
  },
});

hab_img.belongsTo(Catalogo, {
  foreignKey: {
    name: "id_cat",
  },
});
