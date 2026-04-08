const bcrypt = require('bcryptjs');
const { db: prisma } = require('../../config');

async function getProfile(userId) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, username: true },
    });
    if (!user) throw { status: 404, message: 'Usuario no encontrado.' };
    return user;
}

async function changePassword(userId, currentPassword, newPassword) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw { status: 404, message: 'Usuario no encontrado.' };

    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) throw { status: 401, message: 'Contraseña actual incorrecta.' };

    const hashed = await bcrypt.hash(newPassword, 10);
    return prisma.user.update({
        where: { id: userId },
        data: { password: hashed },
        select: { id: true, username: true },
    });
}

async function createUser(username, password) {
    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) throw { status: 409, message: 'El nombre de usuario ya existe.' };

    const hashed = await bcrypt.hash(password, 10);
    return prisma.user.create({
        data: { username, password: hashed },
        select: { id: true, username: true },
    });
}

module.exports = { getProfile, changePassword, createUser };
