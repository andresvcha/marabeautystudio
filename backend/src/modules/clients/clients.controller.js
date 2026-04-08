const clientsService = require('./clients.service');

async function getAllClients(req, res, next) {
    try {
        const clients = await clientsService.getAllClients();
        res.json(clients);
    } catch (error) {
        next(error);
    }
}

async function getClientById(req, res, next) {
    try {
        const id = parseInt(req.params.id);
        const client = await clientsService.getClientById(id);
        res.json(client);
    } catch (error) {
        next(error);
    }
}

async function deleteClient(req, res, next) {
    try {
        const id = parseInt(req.params.id);
        await clientsService.deleteClient(id);
        res.json({ message: 'Cliente eliminado correctamente.' });
    } catch (error) {
        next(error);
    }
}

module.exports = { getAllClients, getClientById, deleteClient };
