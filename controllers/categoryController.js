const db = require("../db/queries");
const links = require("../utils/links");
const asyncHandler = require("express-async-handler");

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

module.exports = {
  getCategories,
  getGamesByCategory,
};
