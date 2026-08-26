import games from "../docs/wpbl2026-current.json";
import { findTeam } from "../docs/js/wpbl2026-teams.js";
import { getBoxscore } from "../utils.bun.js";

await main();

async function main() {
  const players = {};
  const homeruns = [];
  let updated;
  for (const g of Object.values(games)) {
    const { officialDate: date, game_id } = g;
    if (game_id === "") continue;
    updated = date;
    const { boxscore } = await getBoxscore(game_id);
    const { plays, teams, } = boxscore;
    const runs = { away: 0, home: 0 };
    plays.forEach((play) => {
      const { half, event_type, narrative } = play;
      if (event_type === "home_run") {
        homeruns.push({ date, game_id, ...play, runs: { ...runs } });
      }
      const count = (narrative.match(/scored|homered|stole home/gi) || narrative.match(/RBI/) || []).length;
      if (count > 0) {
        //console.log(`${count} ${runs.away}-${runs.home} ${narrative} `);
        if (half === 'top') {
          runs.away += count;
        } else {
          runs.home += count;
        }
      }
    });
    // data broken at the top of the 7th (one run scored)
    if (game_id !== "dtksss0az7dpa97f" && runs.away !== teams[0].totals.runs || runs.home !== teams[1].totals.runs) {
      console.error(date, game_id, runs.away, teams[0].totals.runs, runs.home, teams[1].totals.runs);
      throw new Error("runs not match!");
    }
    teams.forEach((t) => {
      t.players.forEach((player) => {
        player.team = findTeam(t.id);
        delete player.team.manager;
        players[player.id] = player;
      });
    });
  }

  const getPlayerByName = createGetPlayerByName(players);

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
    .map((batter) => ({ name: batter, number: counts[batter] }))
    ;

  const data = homeruns
    .sort((a, b) => {
      if (a.date < b.date) return -1;
      if (a.date > b.date) return 1;
      return 0;
    })
    .map((o) => {
      const { date, game_id, inning, half: halfInning, batter_name, pitcher_name, outs, bases_occupied, narrative, runs } = o;

      const RoB = getRoB(bases_occupied);
      const whereHit = getWhereHit(narrative);

      const batter = getPlayerByName(batter_name);
      const pitcher = getPlayerByName(pitcher_name);
      return { date, game_id, inning, halfInning, batter, pitcher, outs, bases_occupied, RoB, whereHit, runs, narrative };
    })
    ;
  const output = JSON.stringify({ updated, homeruns: data, leaders }, null, 2);
  console.log(output);
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

function createGetPlayerByName(db) {
  return function (target) {
    if (target === "Maggie Fox") target = "Maggie Foxx";
    const player = Object.values(db).find((p) => p.name === target);
    if (!player) {
      throw new Error(target)
    }
    const { name, short_name, uniform: jerseyNumber, bats: batSide, throws: pitchHand, team } = player;
    return { name, short_name, uniform: jerseyNumber, bats: batSide, throws: pitchHand, team };
  }
}