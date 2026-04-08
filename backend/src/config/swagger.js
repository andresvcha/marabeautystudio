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
                    properties: {
                        id:        { type: 'integer', example: 1 },
                        name:      { type: 'string',  example: 'Ana Gómez' },
                        email:     { type: 'string',  example: 'ana@gmail.com' },
                        createdAt: { type: 'string',  format: 'date-time' },
                    },
                },
                Appointment: {
                    type: 'object',
                    properties: {
                        id:        { type: 'integer', example: 3 },
                        dateTime:  { type: 'string',  format: 'date-time', example: '2026-04-08T09:00:00.000Z' },
                        state:     { type: 'string',  enum: ['AVAILABLE', 'RESERVED'], example: 'AVAILABLE' },
                        clientId:  { type: 'integer', nullable: true, example: null },
                        client:    { nullable: true, allOf: [{ $ref: '#/components/schemas/Client' }] },
                        createdAt: { type: 'string',  format: 'date-time' },
                        updatedAt: { type: 'string',  format: 'date-time' },
                    },
                },
                Error: {
                    type: 'object',
                    properties: {
                        message: { type: 'string', example: 'Mensaje de error.' },
                    },
                },
            },
        },
    },
    apis: ['./src/modules/**/*.routes.js'],
};

module.exports = swaggerJsdoc(options);
