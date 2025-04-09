// routes/usuariosRoute.js
const express = require('express');
const { handleUsuarios } = require('../controllers/usuariosDriver');

const router = express.Router();

router.post('/', handleUsuarios);
router.get('/', handleUsuarios);

module.exports = router;
