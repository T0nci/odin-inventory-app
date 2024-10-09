require("dotenv").config();
const express = require("express");
const path = require("node:path");
const indexRouter = require("./routes/indexRouter");
const links = require("./utils/links");
const CustomError = require("./utils/CustomError");

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

app.use("/", indexRouter);

// If no router matches the request it's a 404.
// If the request is error marked this will be skipped because it's a non error
// handler.
app.use(() => {
  throw new CustomError("Not Found", 404);
});
// Custom error handler for every error
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.render("error", { links, err });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Inventory Application listening on port ${PORT}!`),
);
