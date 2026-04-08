const { Router } = require('express');

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Health
 *   description: Estado del servidor
 */

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Verificar que la API está activa
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API funcionando correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: OK
 *                 message:
 *                   type: string
 *                   example: Mara Beauty Studio API activa
 */
router.get('/', (req, res) => {
    res.json({ status: 'OK', message: 'Mara Beauty Studio API activa' });
});

module.exports = router;
