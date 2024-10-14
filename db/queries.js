const db = require("./pool");
const CustomError = require("../utils/CustomError");
const { formatRelations, limitStringLength } = require("../utils/helpers");

const getNewAdditions = async () => {
  const { rows } = await db.query(
    "SELECT id, game, price FROM games ORDER BY id DESC LIMIT 4",
  );

  const games = [];
  for (const row of rows) {
    const gameInfo = await db.query(
      "SELECT category, type FROM categories JOIN types ON categories.type_id = types.id JOIN game_relations ON categories.id = game_relations.category_id WHERE game_id = $1",
      [row.id],
    );

    const relations = formatRelations(gameInfo.rows);

    games.push({
      ...row,
      genresString: limitStringLength(relations.genres.join(", ")),
      developersString: limitStringLength(relations.developers.join(", ")),
      platformsString: limitStringLength(relations.platforms.join(", ")),
    });
  }

  return games;
};

const getAllCategories = async () => {
  const { rows } = await db.query(
    "SELECT categories.id, category, type FROM categories JOIN types ON categories.type_id = types.id",
  );
  return rows;
};

const getCategoryById = async (id) => {
  const { rows } = await db.query(
    "SELECT category, type FROM categories JOIN types ON categories.type_id = types.id WHERE categories.id = $1",
    [id],
  );
  return rows[0];
};

const getAllGames = async () => {
  const { rows } = await db.query("SELECT id, game, price FROM games");

  const games = [];
  for (const row of rows) {
    const gameInfo = await db.query(
      "SELECT category, type FROM categories JOIN types ON categories.type_id = types.id JOIN game_relations ON categories.id = game_relations.category_id WHERE type = 'genre' AND game_id = $1",
      [row.id],
    );

    games.push({ ...row, genres: gameInfo.rows.map((row) => row.category) });
  }

  return games;
};

const getGamesByCategoryId = async (categoryId) => {
  const categories = (await db.query("SELECT id FROM categories")).rows;

  if (!categories.find((row) => row.id === categoryId))
    throw new CustomError("Category Not Found", 404);

  const { rows } = await db.query(
    `SELECT id, game, price FROM games WHERE id IN (
      SELECT game_id FROM game_relations WHERE category_id = $1
    )`,
    [categoryId],
  );

  const games = [];
  for (const row of rows) {
    const gameInfo = await db.query(
      "SELECT category, type FROM categories JOIN types ON categories.type_id = types.id JOIN game_relations ON categories.id = game_relations.category_id WHERE type = 'genre' AND game_id = $1",
      [row.id],
    );

    games.push({ ...row, genres: gameInfo.rows.map((row) => row.category) });
  }

  return games;
};

const getGameById = async (id) => {
  const game = (await db.query("SELECT * FROM games WHERE id = $1", [id]))
    .rows[0];

  if (!game) throw new CustomError("Game Not Found.", 404);

  const gameInfo = await db.query(
    "SELECT category, type FROM categories JOIN types ON categories.type_id = types.id JOIN game_relations ON categories.id = game_relations.category_id WHERE game_id = $1",
    [game.id],
  );

  return { ...game, ...formatRelations(gameInfo.rows) };
};

const getAllTypesOfCategories = async () => {
  const { rows } = await db.query("SELECT * FROM types");
  return rows;
};

const createCategory = async (category, typeId) => {
  await db.query("INSERT INTO categories(category, type_id) VALUES ($1, $2)", [
    category,
    typeId,
  ]);
};

const updateCategory = async (category, typeId, id) => {
  await db.query(
    "UPDATE categories SET category = $1, type_id = $2 WHERE id = $3",
    [category, typeId, id],
  );
};

module.exports = {
  getNewAdditions,
  getAllCategories,
  getCategoryById,
  getAllGames,
  getGamesByCategoryId,
  getGameById,
  getAllTypesOfCategories,
  createCategory,
  updateCategory,
};
