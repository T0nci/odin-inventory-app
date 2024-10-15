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
      "SELECT categories.id, category, type FROM categories JOIN types ON categories.type_id = types.id JOIN game_relations ON categories.id = game_relations.category_id WHERE game_id = $1",
      [row.id],
    );

    const relations = formatRelations(gameInfo.rows);

    games.push({
      ...row,
      genresString: limitStringLength(
        relations.genres.map((row) => row.category).join(", "),
      ),
      developersString: limitStringLength(
        relations.developers.map((row) => row.category).join(", "),
      ),
      platformsString: limitStringLength(
        relations.platforms.map((row) => row.category).join(", "),
      ),
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

  const gameInfo = await db.query(
    "SELECT categories.id, category, type FROM categories JOIN types ON categories.type_id = types.id JOIN game_relations ON categories.id = game_relations.category_id WHERE game_id = $1",
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

const createGame = async (game) => {
  const client = await db.getClient();

  try {
    await client.query("BEGIN");

    await client.query(
      "INSERT INTO games(game, price, release_date, about) VALUES ($1, $2, TO_DATE($3, 'YYYY-MM-DD'), $4)",
      [game.game, game.price, game.release_date, game.about],
    );
    const gameId = (
      await client.query(
        "SELECT id FROM games WHERE game = $1 AND price = $2 AND release_date = $3 AND about = $4",
        [game.game, game.price, game.release_date, game.about],
      )
    ).rows[0].id;

    for (const rel of game.relations) {
      await client.query(
        "INSERT INTO game_relations(game_id, category_id) VALUES ($1, $2)",
        [gameId, rel],
      );
    }

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
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
  createGame,
};
