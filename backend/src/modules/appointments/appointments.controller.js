const appointmentsService = require('./appointments.service');

function getCurrentWeek() {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    return Math.ceil(((now - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7);
}

async function getByWeek(req, res, next) {
    try {
        const year = parseInt(req.query.year) || new Date().getFullYear();
        const week = parseInt(req.query.week) || getCurrentWeek();
        const appointments = await appointmentsService.getAppointmentsByWeek(year, week);
        res.json(appointments);
    } catch (error) {
        next(error);
    }
}

async function createSlots(req, res, next) {
    try {
        const { date, startTime, endTime } = req.body;
        if (!date || !startTime || !endTime) {
            return res.status(400).json({ message: 'Se requiere fecha, hora de inicio y hora de fin.' });
        }
        const slots = await appointmentsService.createSlots(date, startTime, endTime);
        res.status(201).json({ message: `${slots.length} cita(s) creada(s).`, slots });
    } catch (error) {
        next(error);
    }
}

async function deleteAppointment(req, res, next) {
    try {
        const id = parseInt(req.params.id);
        await appointmentsService.deleteAppointment(id);
        res.json({ message: 'Cita eliminada correctamente.' });
    } catch (error) {
        next(error);
    }
}

async function bookAppointment(req, res, next) {
    try {
        const id = parseInt(req.params.id);
        const { name, email } = req.body;
        if (!name || !email) {
            return res.status(400).json({ message: 'Nombre y email son requeridos.' });
        }
        const appointment = await appointmentsService.bookAppointment(id, name, email);
        res.json({ message: 'Cita reservada con éxito!', appointment });
    } catch (error) {
        next(error);
    }
}

async function cancelAppointment(req, res, next) {
    try {
        const id = parseInt(req.params.id);
        const appointment = await appointmentsService.cancelAppointment(id);
        res.json({ message: 'Cita cancelada correctamente.', appointment });
    } catch (error) {
        next(error);
    }
}

module.exports = { getByWeek, createSlots, deleteAppointment, bookAppointment, cancelAppointment };
