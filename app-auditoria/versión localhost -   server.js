import express from 'express';
import cors from 'cors'; // Importar cors
import dotenv from 'dotenv';

// Se importa 'sequelize' desde el archivo de índice de modelos, 
// que ya se ha encargado de cargar todos los modelos y sus asociaciones.
import { sequelize } from './models/index.js'; 

// Se importan los enrutadores que definiremos en los siguientes pasos.
import authRoutes from './routes/authRoutes.js';
import informeRoutes from './routes/informeRoutes.js';

// Carga las variables de entorno desde el archivo .env
dotenv.config();

// Creación de la instancia de la aplicación Express
const app = express();

// Middlewares globales

app.use(cors()); // Permite todas las peticiones CORS.
// Permite a Express parsear cuerpos de solicitud en formato JSON
app.use(express.json()); 
// Permite a Express parsear cuerpos de solicitud codificados en URL (formularios)
app.use(express.urlencoded({ extended: true })); 

// --- Rutas de la API ---

// Una ruta de bienvenida para verificar que el servidor está funcionando
app.get('/', (req, res) => {
  res.json({ message: 'Bienvenido a la API de Gestión de Auditorías.' });
});

// Se montan los enrutadores en sus rutas base correspondientes.
// Todas las rutas relacionadas con la autenticación comenzarán con /api/auth
app.use('/api/auth', authRoutes);
// Todas las rutas relacionadas con los informes comenzarán con /api/informes
app.use('/api/informes', informeRoutes);


// --- Conexión a la base de datos y arranque del servidor ---

// Se obtiene el puerto del entorno, con un valor por defecto de 3000
const PORT = process.env.PORT || 3000;

// `sequelize.sync()` verifica el estado actual de la base de datos y las tablas.
// Basado en los modelos definidos, crea las tablas si no existen.
// `force: false` (opción por defecto y segura): No elimina las tablas si ya existen.
// En desarrollo, puedes usar `{ alter: true }` para que Sequelize intente modificar las tablas existentes
// para que coincidan con la definición del modelo. `{ force: true }` eliminaría y recrearía las tablas, perdiendo todos los datos.
sequelize.sync({ force: false }) 
  .then(() => {
    console.log('Base de datos y tablas sincronizadas correctamente.');
    // Solo si la conexión con la BD es exitosa, el servidor comienza a escuchar peticiones.
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en el puerto ${PORT}`);
    });
  })
  .catch(err => {
    // Si la conexión falla, se muestra un error detallado en la consola.
    console.error('No se pudo conectar o sincronizar la base de datos:', err);
  });
  