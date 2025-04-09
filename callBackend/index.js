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
// app.use('/', motosCrud);

app.listen(process.env.PORT, () => {
    console.log(`Servidor corriendo en el puerto: ${process.env.PORT}`);
})