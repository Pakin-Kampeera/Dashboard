const getData = (req, res, next) => {
  res.status(200).json({ success: true, data: 'You got access to the private data in this route' });
};

const getUsers = (req, res, next) => {};

const getSettings = (req, res, next) => {};

module.exports = { getData, getUsers, getSettings };
