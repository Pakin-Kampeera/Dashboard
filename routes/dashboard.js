const express = require('express');

const router = express.Router();

const getData = require('../controllers/data');

const auth = require('../middleware/auth');

router.route('/dashboard').get(auth, getData)

module.exports = router;
