import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Equipo = sequelize.define('Equipo', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
});

export default Equipo;