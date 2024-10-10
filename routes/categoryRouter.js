const { Router } = require("express");
const categoryController = require("../controllers/categoryController");

const categoryRouter = Router();

categoryRouter.get("/", categoryController.getCategories);
categoryRouter.get("/:categoryId", categoryController.getGamesByCategory);

module.exports = categoryRouter;
