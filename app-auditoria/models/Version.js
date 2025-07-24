import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Version = sequelize.define('Version', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  numeroVersion: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  nombreArchivo: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  pathArchivo: {
    type: DataTypes.STRING,
    allowNull: false, // Ruta en el servidor donde se guarda el archivo
  },
  comentarios: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  // Claves foráneas para informe y usuario (quien subió la versión) se añadirán con las asociaciones
});

export default Version;