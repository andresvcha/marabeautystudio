const { Router } = require('express');
const usersController = require('./users.controller');
const { verifyToken } = require('../../middleware/auth.middleware');

const router = Router();

// Todas las rutas de usuarios requieren JWT
router.use(verifyToken);

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Gestión de usuarios administradores
 */

/**
 * @swagger
 * /users/profile:
 *   get:
 *     summary: Obtener perfil del administrador autenticado
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Datos del usuario autenticado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: Usuario no encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/profile', usersController.getProfile);

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Crear un nuevo usuario administrador
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, password]
 *             properties:
 *               username:
 *                 type: string
 *                 example: julieta
 *               password:
 *                 type: string
 *                 example: clave_segura_123
 *     responses:
 *       201:
 *         description: Usuario creado correctamente.
 *       400:
 *         description: Faltan campos requeridos.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: El nombre de usuario ya existe.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', usersController.createUser);

/**
 * @swagger
 * /users/password:
 *   put:
 *     summary: Cambiar contraseña del administrador autenticado
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword]
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 example: admin123
 *               newPassword:
 *                 type: string
 *                 example: nueva_clave_456
 *     responses:
 *       200:
 *         description: Contraseña actualizada correctamente.
 *       400:
 *         description: Faltan campos requeridos.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Contraseña actual incorrecta.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/password', usersController.changePassword);

module.exports = router;
