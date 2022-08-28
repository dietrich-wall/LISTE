const crudControllers = require("../../utils/crud");
const CategoryModel = require("./model.category");

module.exports = {
  crud: crudControllers(CategoryModel),
};
