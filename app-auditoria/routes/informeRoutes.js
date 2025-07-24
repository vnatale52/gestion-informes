import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

import {
  crearInforme,
  obtenerInformes,
  obtenerInformePorId,
  subirNuevaVersion,
  descargarVersion,
  eliminarInforme
} from '../controllers/informeController.js';
import { protegerRuta, autorizar } from '../middleware/authMiddleware.js';

const router = express.Router();

// --- Configuración de Multer para la subida de archivos ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join('uploads/');
    // Asegurarse de que el directorio de subidas exista
    fs.mkdirSync(uploadPath, { recursive: true }); 
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Crear un nombre de archivo único para evitar colisiones: informeId-timestamp-nombreoriginal.docx
    const informeId = req.params.id;
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `informe-${informeId}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

// Filtro para aceptar solo archivos .docx
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    cb(null, true);
  } else {
    cb(new Error('Formato de archivo no válido. Solo se aceptan archivos .docx'), false);
  }
};

const upload = multer({ storage: storage, fileFilter: fileFilter, limits: { fileSize: 1024 * 1024 * 10 } }); // Límite de 10MB

// --- Definición de Rutas ---

// Todas las rutas aquí están protegidas y requieren un token válido.

// GET /api/informes -> Obtener todos los informes del equipo del usuario
router.get('/', protegerRuta, obtenerInformes);

// POST /api/informes -> Crear un nuevo registro de informe
router.post('/', protegerRuta, autorizar('auditor', 'supervisor', 'revisor'), crearInforme);

// GET /api/informes/:id -> Obtener un informe específico con sus versiones
router.get('/:id', protegerRuta, obtenerInformePorId);

// POST /api/informes/:id/upload -> Subir una nueva versión de un informe
// Se usa upload.single('documento') para indicar que esperamos un único archivo con el nombre de campo 'documento'
router.post('/:id/upload', protegerRuta, upload.single('documento'), subirNuevaVersion);

// GET /api/informes/version/:versionId/download -> Descargar un archivo de una versión específica
router.get('/version/:versionId/download', protegerRuta, descargarVersion);

// DELETE /api/informes/:id -> Eliminar un informe y todos sus archivos/versiones
// La lógica de quién puede borrar está dentro del controlador.
router.delete('/:id', protegerRuta, eliminarInforme);

export default router;
