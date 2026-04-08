require('dotenv').config();
const app = require('./src/app');
const { env } = require('./src/config');

app.listen(env.port, () => {
    console.log(`Mara Beauty Studio API corriendo en http://localhost:${env.port}`);
    console.log(`Modo: ${env.nodeEnv}`);
});
