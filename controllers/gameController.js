const db = require("../db/queries");
const CustomError = require("../utils/CustomError");
const links = require("../utils/links");
const asyncHandler = require("express-async-handler");

const getGames = asyncHandler(async (req, res) => {
  const games = await db.getAllGames();
  res.render("games", { links, games });
});

const getGameById = asyncHandler(async (req, res) => {
  let id = null;
  if (
    typeof Number(req.params.id) === "number" &&
    !isNaN(Number(req.params.id))
  )
    id = Number(req.params.id);
  else throw new CustomError("Game Not Found.", 404);

  const game = await db.getGameById(id);
  res.render("game", { links, game });
});

module.exports = {
  getGames,
  getGameById,
};
