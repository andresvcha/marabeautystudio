const prisma = require('../../config/db');
const notificationsService = require('../notifications/notifications.service');

// Helper: replica la lógica del frontend para calcular el inicio de semana
function getDateForWeek(year, week) {
    const d = new Date(year, 0, 1);
    const day = d.getDay();
    d.setDate(d.getDate() - day + (day === 0 ? -6 : 1) + (week - 1) * 7);
    d.setHours(0, 0, 0, 0);
    return d;
}

async function getAppointmentsByWeek(year, week) {
    const startOfWeek = getDateForWeek(year, week);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 7);

    return prisma.appointment.findMany({
        where: {
            dateTime: { gte: startOfWeek, lt: endOfWeek },
        },
        include: { client: true },
        orderBy: { dateTime: 'asc' },
    });
}

async function createSlots(date, startTime, endTime) {
    const startDateTime = new Date(`${date}T${startTime}`);
    const endDateTime = new Date(`${date}T${endTime}`);

    if (startDateTime >= endDateTime) {
        throw { status: 400, message: 'La hora de inicio debe ser antes de la hora de fin.' };
    }

    const created = [];
    for (let d = new Date(startDateTime); d < endDateTime; d.setHours(d.getHours() + 1)) {
        const slotDateTime = new Date(d);
        const existing = await prisma.appointment.findFirst({ where: { dateTime: slotDateTime } });
        if (!existing) {
            const slot = await prisma.appointment.create({
                data: { dateTime: slotDateTime, state: 'AVAILABLE' },
            });
            created.push(slot);
        }
    }

    return created;
}

async function deleteAppointment(id) {
    const appointment = await prisma.appointment.findUnique({ where: { id } });
    if (!appointment) throw { status: 404, message: 'Cita no encontrada.' };
    if (appointment.state === 'RESERVED') throw { status: 400, message: 'No se puede eliminar una cita reservada.' };

    return prisma.appointment.delete({ where: { id } });
}

async function bookAppointment(id, clientName, clientEmail) {
    const appointment = await prisma.appointment.findUnique({ where: { id } });
    if (!appointment) throw { status: 404, message: 'Cita no encontrada.' };
    if (appointment.state !== 'AVAILABLE') throw { status: 409, message: 'La cita ya no está disponible.' };

    // Buscar o crear el cliente
    let client = await prisma.client.findUnique({ where: { email: clientEmail } });
    if (!client) {
        client = await prisma.client.create({ data: { name: clientName, email: clientEmail } });
    }

    const updated = await prisma.appointment.update({
        where: { id },
        data: { state: 'RESERVED', clientId: client.id },
        include: { client: true },
    });

    // Email no bloqueante: si falla, la cita ya fue guardada igualmente
    notificationsService.sendBookingConfirmation(updated, client).catch(err =>
        console.error('[Email] Error al enviar confirmación de reserva:', err.message)
    );

    return updated;
}

async function cancelAppointment(id) {
    const appointment = await prisma.appointment.findUnique({
        where: { id },
        include: { client: true },
    });
    if (!appointment) throw { status: 404, message: 'Cita no encontrada.' };
    if (appointment.state !== 'RESERVED') throw { status: 400, message: 'La cita no está reservada.' };

    const client = appointment.client;

    const updated = await prisma.appointment.update({
        where: { id },
        data: { state: 'AVAILABLE', clientId: null },
        include: { client: true },
    });

    // Email no bloqueante: si falla, la cancelación ya fue guardada igualmente
    if (client) {
        notificationsService.sendCancellationConfirmation(appointment, client).catch(err =>
            console.error('[Email] Error al enviar confirmación de cancelación:', err.message)
        );
    }

    return updated;
}

module.exports = { getAppointmentsByWeek, createSlots, deleteAppointment, bookAppointment, cancelAppointment };
