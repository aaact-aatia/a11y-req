const express = require('express');
const router = express.Router();

const generator_controller = require('../controllers/generatorController');

router.get('/', generator_controller.wizard_get);

router.post('/:template', generator_controller.download);

module.exports = router;