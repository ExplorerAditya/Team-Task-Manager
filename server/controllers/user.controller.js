const User = require('../models/User');

// List all users (used for member search/assignee dropdowns by authenticated users)
exports.list = async (req, res, next) => {
  try {
    const { search } = req.query;
    const filter = {};
    if (search) {
      const regex = new RegExp(search, 'i');
      filter.$or = [{ name: regex }, { email: regex }];
    }
    const users = await User.find(filter)
      .select('name email role')
      .sort({ name: 1 })
      .limit(50);
    res.json(users);
  } catch (err) {
    next(err);
  }
};
