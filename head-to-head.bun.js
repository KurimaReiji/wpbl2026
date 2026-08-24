import games from "./docs/wpbl2026-current.json";
import { Teams } from "./docs/js/wpbl2026-teams.js";

const abbrs = Teams.map((t) => t.abbreviation).sort();
const data = Teams
  .map((t) => {
    return {
      ...t,
      streak: [],
      ...Object.fromEntries(Teams.map((team) => [team.abbreviation, []]))
    }
  })
  .reduce((a, c) => {
    a[c.abbreviation] = c;
    return a;
  }, {});

Object.values(games)
  .filter(({ status }) => status === "Final")
  .forEach((g) => {
    const { away, home } = g.teams;
    if (away.score > home.score) {
      abbrs.forEach((abbr) => {
        if (away.team.abbreviation === abbr) {
          data[abbr].streak.push("W");
          abbrs.forEach((a) => {
            if (a === home.team.abbreviation) {
              data[abbr][a].push("W");
            } else {
              data[abbr][a].push(".");
            }
          });
        } else if (home.team.abbreviation === abbr) {
          data[abbr].streak.push("L");
          abbrs.forEach((a) => {
            if (a === away.team.abbreviation) {
              data[abbr][a].push("L");
            } else {
              data[abbr][a].push(".");
            }
          });
        } else {
          data[abbr].streak.push(".");
          abbrs.forEach((a) => {
            data[abbr][a].push(".");
          });
        }
      });
    } else {
      abbrs.forEach((abbr) => {
        if (away.team.abbreviation === abbr) {
          data[abbr].streak.push("L");
          abbrs.forEach((a) => {
            if (a === home.team.abbreviation) {
              data[abbr][a].push("L");
            } else {
              data[abbr][a].push(".");
            }
          });
        } else if (home.team.abbreviation === abbr) {
          data[abbr].streak.push("W");
          abbrs.forEach((a) => {
            if (a === away.team.abbreviation) {
              data[abbr][a].push("W");
            } else {
              data[abbr][a].push(".");
            }
          });
        } else {
          data[abbr].streak.push(".");
          abbrs.forEach((a) => {
            data[abbr][a].push(".");
          });
        }
      });
    }
  });

const rows = abbrs
  .map((abbr) => data[abbr])
  .map((o) => {
    const { wins, losses } = calcRecord(o.streak.join(''));
    const h2h = abbrs.filter((a) => a !== o.abbreviation)
      .map((abbr) => {
        const { wins, losses } = calcRecord(o[abbr].join(''));
        const op = `vs ${abbr}`;
        return `${op.padStart(12)} ${String(wins).padStart(2)}-${String(losses).padEnd(2)} ${o[abbr].join('')}`;
      });
    const row = `${[o.abbreviation, o.teamName].join(" ").padEnd(12)} ${String(wins).padStart(2)}-${String(losses).padEnd(2)} ${o.streak.join('')}`;
    return [
      row,
      ...h2h,
      "-".repeat(row.length),
    ];
  })

//const output = JSON.stringify(data, null, 2);
const completed = Object.values(games).filter(({status})=>status==="Final");
const cols = rows[0][0].length;
const title = `WPBL 2026 Head-to-head (${completed.length}/30)`;
const output = [
  `${' '.repeat(.5 * (cols - title.length))}${title}`,
  "=".repeat(cols),
  ...rows.map(r => r.join("\n")),
].join("\n");
console.log(output);

function calcRecord(wl) {
  return wl.replace(/\./g, "").split('')
    .reduce((a, c) => {
      if (c === "W") a.wins += 1;
      if (c === "L") a.losses += 1;
      return a;
    }, { wins: 0, losses: 0 })
}
