import Sequelize from "sequelize";
import db from "../config/db.js";
import { Habitacion } from "./Habitacion.js";
import { Hotel_img } from "./Hotel_img.js";

export const Hotel = db.define('hoteles', {
  id_htl:{
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: Sequelize.STRING,
  },
  direccion: {
    type: Sequelize.STRING,
  },
  telefono: {
    type: Sequelize.STRING,
  },
  correo: {
    type: Sequelize.STRING,
  },
  id_grt: {
    type: Sequelize.INTEGER,
    allowNull: true,
  }
},{timestamps:false});

Hotel.hasMany (Habitacion,{
  foreignKey:{
    name: 'id_htl'
  }
});

Habitacion.belongsTo(Hotel, {
  foreignKey: {
    name: "id_htl",
  },
});

Hotel.hasMany(Hotel_img, {
  foreignKey: {
    name: "id_htl",
  },
});

Hotel_img.belongsTo(Hotel, {
  foreignKey: {
    name: "id_htl",
  },
});