import { join } from "node:path";
import games from "./wpbl2026-current.json";

const jsonlFile = Bun.file(`${import.meta.dirname}/wpbl2026-patch-boxscores.jsonl`);

const dateFormatter = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Chicago", });


await main();

async function main() {
  const writer = jsonlFile.writer();

  for (const g of Object.values(games)) {
    const { game_id, teams: gTeams } = g;
    if (game_id === "") continue;
    const { boxscore } = await getBoxscore(game_id);
    const { teams, } = boxscore;
    const [away, home] = teams;
    const pitchers = teams.map((t) => t.players).flat().filter((p) => p.pitching);
    if (away.name !== gTeams.away.team.name || home.name !== gTeams.home.team.name) {
      console.error([game_id, g.url]);
      console.error([away.name, gTeams.away.team.name, home.name, gTeams.home.team.name]);
      throw new Error("not match");
    }
    const effectiveDate = dateFormatter.format(new Date(g.scheduledDate))
    const statusPatch = {
      effectiveDate,
      "op": "add",
      "path": `/${g.uuid}/status`,
      "value": "Final",
    };
    const scorePatch = ["away", "home"]
      .map((side, i) => {
        return {
          effectiveDate,
          "op": "add",
          "path": `/${g.uuid}/teams/${side}/score`,
          "value": teams[i].totals.runs,
        }
      });

    const decisions = {
      winner: pitchers.filter(({ pitching }) => pitching.win).at(0).name,
      loser: pitchers.filter(({ pitching }) => pitching.loss).at(0).name,
      save: pitchers.filter(({ pitching }) => pitching.save).at(0)?.name,
    }

    const decisionsMap = {
      effectiveDate,
      "op": "add",
      "path": `/${g.uuid}/decisions`,
      "value": {},
    };

    const decisionsPatch = Object.keys(decisions)
      .filter((key) => decisions[key] !== undefined)
      .map((key) => {
        const value = decisions[key];
        return {
          effectiveDate,
          "op": "add",
          "path": `/${g.uuid}/decisions/${key}`,
          "value": value,
        }
      });

    [statusPatch, scorePatch, decisionsMap, decisionsPatch].flat().forEach((patch) => {
      const json = JSON.stringify(patch);
      console.info(json);
      writer.write(`${json}\n`);
    })
  };

  writer.end();
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
    const output = JSON.stringify(res);
    Bun.write(boxfile, output);
    return res;
  }

}