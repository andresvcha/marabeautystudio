const { Router } = require('express');
const appointmentsController = require('./appointments.controller');
const { verifyToken } = require('../../middleware/auth.middleware');

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Citas
 *   description: Gestión de citas del salón
 */

/**
 * @swagger
 * /appointments:
 *   get:
 *     summary: Obtener citas de una semana
 *     tags: [Citas]
 *     parameters:
 *       - in: query
 *         name: week
 *         schema:
 *           type: integer
 *           example: 15
 *         description: Número de semana del año (1-52)
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *           example: 2026
 *         description: Año
 *     responses:
 *       200:
 *         description: Lista de citas de la semana indicada.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Appointment'
 */
router.get('/', appointmentsController.getByWeek);

/**
 * @swagger
 * /appointments:
 *   post:
 *     summary: Crear slots de citas disponibles (solo admin)
 *     tags: [Citas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [date, startTime, endTime]
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *                 example: "2026-04-10"
 *               startTime:
 *                 type: string
 *                 example: "09:00"
 *               endTime:
 *                 type: string
 *                 example: "12:00"
 *     responses:
 *       201:
 *         description: Slots creados exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "3 cita(s) creada(s)."
 *                 slots:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Appointment'
 *       400:
 *         description: Datos inválidos o conflicto de horario.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Token no proporcionado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Token inválido o expirado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', verifyToken, appointmentsController.createSlots);

/**
 * @swagger
 * /appointments/{id}:
 *   delete:
 *     summary: Eliminar un slot de cita (solo admin)
 *     tags: [Citas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la cita a eliminar
 *     responses:
 *       200:
 *         description: Cita eliminada correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Cita eliminada correctamente.
 *       400:
 *         description: No se puede eliminar una cita reservada.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Cita no encontrada.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:id', verifyToken, appointmentsController.deleteAppointment);

/**
 * @swagger
 * /appointments/{id}/book:
 *   post:
 *     summary: Reservar una cita (cliente)
 *     tags: [Citas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la cita a reservar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Ana Gómez
 *               email:
 *                 type: string
 *                 format: email
 *                 example: ana@gmail.com
 *     responses:
 *       200:
 *         description: Cita reservada exitosamente. Se envía email de confirmación.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Cita reservada con éxito!"
 *                 appointment:
 *                   $ref: '#/components/schemas/Appointment'
 *       400:
 *         description: Faltan nombre o email.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Cita no encontrada.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: La cita ya no está disponible.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/:id/book', appointmentsController.bookAppointment);

/**
 * @swagger
 * /appointments/{id}/cancel:
 *   post:
 *     summary: Cancelar una cita reservada (cliente)
 *     tags: [Citas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la cita a cancelar
 *     responses:
 *       200:
 *         description: Cita cancelada correctamente. Se envía email de confirmación.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Cita cancelada correctamente.
 *                 appointment:
 *                   $ref: '#/components/schemas/Appointment'
 *       400:
 *         description: La cita no está reservada.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Cita no encontrada.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/:id/cancel', appointmentsController.cancelAppointment);

module.exports = router;
