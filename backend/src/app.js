const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");
const Rooms = require("./index");

const { codeToToken, getIdentifier } = require("./spotify");
const { encrypt, decrypt } = require("./encryption");

const middlewares = require("./middlewares");

const app = express();

app.use(morgan("dev"));
app.use(helmet());
app.use(
  cors({
    origin: "*",
  })
);
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "🦄🌈✨👋🌎🌍🌏✨🌈🦄",
  });
});

app.get("/spotify", async (req, res) => {
  const { code } = req.query;

  const tokens = await codeToToken(code);
  if (!tokens) return res.redirect(`${process.env.FRONTEND_URL}`);

  const identifier = await getIdentifier(tokens.access_token);
  const secret = await Rooms.createRoom(tokens, identifier);

  // create room, and get host handle
  return res.redirect(`${process.env.FRONTEND_URL}/host/${secret}`);
});

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

module.exports = app;
