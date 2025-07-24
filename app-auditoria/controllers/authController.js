import { Usuario, Equipo } from '../models/index.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

// --- Función de Registro de Usuario ---
export const register = async (req, res) => {
  try {
    const { nombre, email, password, rol, equipoId } = req.body;

    // Validación básica de entrada
    if (!nombre || !email || !password || !rol || !equipoId) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
    }

    // Verificar si el equipo existe
    const equipo = await Equipo.findByPk(equipoId);
    if (!equipo) {
      return res.status(404).json({ message: 'El equipo especificado no existe.' });
    }

    // Verificar si el email ya está en uso
    const usuarioExistente = await Usuario.findOne({ where: { email } });
    if (usuarioExistente) {
      return res.status(409).json({ message: 'El correo electrónico ya está registrado.' });
    }

    // Crear el nuevo usuario (la contraseña se hashea automáticamente gracias al hook en el modelo)
    const nuevoUsuario = await Usuario.create({
      nombre,
      email,
      password,
      rol,
      equipoId,
    });

    res.status(201).json({
      message: 'Usuario registrado exitosamente.',
      usuario: {
        id: nuevoUsuario.id,
        nombre: nuevoUsuario.nombre,
        email: nuevoUsuario.email,
        rol: nuevoUsuario.rol,
        equipoId: nuevoUsuario.equipoId,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor al registrar el usuario.', error: error.message });
  }
};

// --- Función de Inicio de Sesión ---
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validación de entrada
    if (!email || !password) {
      return res.status(400).json({ message: 'El email y la contraseña son obligatorios.' });
    }

    // Buscar al usuario por su email
    const usuario = await Usuario.findOne({ where: { email } });
    if (!usuario) {
      return res.status(401).json({ message: 'Credenciales inválidas.' }); // Mensaje genérico por seguridad
    }

    // Validar la contraseña usando el método que definimos en el modelo
    const passwordValido = await usuario.validarPassword(password);
    if (!passwordValido) {
      return res.status(401).json({ message: 'Credenciales inválidas.' });
    }

    // Si las credenciales son correctas, generar un Token JWT
    const payload = {
      id: usuario.id,
      rol: usuario.rol,
      equipoId: usuario.equipoId,
    };

    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: '1h', // El token expirará en 1 hora
    });

    res.status(200).json({
      message: 'Inicio de sesión exitoso.',
      token: token,
    });

  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor al iniciar sesión.', error: error.message });
  }
};