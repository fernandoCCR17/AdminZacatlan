import Sequelize from "sequelize";
import db from "../config/db.js";

export const hab_img = db.define('hab_img', {
    id_hab_img: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true 
    },
    id_hbt: {
        type: Sequelize.INTEGER,
        allowNull: true,
    },
    id_cat: {
        type: Sequelize.INTEGER,
        allowNull: true,
    },
    habImg: {
        type: Sequelize.STRING,
        allowNull: true,
    },
}, { timestamps: false,freezeTableName: true, });