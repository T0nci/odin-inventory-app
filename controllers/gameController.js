const db = require("../db/queries");
const links = require("../utils/links");
const asyncHandler = require("express-async-handler");

const getGames = asyncHandler(async (req, res) => {
  const games = await db.getAllGames();
  res.render("games", { links, games });
});

module.exports = {
  getGames,
};
