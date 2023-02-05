import Sequelize from "sequelize";
import db from "../config/db.js";
import { hab_img } from "./hab_img.js";

export const Habitacion = db.define("habitaciones",{
    id_hbt: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_cat: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    id_htl: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
  },
  { timestamps: false }
);

Habitacion.hasMany(hab_img, {
  foreignKey: {
    name: "id_hbt",
  },
});

hab_img.belongsTo(Habitacion, {
  foreignKey: {
    name: "id_hbt",
  },
});
