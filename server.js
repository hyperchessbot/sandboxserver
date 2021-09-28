const express = require("express");
const app = express();
const port = 3000;
const download = require("download");

const BASE_URL = `https://u39dm.sse.codesandbox.io/`;

const TOPLIST_CHUNK = 20;

const startStamp = new Date().getTime();

app.get("/stamp", (req, res) => {
  res.send(`${startStamp}`);
});

const reloadScript = `
<script>
const serverStamp = ${startStamp}
setInterval(_ => {
  fetch("${BASE_URL}stamp").then(response => response.text().then(content => {
    if(parseInt(content) != serverStamp) {
      console.log("server changed, reloading")      
      document.getElementById("info").innerHTML="Server changed. Reloading ..."
      setTimeout(_ => document.location.reload(), 2000)
    }
  }))
},1000)
</script>
`;

const header = `
<head>
<title>Sandbox Server - Lichess Puzzles Toplist</title>
${reloadScript}
</head>
<body>
Lichess puzzles contributors toplist and search by user.
<hr>
Api:
Toplist : <a href="${BASE_URL}toplist?page=1">${BASE_URL}toplist?page=1</a>
|
User : <a href="${BASE_URL}user?user=DrNykterstein">${BASE_URL}user?user=DrNykterstein</a>
.
<hr>
<div id="info">Page up to date with server.</div>
<hr>
`;

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
}, 100);

function noPuzzles() {
  return `${header} Database not yet downloaded. Try a bit later.`;
}

app.get("/", (req, res) => {
  res.send(header);
});

function user2link(user) {
  const link = `${BASE_URL}user?user=${user}`;
  return `<a href="${link}" target="_blank" rel="noopener noreferrer">${user}</a>`;
}

app.get("/user", (req, res) => {
  if (!puzzles) {
    res.send(noPuzzles());
    return;
  }
  console.log("user", req.query);
  const user = req.query.user;
  console.log("looking up record");
  const record = puzzles
    .slice(1)
    .filter((puzzle) => puzzle.length)
    .find((puzzle) => {
      const [rank, testuser] = puzzle.split(",");
      return testuser.toLowerCase() === user.toLowerCase();
    });
  if (!record) {
    res.send(`${header} ${user} not found`);
    return;
  }
  console.log("done, record", record.split(""));
  const [rank, username, num, userpuzzles] = record.split(",");
  const userpuzzlelinks = userpuzzles.split(" ").map((puzzle) => {
    const link = `https://lichess.org/training/${puzzle}`;
    return `<a href="${link}" target="_blank" rel="noopener noreferrer">${puzzle}</a>`;
  });
  res.send(
    `${header} ${rank} ${username} ${num} ${userpuzzlelinks.join(" | ")}`
  );
});

app.get("/toplist", (req, res) => {
  if (!puzzles) {
    res.send(noPuzzles());
    return;
  }
  console.log("toplist", req.query);
  const page = parseInt(req.query.page, 10) - 1;
  const start = page * TOPLIST_CHUNK + 1;
  const records = puzzles.slice(start, start + TOPLIST_CHUNK);
  const bare = records.map((record) => {
    const [rank, name, num] = record.split(",");
    return `<tr><td>${rank}</td><td>${user2link(
      name
    )}</td><td align="center">${num}</td></tr>`;
  });
  res.send(
    `${header} <table cellpadding="3" cellspacing="3" border="1"><tr><td>Rank</td><td>User</td><td>Number of puzzles</td></tr>` +
      bare.join("\n") +
      "</table>"
  );
});

/*setInterval((_) => {
  console.log("loading self");
  download(BASE_URL).then((blob) => {
    console.log("self loaded", blob.toString().length);
  });
}, 60000);*/

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
