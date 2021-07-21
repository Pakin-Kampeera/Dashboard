const user = require('../models/User');

const setup_admin_account = {
    username: 'armpakin',
    email: 'armpakin64@gmail.com',
    password: 'pakin',
    isVerified: 'true',
    role: 'admin'
};

const admin_account = {
    email: 'armpakin64@gmail.com',
    password: 'pakin'
};

const setup_user_account = {
    username: 'bireley',
    email: 'armpakin99@hotmail.com',
    password: 'pakin',
    isVerified: 'true',
    role: 'user'
};

const user_account = {
    email: 'armpakin99@hotmail.com',
    password: 'pakin'
};

const setupAccount = async () => {
    await user.create(setup_admin_account);
    await user.create(setup_user_account);
};

module.exports = {
    setupAccount,
    admin_account,
    user_account
};
