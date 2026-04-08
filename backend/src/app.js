const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const authRoutes = require('./modules/auth/auth.routes');
const appointmentRoutes = require('./modules/appointments/appointments.routes');
const errorMiddleware = require('./middleware/error.middleware');

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json());

// Documentación Swagger
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Mara Beauty Studio API activa' });
});

// Manejador de errores (siempre al final)
app.use(errorMiddleware);

module.exports = app;
