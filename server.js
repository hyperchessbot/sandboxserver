import download from "download";
import leven from "leven";

import config from "/sandbox/config.js";
import pagereload from "/sandbox/pagereload.js";

const app = config.app;

/////////////////////////////////////
// setup

const header = `
<head>
<title>Sandbox Server - Lichess Puzzles Toplist</title>
${pagereload.reloadScript}
</head>
<body>
Lichess puzzles contributors toplist and search by user. Endpoints:
<hr>
<li><a href="${config.BASE_URL}toplist?page=1">${config.BASE_URL}toplist?page=1</a> ( Contributor Toplist )</li>
<li><a href="${config.BASE_URL}user?user=DrNykterstein">${config.BASE_URL}user?user=DrNykterstein</a> ( Puzzles of a Contributor )</li>
<li><a href="${config.BASE_URL}user?user=xxx">${config.BASE_URL}user?user=xxx</a> ( Suggest similar Contributors for non existing user name )</li>
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

function user2link(user) {
  const link = `${config.BASE_URL}user?user=${user}`;
  return `<a href="${link}" target="_blank" rel="noopener noreferrer">${user}</a>`;
}

/////////////////////////////////////
// routes

app.get("/", (req, res) => {
  res.send(header);
});

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
    const similar = puzzles
      .filter((puzzle) => puzzle)
      .map((puzzle) => {
        const testUser = puzzle.split(",");
        return [testUser[1], leven(user, testUser[1]), testUser[2]];
      })
      .sort((a, b) => a[1] - b[1]);
    const suggest = similar.slice(0, config.NUM_SIMILAR);
    const suggestHtml = suggest
      .map(
        (testUser) => `
      <li>${user2link(testUser[0])} - ${testUser[2]} puzzle(s)</li>
    `
      )
      .join("\n");
    res.send(
      `${header} User ${user} not found. Did you mean ...<hr>${suggestHtml}`
    );
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
  const start = page * config.TOPLIST_CHUNK + 1;
  const records = puzzles.slice(start, start + config.TOPLIST_CHUNK);
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

/////////////////////////////////////
// keep alive

let refreshes = [];

setInterval((_) => {
  console.log("loading self");
  download(
    `https://discordlambda.netlify.app/.netlify/functions/geturl?url=${config.BASE_URL}`
  ).then((blob) => {
    console.log("self loaded", blob.toString().length);
    refreshes.unshift(new Date().toLocaleString());
  });
}, 60000);

app.get("/refr", (req, res) => {
  res.send(`${refreshes.join("<br>\n")}`);
});

/////////////////////////////////////
// start server

config.listen();
