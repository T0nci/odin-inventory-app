const { Router } = require("express");
const categoryController = require("../controllers/categoryController");

const categoryRouter = Router();

categoryRouter.get("/", categoryController.getCategories);
categoryRouter.get(
  "/category/:categoryId",
  categoryController.getGamesByCategory,
);
categoryRouter.get("/create", categoryController.getCreateCategory);
categoryRouter.post("/create", categoryController.postCreateCategory);

module.exports = categoryRouter;
