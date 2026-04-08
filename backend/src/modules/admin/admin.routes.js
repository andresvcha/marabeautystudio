const { Router } = require('express');
const adminController = require('./admin.controller');
const { verifyToken } = require('../../middleware/auth.middleware');

const router = Router();

// Todas las rutas de admin requieren JWT
router.use(verifyToken);

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Operaciones exclusivas del administrador
 */

/**
 * @swagger
 * /admin/stats:
 *   get:
 *     summary: Estadísticas del dashboard
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Resumen de citas de la semana actual y total de clientes.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 week:
 *                   type: object
 *                   properties:
 *                     total:     { type: integer, example: 10 }
 *                     reserved:  { type: integer, example: 6 }
 *                     available: { type: integer, example: 4 }
 *                 totalClients:
 *                   type: integer
 *                   example: 24
 */
router.get('/stats', adminController.getStats);

/**
 * @swagger
 * /admin/clients:
 *   get:
 *     summary: Lista de todos los clientes registrados
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de clientes con su última cita.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Client'
 */
router.get('/clients', adminController.getClients);

module.exports = router;
