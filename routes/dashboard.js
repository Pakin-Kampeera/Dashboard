const express = require('express');

const router = express.Router();

const { getData, getUsers, getSettings } = require('../controllers/data');

const auth = require('../middleware/auth');

router.route('/dashboard').get(auth, getData);

router.route('/users').get(auth, getUsers);

router.route('/settings').get(auth, getSettings);

module.exports = router;
