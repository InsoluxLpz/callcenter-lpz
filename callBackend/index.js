const express = require('express');

// const motosCrud = require('./src/routes/motosCrud')
const cors = require('cors')
const { initSqlite } = require('./db');
const usuariosRoute = require('./src/routes/usuariosRoute');
const ucmRoute = require('./src/routes/ucmRoute') // si lo exportas con `module.exports`

require('dotenv').config()

const app = express();
app.use(cors())

initSqlite();

app.use(express.static('public'))
app.use(express.json()); // Habilita manejo de JSON

// * Rutas
app.use('/api/usuarios', usuariosRoute);
app.use('/api/ucm', ucmRoute);

app.listen(process.env.PORT, () => {
    console.log(`Servidor corriendo en el puerto: ${process.env.PORT}`);
})