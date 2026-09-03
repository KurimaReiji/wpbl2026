import { join } from "node:path";
import games from "../docs/wpbl2026-current.json";
import { getBoxscore } from "../utils.bun.js";

const jsonlFilePath = `${import.meta.dirname}/wpbl2026-patch-boxscores.jsonl`;

const dateFormatter = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Chicago", });

await main();

async function main() {
  const writer = Bun.file(jsonlFilePath).writer();

  for (const g of Object.values(games)) {
    const { game_id, teams: gTeams } = g;
    if (game_id === "") continue;
    const { boxscore } = await getBoxscore(game_id);
    const { teams, status } = boxscore;
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
      "value": status.complete ? "Final" : "In Progress",
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
      winner: pitchers.filter(({ pitching }) => pitching.win).at(0)?.name,
      loser: pitchers.filter(({ pitching }) => pitching.loss).at(0)?.name,
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

    const linescore = createLinescore(teams);
    const lsPatch = status.complete ? [{
      effectiveDate,
      "op": "add",
      "path": `/${g.uuid}/linescore`,
      "value": linescore,
    }] : [];

    [statusPatch, scorePatch, decisionsMap, decisionsPatch, lsPatch].flat().forEach((patch) => {
      const json = JSON.stringify(patch);
      console.info(json);
      writer.write(`${json}\n`);
    })
  };

  await writer.flush();
  await writer.end();
}

function createLinescore(teams) {
  const [away, home] = teams;
  const innings = away.line
    .map(({ inning, runs }, i) => {
      return {
        num: inning,
        away: { runs: runs },
        home: { runs: home.line[i].runs },
      }
    });
  const totals = {
    away: { runs: away.totals.runs, hits: away.totals.hits, errors: away.totals.errors, leftOnBase: away.totals.left_on_base },
    home: { runs: home.totals.runs, hits: home.totals.hits, errors: home.totals.errors, leftOnBase: home.totals.left_on_base },
  };

  return {
    innings, teams: totals,
  }
}