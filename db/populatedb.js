const { Client } = require("pg");
const { argv } = require("node:process");

const games = require("./dummyData/games");
const types = require("./dummyData/types");
const categories = require("./dummyData/categories");
const gameRelations = require("./dummyData/game_relations");

if (typeof argv[2] !== "string") return;

const tablesQuery = `
CREATE TABLE IF NOT EXISTS games (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  game VARCHAR ( 255 ),
  price NUMERIC (5, 2),
  release_date DATE,
  about VARCHAR ( 255 )
);

CREATE TABLE IF NOT EXISTS types (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  type VARCHAR ( 255 )
);

CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  category VARCHAR ( 255 ),
  type_id INTEGER REFERENCES types(id)
);

CREATE TABLE IF NOT EXISTS game_relations (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  game_id INTEGER REFERENCES games(id),
  category_id INTEGER REFERENCES categories(id)
);
`;

const main = async () => {
  console.log("seeding...");
  const client = new Client({
    connectionString: argv[2],
  });
  await client.connect();

  await client.query(tablesQuery);

  for (const game of games) {
    await client.query(
      "INSERT INTO games (game, price, release_date, about) VALUES ($1, $2, TO_DATE($3, 'YYYY-MM-DD'), $4)",
      [game.game, game.price, game.release_date, game.about],
    );
  }
  for (const type of types) {
    await client.query("INSERT INTO types (type) VALUES ($1)", [type]);
  }
  for (const category of categories) {
    await client.query(
      "INSERT INTO categories (category, type_id) VALUES ($1, (SELECT id FROM types WHERE type = $2))",
      [category.category, category.type],
    );
  }
  for (const rel of gameRelations) {
    await client.query(
      "INSERT INTO game_relations (game_id, category_id) VALUES ((SELECT id FROM games WHERE game = $1), (SELECT id FROM categories WHERE category = $2))",
      [rel.game, rel.category],
    );
  }

  await client.end();
  console.log("done");
};

main();
