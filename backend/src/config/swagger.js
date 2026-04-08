const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Mara Beauty Studio API',
            version: '1.0.0',
            description: 'API REST para la gestión de citas del salón Mara Beauty Studio',
        },
        servers: [
            { url: 'http://localhost:3000/api', description: 'Servidor de desarrollo' },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Token JWT obtenido desde /auth/login',
                },
            },
            schemas: {
                Client: {
                    type: 'object',
                    description: 'Persona que ha reservado o reserva citas en el salón.',
                    properties: {
                        id: {
                            type: 'integer',
                            example: 1,
                            description: 'Identificador único del cliente generado automáticamente.',
                        },
                        name: {
                            type: 'string',
                            example: 'Ana Gómez',
                            description: 'Nombre completo del cliente, ingresado al momento de reservar.',
                        },
                        email: {
                            type: 'string',
                            example: 'ana@gmail.com',
                            description: 'Correo electrónico del cliente. Debe ser único en el sistema y se usa para enviar confirmaciones y cancelaciones.',
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Fecha en que el cliente quedó registrado por primera vez en el sistema.',
                        },
                    },
                },
                Appointment: {
                    type: 'object',
                    description: 'Franja horaria del salón que puede estar disponible para reservar o ya reservada por un cliente.',
                    properties: {
                        id: {
                            type: 'integer',
                            example: 3,
                            description: 'Identificador único de la cita generado automáticamente.',
                        },
                        dateTime: {
                            type: 'string',
                            format: 'date-time',
                            example: '2026-04-08T09:00:00.000Z',
                            description: 'Fecha y hora exacta de la cita. Cada slot dura 1 hora y no puede haber dos citas en el mismo horario.',
                        },
                        state: {
                            type: 'string',
                            enum: ['AVAILABLE', 'RESERVED'],
                            example: 'AVAILABLE',
                            description: 'Estado actual de la cita. AVAILABLE significa que está libre para reservar; RESERVED significa que ya tiene un cliente asignado.',
                        },
                        clientId: {
                            type: 'integer',
                            nullable: true,
                            example: null,
                            description: 'ID del cliente que tiene la cita reservada. Es null cuando la cita está disponible.',
                        },
                        client: {
                            nullable: true,
                            allOf: [{ $ref: '#/components/schemas/Client' }],
                            description: 'Datos completos del cliente asignado. Es null cuando la cita está disponible.',
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Fecha en que el administrador creó este slot en el calendario.',
                        },
                        updatedAt: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Última vez que cambió el estado de la cita (al reservar o cancelar).',
                        },
                    },
                },
                User: {
                    type: 'object',
                    description: 'Usuario administrador del salón con acceso al dashboard y gestión de citas.',
                    properties: {
                        id: {
                            type: 'integer',
                            example: 1,
                            description: 'Identificador único del administrador.',
                        },
                        username: {
                            type: 'string',
                            example: 'admin',
                            description: 'Nombre de usuario para iniciar sesión. Debe ser único en el sistema.',
                        },
                    },
                },
                Error: {
                    type: 'object',
                    description: 'Respuesta estándar de error devuelta por la API.',
                    properties: {
                        message: {
                            type: 'string',
                            example: 'Mensaje de error.',
                            description: 'Descripción legible del error ocurrido.',
                        },
                    },
                },
            },
        },
    },
    apis: ['./src/modules/**/*.routes.js'],
};

module.exports = swaggerJsdoc(options);
