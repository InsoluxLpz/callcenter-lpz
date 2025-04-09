const express = require('express');
const { dbConexion } = require('./src/database/config');
const motosCrud = require('./src/routes/motosCrud')
const productosCrud = require('./src/routes/productosCrud')
const servicios = require('./src/routes/servicios')
const proveedoresCrud = require('./src/routes/proveedoresCrud')
const entradaProductosCrud = require('./src/routes/entradaProductosCrud')
const cors = require('cors')
require('dotenv').config()

const app = express();
app.use(cors())

dbConexion()

app.use(express.static('public'))
app.use(express.json()); // Habilita manejo de JSON
app.use('/', motosCrud);
app.use('/productos', productosCrud);
app.use('/servicios', servicios);
app.use('/proveedores', proveedoresCrud);
app.use('/entrada', entradaProductosCrud);


app.listen(process.env.PORT, () => {
    console.log(`Servidor corriendo en el puerto: ${process.env.PORT}`);
})