const { Router } = require("express");
const gameController = require("../controllers/gameController");

const gameRouter = Router();

gameRouter.get("/", gameController.getGames);
gameRouter.get("/game/:id", gameController.getGameById);
gameRouter.get("/create", gameController.getCreateGame);
gameRouter.post("/create", gameController.postCreateGame);
gameRouter.get("/update/:id", gameController.getUpdateGame);
gameRouter.post("/update/:id", gameController.postUpdateGame);

module.exports = gameRouter;
