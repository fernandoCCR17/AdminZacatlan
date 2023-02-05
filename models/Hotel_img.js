import Sequelize from "sequelize";
import db from "../config/db.js";

export const Hotel_img = db.define('hotel_img', {
    id_htl_i:{
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
  },
    id_htl:{
        type: Sequelize.INTEGER,
  },
    img_hotel: {
        type: Sequelize.STRING,
  },
},{timestamps:false,freezeTableName: true,});