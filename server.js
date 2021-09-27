const express = require("express");
const app = express();
const port = 3000;
const download = require("download");

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
  res.send("Express Hello World!");
});

app.get("/test", (req, res) => {
  res.send("Test Express Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
