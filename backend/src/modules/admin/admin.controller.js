const adminService = require('./admin.service');

async function getStats(req, res, next) {
    try {
        const stats = await adminService.getStats();
        res.json(stats);
    } catch (error) {
        next(error);
    }
}

async function getClients(req, res, next) {
    try {
        const clients = await adminService.getClients();
        res.json(clients);
    } catch (error) {
        next(error);
    }
}

module.exports = { getStats, getClients };
