const db = require("../db/queries");
const CustomError = require("../utils/CustomError");
const { formatRelations } = require("../utils/helpers");
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

const getCreateGame = asyncHandler(async (req, res) => {
  const types = formatRelations(await db.getAllCategories());

  res.render("gameForm", {
    action: "Create",
    href: "/games/create",
    links,
    types,
  });
});

module.exports = {
  getGames,
  getGameById,
  getCreateGame,
};
