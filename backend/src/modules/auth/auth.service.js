const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { env, db: prisma } = require('../../config');

async function login(username, password) {
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
        throw { status: 401, message: 'Credenciales incorrectas.' };
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
        throw { status: 401, message: 'Credenciales incorrectas.' };
    }

    const token = jwt.sign(
        { id: user.id, username: user.username },
        env.jwt.secret,
        { expiresIn: env.jwt.expiresIn }
    );

    return {
        token,
        user: { id: user.id, username: user.username },
    };
}

module.exports = { login };
