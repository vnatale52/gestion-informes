import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Informe = sequelize.define('Informe', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  titulo: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  // Claves foráneas para creador y equipo se añadirán con las asociaciones
});

export default Informe;