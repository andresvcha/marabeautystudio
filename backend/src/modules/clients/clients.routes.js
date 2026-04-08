const { Router } = require('express');
const clientsController = require('./clients.controller');
const { verifyToken } = require('../../middleware/auth.middleware');

const router = Router();

// Todas las rutas de clientes requieren JWT
router.use(verifyToken);

/**
 * @swagger
 * tags:
 *   name: Clients
 *   description: Gestión de clientes registrados
 */

/**
 * @swagger
 * /clients:
 *   get:
 *     summary: Listar todos los clientes registrados
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de todos los clientes.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Client'
 */
router.get('/', clientsController.getAllClients);

/**
 * @swagger
 * /clients/{id}:
 *   get:
 *     summary: Obtener perfil de un cliente con historial de citas
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del cliente
 *     responses:
 *       200:
 *         description: Datos del cliente con sus citas.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Client'
 *       404:
 *         description: Cliente no encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', clientsController.getClientById);

/**
 * @swagger
 * /clients/{id}:
 *   delete:
 *     summary: Eliminar un cliente
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del cliente a eliminar
 *     responses:
 *       200:
 *         description: Cliente eliminado correctamente.
 *       400:
 *         description: El cliente tiene citas activas.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Cliente no encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:id', clientsController.deleteClient);

module.exports = router;
