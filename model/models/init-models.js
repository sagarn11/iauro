var DataTypes = require("sequelize").DataTypes;
var _products = require("./products");
var _user = require("./user");

function initModels(sequelize) {
  var products = _products(sequelize, DataTypes);
  var user = _user(sequelize, DataTypes);


  return {
    products,
    user,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
