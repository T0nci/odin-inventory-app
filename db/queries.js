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

    const newRow = { ...row, ...formatRelations(gameInfo.rows) };

    games.push({
      ...newRow,
      genresString: limitStringLength(
        newRow.genres
          .map((item) => item[0].toUpperCase() + item.slice(1))
          .join(", "),
      ),
      developersString: limitStringLength(newRow.developers.join(", ")),
      platformsString: limitStringLength(newRow.platforms.join(", ")),
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

const getAllGames = async () => {
  const { rows } = await db.query("SELECT id, game, price FROM games");

  const games = [];
  for (const row of rows) {
    const gameInfo = await db.query(
      "SELECT category, type FROM categories JOIN types ON categories.type_id = types.id JOIN game_relations ON categories.id = game_relations.category_id WHERE type = 'genre' AND game_id = $1",
      [row.id],
    );

    games.push({ ...row, genres: gameInfo.map((row) => row.category) });
  }

  return games;
};

const getGamesByCategoryId = async (categoryId) => {
  const categories = await db.query("SELECT id FROM categories");

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

    games.push({ ...row, genres: gameInfo.map((row) => row.category) });
  }

  return games;
};

module.exports = {
  getNewAdditions,
  getAllCategories,
  getAllGames,
  getGamesByCategoryId,
};
