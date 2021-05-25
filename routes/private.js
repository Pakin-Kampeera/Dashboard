const express = require('express');
const router = express.Router();
const { getPrivateData } = require('../controllers/private');
const auth = require('../middleware/auth');

router.route('/').get(auth, getPrivateData);

module.exports = router;
