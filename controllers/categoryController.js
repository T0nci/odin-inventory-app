const db = require("../db/queries");
const CustomError = require("../utils/CustomError");
const links = require("../utils/links");
const asyncHandler = require("express-async-handler");
const { body, validationResult, param } = require("express-validator");

const validateCreateCategory = () => [
  body("categoryName")
    .custom((str) => /^[a-zA-Z0-9.-]+$/.test(str))
    .withMessage(
      "Category name must contain only alphanumerical characters, '.' and '-'.",
    )
    .isLength({ min: 1, max: 30 })
    .withMessage("Category name must contain between 1 and 30 characters"),
  body("typeId")
    .custom(async (id) => {
      const ids = await db.getAllTypesOfCategories();

      if (ids.find((row) => row.id === Number(id)) === undefined) throw false;
    })
    .withMessage("Invalid type."),
  body("password")
    .custom((password) => password === process.env.ADMIN_PASSWORD)
    .withMessage("Incorrect password."),
];

const validateParams = () =>
  param("id")
    .isInt()
    .withMessage("ID must be a number.")
    .custom(async (id) => {
      const category = await db.getCategoryById(Number(id));

      if (category === undefined) throw false;
    })
    .withMessage("Category not found.");

const getCategories = asyncHandler(async (req, res) => {
  const categories = await db.getAllCategories();
  res.render("categories", { links, categories });
});

const getGamesByCategory = asyncHandler(async (req, res) => {
  const games = await db.getGamesByCategoryId(Number(req.params.categoryId));

  // No need for checking if the id is good since the query above checks it
  const category = await db.getCategoryById(Number(req.params.categoryId));

  res.render("games", { links, games, filter: category });
});

const getCreateCategory = asyncHandler(async (req, res) => {
  const types = await db.getAllTypesOfCategories();
  res.render("categoryForm", {
    action: "Create",
    href: "create",
    links,
    types,
  });
});

const postCreateCategory = [
  validateCreateCategory(),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const types = await db.getAllTypesOfCategories();

      return res.status(400).render("categoryForm", {
        action: "Create",
        href: "create",
        links,
        types,
        errors: errors.array(),
      });
    }

    await db.createCategory(req.body.categoryName, req.body.typeId);
    res.redirect("/categories");
  }),
];

const getUpdateCategory = [
  validateParams(),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new CustomError(errors.array()[0].msg, 400);

    const types = await db.getAllTypesOfCategories();
    const category = await db.getCategoryById(req.params.id);

    types.find((row) => row.type === category.type).checked = true;

    res.render("categoryForm", {
      action: "Update",
      href: `update/${req.params.id}`,
      links,
      types,
      categoryName: category.category,
    });
  }),
];

const postUpdateCategory = [
  validateParams(),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new CustomError(errors.array()[0].msg, 400);

    next();
  }),
  validateCreateCategory(),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const types = await db.getAllTypesOfCategories();
      const category = await db.getCategoryById(req.params.id);

      types.find((row) => row.type === category.type).checked = true;

      res.status(400).render("categoryForm", {
        action: "Update",
        href: `update/${req.params.id}`,
        links,
        types,
        categoryName: category.category,
        errors: errors.array(),
      });
    }

    await db.updateCategory(
      req.body.categoryName,
      req.body.typeId,
      Number(req.params.id),
    );
    res.redirect("/categories");
  }),
];

module.exports = {
  getCategories,
  getGamesByCategory,
  getCreateCategory,
  postCreateCategory,
  getUpdateCategory,
  postUpdateCategory,
};
