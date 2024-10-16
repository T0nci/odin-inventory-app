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
categoryRouter.get("/update/:id", categoryController.getUpdateCategory);
categoryRouter.post("/update/:id", categoryController.postUpdateCategory);
categoryRouter.post("/delete/:id", categoryController.postDeleteCategory);

module.exports = categoryRouter;
