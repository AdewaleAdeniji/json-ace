const data = require("../models/JsonData");

exports.getAllJson = async () => {
  return await data.find();
};

exports.createJSONdata = async (jsondata) => {
  return await data.create(jsondata);
};
exports.getJSONdataById = async (id) => {
  return await data.findOne({
    jsonID: id,
    status: true,
  });
};
exports.getDataByKey = async (key) => {
  return await data.findOne({
    jsonKey: key,
    status: true,
  });
};
exports.getDataByBuckets = async (bucketId) => {
  return await data.findOne({
    bucket: bucketId,
    status: true,
  });
};
exports.getUserJSON = async (userId) => {
  return await data.find({
    userID: userId,
    status: true,
  });
};
exports.getDefaultUserJSON = async (userId) => {
  return await data.find({
    userID: userId,
    bucket: "default",
    status: true,
  });
};
exports.updateJSON = async (json) => {
  return await data.findByIdAndUpdate(json._id, json);
};
