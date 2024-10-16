const db = require("../db/queries");
const CustomError = require("../utils/CustomError");
const { formatRelations } = require("../utils/helpers");
const links = require("../utils/links");
const asyncHandler = require("express-async-handler");
const { body, validationResult, param } = require("express-validator");

const validateGameBody = () => [
  body("game")
    .trim()
    .custom((str) => /^[a-zA-Z0-9- .]+$/.test(str))
    .withMessage(
      "Game name must contain only alphanumerical characters, '.' and '-'.",
    )
    .isLength({ min: 1, max: 30 })
    .withMessage("Game name must contain between 1 and 30 characters."),
  body("price")
    .trim()
    .custom((num) => /^\d{1,3}(\.\d{1,2})?$/.test(num))
    .withMessage("Price must be a number between 0.01 and 999.99."),
  body("releaseDate")
    .isDate()
    .withMessage("Release date must be a date.")
    .isBefore(
      `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate()}`,
    )
    .withMessage("Release date must be a date before tomorrow."),
  body("about")
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage("Game name must contain between 1 and 255 characters."),
  body("genres")
    .custom(async (categories) => {
      if (!categories) throw false;

      const arr = [].concat(categories);
      for (const categoryId of arr) {
        const result = await db.getCategoryById(Number(categoryId));
        if (!result || result.type !== "genre") throw false;
      }
    })
    .withMessage("Invalid genre(s)."),
  body("platforms")
    .custom(async (categories) => {
      if (!categories) throw false;

      const arr = [].concat(categories);
      for (const categoryId of arr) {
        const result = await db.getCategoryById(Number(categoryId));
        if (!result || result.type !== "platform") throw false;
      }
    })
    .withMessage("Invalid platform(s)."),
  body("developers")
    .custom(async (categories) => {
      if (!categories) throw false;

      const arr = [].concat(categories);
      for (const categoryId of arr) {
        const result = await db.getCategoryById(Number(categoryId));
        if (!result || result.type !== "developer") throw false;
      }
    })
    .withMessage("Invalid developer(s)."),
  body("password")
    .custom((password) => password === process.env.ADMIN_PASSWORD)
    .withMessage("Incorrect password."),
];

const validateBodyPassword = () =>
  body("password")
    .custom((password) => password === process.env.ADMIN_PASSWORD)
    .withMessage("Incorrect password.");

const validateGameId = () =>
  param("id")
    .custom(async (id) => {
      const game = await db.getGameById(id);
      if (!game) throw false;
    })
    .withMessage("Game not found.");

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
    href: "create",
    links,
    game: {},
    types,
  });
});

const postCreateGame = [
  validateGameBody(),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const types = formatRelations(await db.getAllCategories());

      return res.status(400).render("gameForm", {
        action: "Create",
        href: "create",
        links,
        game: {},
        types,
        errors: errors.array(),
      });
    }

    await db.createGame({
      game: req.body.game,
      price: Number(req.body.price),
      release_date: req.body.releaseDate,
      about: req.body.about,
      relations: []
        .concat(req.body.genres, req.body.developers, req.body.platforms)
        .map((item) => Number(item)),
    });
    res.redirect("/");
  }),
];

const getUpdateGame = [
  validateGameId(),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new CustomError(errors.array[0].msg, 404);

    const game = await db.getGameById(req.params.id);
    game.release_date = `${game.release_date.getFullYear()}-${game.release_date.getMonth() + 1}-${game.release_date.getDate()}`;

    // Get types and set checked to true where we need to so we can show them in form
    const types = formatRelations(await db.getAllCategories());
    for (const type of Object.keys(types)) {
      types[type].forEach((cat) => {
        if (game[type].find((cat1) => cat.id === cat1.id)) cat.checked = true;
      });
    }

    res.render("gameForm", {
      action: "Update",
      href: "update/" + game.id,
      links,
      types,
      game,
    });
  }),
];

const postUpdateGame = [
  validateGameId(),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new CustomError(errors.array()[0].msg, 404);

    next();
  }),
  validateGameBody(),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const game = await db.getGameById(req.params.id);
      game.release_date = `${game.release_date.getFullYear()}-${game.release_date.getMonth() + 1}-${game.release_date.getDate()}`;

      // Get types and set checked to true where we need to so we can show them in form
      const types = formatRelations(await db.getAllCategories());
      for (const type of Object.keys(types)) {
        types[type].forEach((cat) => {
          if (game[type].find((cat1) => cat.id === cat1.id)) cat.checked = true;
        });
      }

      return res.status(400).render("gameForm", {
        action: "Update",
        href: "update/" + game.id,
        links,
        types,
        game,
        errors: errors.array(),
      });
    }

    await db.updateGame({
      id: Number(req.params.id),
      game: req.body.game,
      price: Number(req.body.price),
      release_date: req.body.releaseDate,
      about: req.body.about,
      relations: []
        .concat(req.body.genres, req.body.developers, req.body.platforms)
        .map((item) => Number(item)),
    });
    res.redirect("/games");
  }),
];

const postDeleteGame = [
  validateGameId(),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new CustomError(errors.array()[0].msg, 404);

    next();
  }),
  validateBodyPassword(),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.redirect("/games/game/" + req.params.id);

    await db.deleteGame(Number(req.params.id));
    res.redirect("/games");
  }),
];

module.exports = {
  getGames,
  getGameById,
  getCreateGame,
  postCreateGame,
  getUpdateGame,
  postUpdateGame,
  postDeleteGame,
};
