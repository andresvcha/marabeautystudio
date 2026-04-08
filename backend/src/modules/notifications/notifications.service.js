const nodemailer = require('nodemailer');
const { env } = require('../../config');

const transporter = nodemailer.createTransport({
    host: env.email.host,
    port: env.email.port,
    secure: false,
    auth: {
        user: env.email.user,
        pass: env.email.pass,
    },
});

const locale = 'es-CO';
const timeZone = 'America/Bogota';

function formatDate(dateTime) {
    return new Date(dateTime).toLocaleString(locale, {
        timeZone,
        dateStyle: 'full',
        timeStyle: 'short',
        hour12: false,
    });
}

async function sendBookingConfirmation(appointment, client) {
    if (!env.email.user) return; // No enviar si el email no está configurado

    const formattedDate = formatDate(appointment.dateTime);
    await transporter.sendMail({
        from: `"Mara Beauty Studio" <${env.email.user}>`,
        to: client.email,
        subject: 'Confirmación de cita - Mara Beauty Studio',
        html: `
            <h2>Hola ${client.name}!</h2>
            <p>Tu cita ha sido confirmada para el <strong>${formattedDate}</strong>.</p>
            <p>Si deseas cancelar, haz clic aquí:
               <a href="${env.frontendUrl}?cancel=${appointment.id}">Cancelar Cita</a>
            </p>
            <br>
            <p>Te esperamos!</p>
            <p><em>Mara Beauty Studio</em></p>
        `,
    });
}

async function sendCancellationConfirmation(appointment, client) {
    if (!env.email.user) return;

    const formattedDate = formatDate(appointment.dateTime);
    await transporter.sendMail({
        from: `"Mara Beauty Studio" <${env.email.user}>`,
        to: client.email,
        subject: 'Cancelación de cita - Mara Beauty Studio',
        html: `
            <h2>Hola ${client.name},</h2>
            <p>Tu cita del <strong>${formattedDate}</strong> ha sido cancelada.</p>
            <p>Puedes agendar una nueva cita en:
               <a href="${env.frontendUrl}">${env.frontendUrl}</a>
            </p>
            <br>
            <p><em>Mara Beauty Studio</em></p>
        `,
    });
}

module.exports = { sendBookingConfirmation, sendCancellationConfirmation };
