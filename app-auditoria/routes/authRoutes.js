// in app-auditoria/routes/authRoutes.js
import express from 'express';
import { register, login } from '../controllers/authController.js';
// --- ADD THIS TEMPORARY SETUP CODE ---
import { Equipo, Usuario } from '../models/index.js';

const router = express.Router();


// Special one-time setup route. You should protect or remove this later.
router.post('/setup', async (req, res) => {
    try {
        // Check if any team already exists
        const existingTeam = await Equipo.findOne();
        if (existingTeam) {
            return res.status(403).json({ message: 'Setup has already been completed.' });
        }

        // 1. Create the first team
        const nuevoEquipo = await Equipo.create({ nombre: 'Equipo Principal' });

        // 2. Create the first user (e.g., a supervisor)
        const nuevoUsuario = await Usuario.create({
            nombre: 'Admin Supervisor',
            email: 'admin@prod.com',
            password: 'a_very_strong_password_123', // Use a strong password!
            rol: 'supervisor',
            equipoId: nuevoEquipo.id
        });

        res.status(201).json({ 
            message: 'Initial setup complete. Team and Admin user created.',
            equipo: nuevoEquipo,
            usuario: {
                id: nuevoUsuario.id,
                email: nuevoUsuario.email,
                rol: nuevoUsuario.rol
            }
        });

    } catch (error) {
        res.status(500).json({ message: 'Error during initial setup.', error: error.message });
    }
});
// --- END OF TEMPORARY CODE ---



// Existing routes
router.post('/register', register);
router.post('/login', login);

export default router;