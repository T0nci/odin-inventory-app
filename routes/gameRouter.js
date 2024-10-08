const { Router } = require("express");
const gameController = require("../controllers/gameController");

const gameRouter = Router();

gameRouter.get("/", gameController.getGames);
gameRouter.get("/:id", gameController.getGameById);

module.exports = gameRouter;
