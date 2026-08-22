import { join } from "node:path";
import games from "./docs/wpbl2026-current.json";
import { findTeam } from "./docs/js/wpbl2026-teams.js";

await main();

async function main() {
  const pitchers = [];
  const datesList = [];

  for (const g of Object.values(games)) {
    const { officialDate: date, game_id } = g;
    if (game_id === "") continue;
    if (datesList.at(-1) !== date) datesList.push(date);
    const { boxscore } = await getBoxscore(game_id);
    const { teams, } = boxscore;
    const [away, home] = ["away", "home"].map((side) => teams.find((t) => t.side === side).id);
    teams.forEach((team) => {
      const { code, name: teamName, side } = team;
      const ps = team.players.filter((p) => p.pitching).map((p) => ({ date, teamName, code, side, game_id, ...p }));
      //console.log(date, game_id, name, runs, ps.length);
      pitchers.push(ps);
    })
  }

  const grouped = pitchers.flat()
    .sort((a, b) => {
      if (`${a.date}${a.side}` < `${b.date}${b.side}`) return -1;
      if (`${a.date}${a.side}` > `${b.date}${b.side}`) return 1;
      if (Number(a.jerseyNumber) < Number(b.jerseyNumber)) return -1;
      if (Number(a.jerseyNumber) > Number(b.jerseyNumber)) return 1;

      return 0;
    })
    .map(({ date, teamName, code, name, id, throws: pitchHand, uniform: jerseyNumber, pitching }) => {
      return {
        date, teamName, code, name, id, jerseyNumber, pitchHand, pitching
      }
    })
    .reduce((acc, cur) => {
      const ary = acc[cur.id] ?? [];
      ary.push(cur);
      acc[cur.id] = ary;
      return acc;
    }, {});

  const data = Object.values(grouped)
    .sort((a, b) => {
      if (a[0].code < b[0].code) return -1;
      if (a[0].code > b[0].code) return 1;
      if (Number(a[0].jerseyNumber) < Number(b[0].jerseyNumber)) return -1;
      if (Number(a[0].jerseyNumber) > Number(b[0].jerseyNumber)) return 1;
      return 0;
    })
    .map((ary) => {
      const { date, teamName, code, name, id, jerseyNumber, pitchHand } = ary[0];
      return { teamCode: findTeam(teamName).abbreviation || code, jerseyNumber, name, pitchHand, pitched: ary.map(({ date, pitching }) => ({ date, pitches: Number(pitching.pitches ?? 0) })) };
    })
    .map(({ teamCode, jerseyNumber, name, pitchHand, pitched }) => {
      const d = datesList
        .map((date) => {
          const p = pitched.find((p) => p.date === date);
          return ` ${p ? String(p.pitches).padStart(3) : "   "}`;
        })
        .join("");
      return `${teamCode.padStart(3)} ${jerseyNumber.padStart(2)} ${name.padEnd(20)} ${pitchHand}HP ${d}`;
    });

  const cols = 4 + 3 + 21 + 4 + datesList.length * 4;
  const title = `WPBL 2026 Pitchers Pitched by Date`;
  console.log([
    `${" ".repeat(cols * 0.5 - title.length * 0.5)}${title}`,
    "=".repeat(cols),
    `${" ".padEnd(3 + 3 + 1 + 20 + 4 + 3)}${datesList.map((date) => date.slice(-2)).join("  ")}`,
    "-".repeat(cols),
    data.join("\n"),
  ].join("\n").replace(/Naraski /g, "Narasaki"))
}



async function getBoxscore(game_id) {
  const boxfile = join(import.meta.dirname, `./Boxscores/${game_id}-boxscore.json`);
  const file = Bun.file(boxfile);

  try {
    const json = await file.json();
    return json;
  } catch (error) {
    console.warn(`fetching: ${game_id}`);
    const url = `https://stats.womensprobaseballleague.com/v1/games/${game_id}/boxscore`;
    const res = await (await fetch(url)).json();
    const output = JSON.stringify(res);
    Bun.write(boxfile, output);
    return res;
  }
}

