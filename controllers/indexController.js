const db = require("../db/queries");
const links = require("../utils/links");
const asyncHandler = require("express-async-handler");

const getHome = asyncHandler(async (req, res) => {
  const games = await db.getNewAdditions();
  res.render("index", { links, games });
});

module.exports = { getHome };
