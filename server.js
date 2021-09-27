const express = require("express");
const app = express();
const port = 3000;
const download = require("download");

const TOPLIST_CHUNK = 10;

var puzzles = null;

setTimeout((_) => {
  console.log("downloading leaderboard");
  download(
    "https://github.com/hyperchessbot/amgilp/blob/nunjucks/leaderboardfull.csv?raw=true"
  )
    .then((blob) => {
      blob = blob.toString();
      puzzles = blob.split("\n");
      console.log(
        "leaderboard downloaded ok, size",
        blob.toString().length,
        "users",
        puzzles.length,
        "top user",
        puzzles[1].split(",").slice(1, 3)
      );
    })
    .catch((err) => console.log("problem", err));
}, 1000);

app.get("/", (req, res) => {
  res.send(
    `Lichess puzzles contributors toplist. Api: <a href="https://u39dm.sse.codesandbox.io/toplist?page=1">https://u39dm.sse.codesandbox.io/toplist?page=1</a> .`
  );
});

app.get("/toplist", (req, res) => {
  console.log("toplist", req.query);
  const page = parseInt(req.query.page, 10) - 1;
  const start = page * TOPLIST_CHUNK + 1;
  const records = puzzles.slice(start, start + TOPLIST_CHUNK);
  const bare = records.map((record) => {
    const [rank, name, num] = record.split(",");
    return `<tr><td>${rank}</td><td>${name}</td><td align="center">${num}</td></tr>`;
  });
  res.send(
    `<table cellpadding="3" cellspacing="3" border="1"><tr><td>Rank</td><td>User</td><td>Number of puzzles</td></tr>` +
      bare.join("\n") +
      "</table>"
  );
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
