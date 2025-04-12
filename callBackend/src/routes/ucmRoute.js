// routes/usuariosRoute.js
const express = require('express');
const { handleUCM } = require('../controllers/ucmDriver');

const router = express.Router();

router.post('/', handleUCM);
router.get('/', handleUCM);

module.exports = router;
