const db = require("../db/queries");
const links = require("../utils/links");
const asyncHandler = require("express-async-handler");

const getCategories = asyncHandler(async (req, res) => {
  const categories = await db.getAllCategories();
  res.render("categories", { links, categories });
});

const getGamesByCategory = asyncHandler(async (req, res) => {
  res.send("It twerks!");
});

module.exports = {
  getCategories,
  getGamesByCategory,
};
