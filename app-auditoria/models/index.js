import sequelize from '../config/database.js';
import Equipo from './Equipo.js';
import Usuario from './Usuario.js';
import Informe from './Informe.js';
import Version from './Version.js';

// 1. Relación Equipo - Usuario (Un equipo tiene muchos usuarios)
Equipo.hasMany(Usuario, { foreignKey: 'equipoId' });
Usuario.belongsTo(Equipo, { foreignKey: 'equipoId' });

// 2. Relación Usuario - Informe (Un usuario puede crear muchos informes)
Usuario.hasMany(Informe, { foreignKey: 'creadorId' });
Informe.belongsTo(Usuario, { as: 'creador', foreignKey: 'creadorId' });

// 3. Relación Equipo - Informe (Un equipo tiene muchos informes)
Equipo.hasMany(Informe, { foreignKey: 'equipoId' });
Informe.belongsTo(Equipo, { foreignKey: 'equipoId' });

// 4. Relación Informe - Version (Un informe tiene muchas versiones)
Informe.hasMany(Version, { foreignKey: 'informeId' });
Version.belongsTo(Informe, { foreignKey: 'informeId' });

// 5. Relación Usuario - Version (Un usuario puede subir muchas versiones)
Usuario.hasMany(Version, { foreignKey: 'usuarioId' });
Version.belongsTo(Usuario, { as: 'autorVersion', foreignKey: 'usuarioId' });

// Exportamos los modelos y la conexión
export {
  sequelize,
  Equipo,
  Usuario,
  Informe,
  Version
};