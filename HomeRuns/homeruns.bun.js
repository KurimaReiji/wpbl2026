import { join } from "node:path";
import games from "../docs/wpbl2026-current.json";
import { findTeam } from "../docs/js/wpbl2026-teams.js";

await main();

async function main() {
  const homeruns = [];
  for (const g of Object.values(games)) {
    const { officialDate: date, game_id } = g;
    if (game_id === "") continue;
    const { boxscore } = await getBoxscore(game_id);
    const { plays, teams, } = boxscore;
    const [away, home] = ["away", "home"].map((side) => teams.find((t) => t.side === side).id);
    plays.forEach((play) => {
      const { event_type } = play;
      if (event_type === "home_run") {
        homeruns.push({ date, game_id, away, home, ...play });
      }
    })
  }

  const counts = homeruns
    .map(({ batter_name }) => batter_name)
    .reduce((a, c) => {
      a[c] = (a[c] ?? 0) + 1;
      return a;
    }, {});

  const leaders = Object.keys(counts)
    .filter((batter) => counts[batter] > 1)
    .sort((a, b) => {
      if (counts[a] > counts[b]) return -1;
      if (counts[a] < counts[b]) return 1;
      return 0;
    })
    .map((batter) => `${counts[batter]} ${batter}`)
    ;

  const data = homeruns
    .sort((a, b) => {
      if (a.date < b.date) return -1;
      if (a.date > b.date) return 1;
      return 0;
    })
    .map((o) => {
      const { date, away, home, game_id, team_id, inning, half: halfInning, batter_name, pitcher_name, outs, bases_occupied, narrative, } = o;

      const RoB = getRoB(bases_occupied);
      const whereHit = getWhereHit(narrative);

      const batter = {
        name: batter_name,
        team: findTeam(team_id).abbreviation ?? "N/A",
      };
      const pitcher = {
        name: pitcher_name,
        team: findTeam(team_id === home ? away : home)?.abbreviation ?? "N/A",
      };
      return { date, away, home, game_id, team_id, inning, halfInning, batter, pitcher, outs, bases_occupied, RoB, whereHit, narrative };
    })
    .map(({ date, away, home, game_id, team_id, inning, halfInning, batter, pitcher, outs, bases_occupied, RoB, whereHit, narrative }) => {
      const row = [
        date.split("-").slice(1).join(""),
        batter.team.padStart(3),
        batter.name.padEnd(20),
        inning,
        String(outs).padStart(3),
        RoB,
        whereHit.padStart(3),
        pitcher.team.padStart(3),
        pitcher.name.padEnd(20),
      ];
      return row.join(" ");
    })
    ;
  //const output = JSON.stringify(data, null, 2);
  //console.log(output);

  const cols = 5 + 4 + 21 + 2 + 4 + 4 + 4 + 4 + 21;
  const header = [
    'Date',
    '   ',
    'Batter'.padEnd(20 - 2),
    'Inn',
    'Out',
    'RoB',
    'W/H',
    '   ',
    'Pitcher',
  ];
  const title = `WPBL 2026 Home Runs (${data.length})`;
  const lines = [
    `${' '.repeat(cols * .5 - title.length * .5)}${title}`,
    `=`.repeat(cols),
    header.join(" "),
    `-`.repeat(cols),
    data.join("\n"),
    `-`.repeat(cols),
    'RoB: runners on base',
    'W/H: Where Hit (hit direction)',
  ];
  console.log(lines.join("\n"));

  console.warn("\n" + leaders.join("\n"));
}

function getRoB(bases_occupied) {
  return [1, 2, 3].map((base) => bases_occupied.includes(base) ? base : "-").join("");
}

function getWhereHit(narrative) {
  const toLCR = narrative.split("homered ").at(1).split(",").at(0);
  switch (toLCR) {
    case "to left field":
      return "LF";
    case "to center field":
      return "CF";
    case "to right field":
      return "RF";
    case "to left center":
      return "LC";
    case "to right center":
      return "RC";
    case "down the lf line":
      return "LF";
    case "down the rf line":
      return "RF";
    default:
      console.info(toLCR);
      return "N/A";
  }
}

async function getBoxscore(game_id) {
  const boxfile = join(import.meta.dirname, `../Boxscores/${game_id}-boxscore.json`);
  const file = Bun.file(boxfile);

  try {
    const json = await file.json();
    return json;
  } catch (error) {
    console.warn(`fetching: ${game_id}`);
    const url = `https://stats.womensprobaseballleague.com/v1/games/${game_id}/boxscore`;
    const res = await (await fetch(url)).json();
    if (res.boxscore.status.complete) {
      const output = JSON.stringify(res);
      Bun.write(boxfile, output);
    }
    return res;
  }
}