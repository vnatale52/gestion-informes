import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { Usuario } from '../models/index.js';

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

// Middleware principal para proteger rutas
export const protegerRuta = async (req, res, next) => {
  let token;

  // 1. Verificar si se envía un token y si tiene el formato correcto ("Bearer <token>")
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // 2. Extraer el token de la cabecera
      token = req.headers.authorization.split(' ')[1];

      // 3. Verificar la firma del token
      const decoded = jwt.verify(token, JWT_SECRET);

      // 4. Obtener los datos del usuario desde la BD y adjuntarlos al objeto `req`
      // Excluimos el password del objeto que se adjunta
      req.usuario = await Usuario.findByPk(decoded.id, {
        attributes: { exclude: ['password'] }
      });
      
      // Si el usuario no se encuentra en la BD (p. ej. fue eliminado), denegar acceso
      if (!req.usuario) {
        return res.status(401).json({ message: 'No autorizado, token inválido (usuario no existe).' });
      }

      // 5. Si todo es correcto, continuar con el siguiente middleware o controlador
      return next();

    } catch (error) {
      // Si el token no es válido (expirado, malformado, etc.)
      return res.status(401).json({ message: 'No autorizado, token inválido.' });
    }
  }

  // Si no se envía ningún token
  if (!token) {
    return res.status(401).json({ message: 'No autorizado, no se proporcionó un token.' });
  }
};

// Middleware para autorizar por rol
// Es una función que devuelve otra función (un middleware)
export const autorizar = (...roles) => {
  return (req, res, next) => {
    // Se asume que este middleware se ejecuta DESPUÉS de `protegerRuta`
    // por lo que ya deberíamos tener `req.usuario`
    if (!req.usuario || !roles.includes(req.usuario.rol)) {
      return res.status(403).json({ 
        message: `Acceso denegado. Se requiere uno de los siguientes roles: ${roles.join(', ')}` 
      });
    }
    next();
  };
};