// routes/usuariosRoute.js
const express = require('express');
const { obtenerLista, agregarLista, actualizarLista, eliminarLista } = require('../controllers/listasDriver');
const router = express.Router();

router.post('/', agregarLista);
router.get('/:id', obtenerLista);
router.get('/', obtenerLista);
router.put('/:id', actualizarLista);
router.delete('/:id', eliminarLista);

module.exports = router;
