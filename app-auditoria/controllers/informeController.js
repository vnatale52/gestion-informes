import { Informe, Version, Usuario } from '../models/index.js';
import fs from 'fs';

/**
 * Crea un nuevo registro de informe en la base de datos.
 * El usuario que crea el informe se obtiene del token de autenticación.
 */
export const crearInforme = async (req, res) => {
  try {
    const { titulo, descripcion } = req.body;
    // req.usuario es añadido por el middleware 'protegerRuta'
    const creadorId = req.usuario.id;
    const equipoId = req.usuario.equipoId;

    if (!titulo) {
      return res.status(400).json({ message: 'El título del informe es obligatorio.' });
    }

    const nuevoInforme = await Informe.create({
      titulo,
      descripcion,
      creadorId,
      equipoId,
    });

    res.status(201).json(nuevoInforme);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear el informe.', error: error.message });
  }
};

/**
 * Obtiene todos los informes que pertenecen al equipo del usuario autenticado.
 */
export const obtenerInformes = async (req, res) => {
  try {
    const equipoId = req.usuario.equipoId;
    const informes = await Informe.findAll({
      where: { equipoId },
      include: [
        { model: Usuario, as: 'creador', attributes: ['id', 'nombre', 'rol'] },
      ],
      order: [['createdAt', 'DESC']], // Muestra los informes más recientes primero
    });
    res.status(200).json(informes);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los informes.', error: error.message });
  }
};

/**
 * Obtiene un informe específico por su ID, incluyendo su historial de versiones.
 * Esta función asegura que las versiones se envíen en orden descendente.
 */
export const obtenerInformePorId = async (req, res) => {
  try {
    const { id } = req.params;
    const equipoId = req.usuario.equipoId;

    const informe = await Informe.findOne({
      where: { id, equipoId }, // Solo permite ver informes del mismo equipo
      include: [
        { model: Usuario, as: 'creador', attributes: ['id', 'nombre'] },
        {
          model: Version,
          include: [{ model: Usuario, as: 'autorVersion', attributes: ['id', 'nombre'] }],
        },
      ],
    });

    if (!informe) {
      return res.status(404).json({ message: 'Informe no encontrado o no pertenece a su equipo.' });
    }

    // --- SOLUCIÓN DEFINITIVA PARA LA ORDENACIÓN ---
    // 1. Convierte la instancia de Sequelize a un objeto JavaScript simple
    const informePlano = informe.get({ plain: true });

    // 2. Ordena manualmente el array de Versiones dentro del objeto simple
    if (informePlano.Versions && informePlano.Versions.length > 0) {
      informePlano.Versions.sort((a, b) => b.numeroVersion - a.numeroVersion);
    }
    
    // 3. Envía el objeto simple y ya ordenado como respuesta.
    res.status(200).json(informePlano);

  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el informe.', error: error.message });
  }
};

/**
 * Sube un archivo .docx como una nueva versión de un informe existente.
 */
export const subirNuevaVersion = async (req, res) => {
  try {
    const { id } = req.params; // ID del informe
    const { comentarios } = req.body;
    const usuarioId = req.usuario.id;
    const equipoId = req.usuario.equipoId;

    if (!req.file) {
      return res.status(400).json({ message: 'No se ha subido ningún archivo.' });
    }

    const informe = await Informe.findOne({ where: { id, equipoId } });

    // Si el informe no existe o no pertenece al equipo, se borra el archivo subido para no dejar basura.
    if (!informe) {
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ message: 'Informe no encontrado o no pertenece a su equipo.' });
    }
    
    // Calcula el nuevo número de versión
    const ultimaVersion = await Version.findOne({
      where: { informeId: id },
      order: [['numeroVersion', 'DESC']],
    });

    const nuevoNumeroVersion = ultimaVersion ? ultimaVersion.numeroVersion + 1 : 1;
    
    // Crea el registro de la nueva versión en la base de datos
    const nuevaVersion = await Version.create({
      informeId: id,
      usuarioId,
      numeroVersion: nuevoNumeroVersion,
      comentarios,
      nombreArchivo: req.file.originalname,
      pathArchivo: req.file.path,
    });

    res.status(201).json({ message: 'Nueva versión subida con éxito.', version: nuevaVersion });

  } catch (error) {
    // Si ocurre un error durante el proceso, se borra el archivo que se pudo haber subido.
    if (req.file) {
        fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: 'Error al subir la nueva versión.', error: error.message });
  }
};

/**
 * Permite la descarga de un archivo físico de una versión específica.
 */
export const descargarVersion = async (req, res) => {
    try {
        const { versionId } = req.params;
        const equipoId = req.usuario.equipoId;

        const version = await Version.findByPk(versionId, {
            include: { model: Informe, attributes: ['equipoId'] }
        });

        if (!version) {
            return res.status(404).json({ message: 'Versión no encontrada.' });
        }
        if (version.Informe.equipoId !== equipoId) {
            return res.status(403).json({ message: 'No tiene permiso para descargar este archivo.' });
        }
        
        // Comprobar si el archivo existe físicamente antes de intentar enviarlo
        if (!fs.existsSync(version.pathArchivo)) {
            return res.status(404).json({ message: 'El archivo físico no se encuentra en el servidor. Puede haber sido eliminado.' });
        }

        // Envía el archivo para su descarga, usando el nombre original del archivo.
        res.download(version.pathArchivo, version.nombreArchivo);

    } catch (error) {
        res.status(500).json({ message: 'Error al procesar la descarga.', error: error.message });
    }
};

/**
 * Elimina un informe, todas sus versiones en la base de datos y todos sus archivos físicos.
 */
export const eliminarInforme = async (req, res) => {
    try {
        const { id } = req.params;
        const usuario = req.usuario;

        const informe = await Informe.findOne({
            where: { id, equipoId: usuario.equipoId },
            include: [Version] // Incluir las versiones para poder borrar sus archivos
        });

        if (!informe) {
            return res.status(404).json({ message: 'Informe no encontrado o no pertenece a su equipo.' });
        }

        // Lógica de autorización: solo el creador original o roles superiores pueden borrar.
        const esCreador = informe.creadorId === usuario.id;
        const esAdmin = ['supervisor', 'revisor'].includes(usuario.rol);

        if (!esCreador && !esAdmin) {
            return res.status(403).json({ message: 'No tiene permisos para eliminar este informe.' });
        }
        
        // Borrar archivos físicos de todas las versiones asociadas
        for (const version of informe.Versions) {
            if (fs.existsSync(version.pathArchivo)) {
                fs.unlinkSync(version.pathArchivo);
            }
        }
        
        // Borrar el informe de la base de datos.
        // Si las relaciones se definieron con 'onDelete: CASCADE', las versiones se borrarían automáticamente.
        // Por seguridad, lo hacemos manualmente.
        await Version.destroy({ where: { informeId: id } });
        await informe.destroy();

        res.status(200).json({ message: 'Informe y todas sus versiones eliminados con éxito.' });

    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar el informe.', error: error.message });
    }
};