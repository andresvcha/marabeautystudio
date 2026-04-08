const { db: prisma } = require('../../config');

async function getAllClients() {
    return prisma.client.findMany({
        orderBy: { id: 'desc' },
    });
}

async function getClientById(id) {
    const client = await prisma.client.findUnique({
        where: { id },
        include: {
            appointments: { orderBy: { dateTime: 'desc' } },
        },
    });
    if (!client) throw { status: 404, message: 'Cliente no encontrado.' };
    return client;
}

async function deleteClient(id) {
    const client = await prisma.client.findUnique({ where: { id } });
    if (!client) throw { status: 404, message: 'Cliente no encontrado.' };

    const citaActiva = await prisma.appointment.findFirst({
        where: { clientId: id, state: 'RESERVED', dateTime: { gte: new Date() } },
    });
    if (citaActiva) throw { status: 400, message: 'El cliente tiene citas activas. Cancélalas primero.' };

    return prisma.client.delete({ where: { id } });
}

module.exports = { getClientById, deleteClient };
