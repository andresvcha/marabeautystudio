const usersService = require('./users.service');

async function getProfile(req, res, next) {
    try {
        const user = await usersService.getProfile(req.user.id);
        res.json(user);
    } catch (error) {
        next(error);
    }
}

async function changePassword(req, res, next) {
    try {
        const userId = req.user.id;
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Se requiere la contraseña actual y la nueva.' });
        }
        const user = await usersService.changePassword(userId, currentPassword, newPassword);
        res.json({ message: 'Contraseña actualizada correctamente.', user });
    } catch (error) {
        next(error);
    }
}

async function createUser(req, res, next) {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: 'Se requiere nombre de usuario y contraseña.' });
        }
        const user = await usersService.createUser(username, password);
        res.status(201).json({ message: 'Usuario creado correctamente.', user });
    } catch (error) {
        next(error);
    }
}

module.exports = { getProfile, changePassword, createUser };
