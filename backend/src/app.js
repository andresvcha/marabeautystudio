const express = require('express');
const cors = require('cors');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const { env, swaggerSpec } = require('./config');
const authRoutes = require('./modules/auth/auth.routes');
const appointmentRoutes = require('./modules/appointments/appointments.routes');
const notificationRoutes = require('./modules/notifications/notifications.routes');
const adminRoutes = require('./modules/admin/admin.routes');
const clientsRoutes = require('./modules/clients/clients.routes');
const usersRoutes = require('./modules/users/users.routes');
const healthRoutes = require('./modules/health/health.routes');
const errorMiddleware = require('./middleware/error.middleware');

const app = express();

app.use(cors({ origin: env.frontendUrl }));
app.use(express.json());

// Documentación Swagger
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/clients', clientsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/health', healthRoutes);

// Servir el frontend estático
const frontendPath = path.join(__dirname, '../../frontend');
app.use(express.static(frontendPath));

// Manejador de errores (siempre al final)
app.use(errorMiddleware);

module.exports = app;
