const express = require('express');

// const motosCrud = require('./src/routes/motosCrud')
const cors = require('cors')
const { initSqlite } = require('./db');

require('dotenv').config()

const app = express();
app.use(cors())

initSqlite();

app.use(express.static('public'))
app.use(express.json()); // Habilita manejo de JSON


// * Importación de rutas
const usuariosRoute = require('./src/routes/usuariosRoute'); // si lo exportas con `module.exports`

// * Rutas
app.use('/api/usuarios', usuariosRoute);

app.listen(process.env.PORT, () => {
    console.log(`Servidor corriendo en el puerto: ${process.env.PORT}`);
})