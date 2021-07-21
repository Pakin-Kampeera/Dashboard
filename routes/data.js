const express = require('express');
const { getData, getUsers, changeUserRole } = require('../controllers/data');
const auth = require('../middleware/auth');

const router = express.Router();

router.route('/').get(auth, getData);
router.route('/users').get(auth, getUsers);
router.route('/users').put(auth, changeUserRole);

module.exports = router;
