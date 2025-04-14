const express = require('express');

// const motosCrud = require('./src/routes/motosCrud')
const cors = require('cors')
const { initSqlite } = require('./db');
const usuariosRoute = require('./src/routes/usuariosRoute');
const ucmRoute = require('./src/routes/ucmRoute')
const listasRoute = require('./src/routes/listasRoute')

require('dotenv').config()

const app = express();
app.use(cors())

initSqlite();

app.use(express.static('public'))
app.use(express.json());

// * Rutas
app.use('/api/usuarios', usuariosRoute);
app.use('/api/ucm', ucmRoute);
app.use('/api/listas', listasRoute);

app.listen(process.env.PORT, () => {
    console.log(`Servidor corriendo en el puerto: ${process.env.PORT}`);
})