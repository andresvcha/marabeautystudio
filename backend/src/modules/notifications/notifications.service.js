const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
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
    if (!process.env.EMAIL_USER) return; // No enviar si el email no está configurado

    const formattedDate = formatDate(appointment.dateTime);
    await transporter.sendMail({
        from: `"Mara Beauty Studio" <${process.env.EMAIL_USER}>`,
        to: client.email,
        subject: 'Confirmación de cita - Mara Beauty Studio',
        html: `
            <h2>Hola ${client.name}!</h2>
            <p>Tu cita ha sido confirmada para el <strong>${formattedDate}</strong>.</p>
            <p>Si deseas cancelar, haz clic aquí:
               <a href="${process.env.FRONTEND_URL}?cancel=${appointment.id}">Cancelar Cita</a>
            </p>
            <br>
            <p>Te esperamos!</p>
            <p><em>Mara Beauty Studio</em></p>
        `,
    });
}

async function sendCancellationConfirmation(appointment, client) {
    if (!process.env.EMAIL_USER) return;

    const formattedDate = formatDate(appointment.dateTime);
    await transporter.sendMail({
        from: `"Mara Beauty Studio" <${process.env.EMAIL_USER}>`,
        to: client.email,
        subject: 'Cancelación de cita - Mara Beauty Studio',
        html: `
            <h2>Hola ${client.name},</h2>
            <p>Tu cita del <strong>${formattedDate}</strong> ha sido cancelada.</p>
            <p>Puedes agendar una nueva cita en:
               <a href="${process.env.FRONTEND_URL}">${process.env.FRONTEND_URL}</a>
            </p>
            <br>
            <p><em>Mara Beauty Studio</em></p>
        `,
    });
}

module.exports = { sendBookingConfirmation, sendCancellationConfirmation };
