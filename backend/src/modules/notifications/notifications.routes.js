const express = require('express');
const router = express.Router();
const { db: prisma } = require('../../config');
const notificationsService = require('./notifications.service');
const { verifyToken } = require('../../middleware/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: Reenvío manual de correos electrónicos
 */

/**
 * @swagger
 * /notifications/confirmation/{id}:
 *   post:
 *     summary: Reenviar correo de confirmación de una cita reservada
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la cita
 *     responses:
 *       200:
 *         description: Correo reenviado correctamente.
 *       404:
 *         description: Cita no encontrada o sin cliente asignado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/confirmation/:id', verifyToken, async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        const appointment = await prisma.appointment.findUnique({
            where: { id },
            include: { client: true },
        });
        if (!appointment || !appointment.client) {
            return res.status(404).json({ message: 'Cita no encontrada o sin cliente asignado.' });
        }
        await notificationsService.sendBookingConfirmation(appointment, appointment.client);
        res.json({ message: 'Correo de confirmación reenviado correctamente.' });
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /notifications/cancellation/{id}:
 *   post:
 *     summary: Reenviar correo de cancelación de una cita
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la cita
 *     responses:
 *       200:
 *         description: Correo de cancelación reenviado correctamente.
 *       404:
 *         description: Cita no encontrada o sin cliente asignado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/cancellation/:id', verifyToken, async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        const appointment = await prisma.appointment.findUnique({
            where: { id },
            include: { client: true },
        });
        if (!appointment || !appointment.client) {
            return res.status(404).json({ message: 'Cita no encontrada o sin cliente asignado.' });
        }
        await notificationsService.sendCancellationConfirmation(appointment, appointment.client);
        res.json({ message: 'Correo de cancelación reenviado correctamente.' });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
