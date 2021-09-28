const express = require("express");

const app = express();

const startStamp = new Date().getTime();

const BASE_URL = `https://u39dm.sse.codesandbox.io/`;

const PORT = 3000;

app.get("/stamp", (req, res) => {
  res.send(`stamp ${startStamp}`);
});

function listen() {
  app.listen(PORT, (_) => {
    console.log(`Sandbox server listening at ${PORT} !`);
  });
}

module.exports = {
  /////////////////////////////////

  app: app,

  startStamp: startStamp,

  /////////////////////////////////

  BASE_URL: BASE_URL,

  PORT: PORT,

  ////////////////////////////////

  TOPLIST_CHUNK: 20,

  ////////////////////////////////

  listen: listen

  ////////////////////////////////
};
