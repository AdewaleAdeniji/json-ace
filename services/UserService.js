const users = require("../models/User");

exports.getAllUsers = async () => {
  return await users.find();
};
exports.createUser = async (user) => {
  return await users.create(user);
};
exports.getUserByEmail = async (email) => {
  return await users.findOne({
    email,
  });
};
exports.getUserById = async (userID) => {
  return await users.findOne({
    userID,
  });
};
