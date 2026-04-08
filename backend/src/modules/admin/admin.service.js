const { db: prisma } = require('../../config');

async function getStats() {
    const now = new Date();
    const startOfWeek = new Date(now);
    const day = startOfWeek.getDay();
    startOfWeek.setDate(startOfWeek.getDate() - (day === 0 ? 6 : day - 1));
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 7);

    const [totalClients, weekAppointments] = await Promise.all([
        prisma.client.count(),
        prisma.appointment.findMany({
            where: { dateTime: { gte: startOfWeek, lt: endOfWeek } },
        }),
    ]);

    const reserved  = weekAppointments.filter(a => a.state === 'RESERVED').length;
    const available = weekAppointments.filter(a => a.state === 'AVAILABLE').length;

    return {
        week: {
            total:     weekAppointments.length,
            reserved,
            available,
        },
        totalClients,
    };
}

async function getClients() {
    return prisma.client.findMany({
        orderBy: { id: 'desc' },
        include: {
            appointments: {
                orderBy: { dateTime: 'desc' },
                take: 1,
            },
        },
    });
}

module.exports = { getStats, getClients };
