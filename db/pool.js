const { Pool } = require("pg");

const pool = new Pool();

module.exports = {
  query: (text, params, cb) => pool.query(text, params, cb),
  getClient: () => pool.connect(),
};
