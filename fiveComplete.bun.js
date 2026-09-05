import games from "./docs/wpbl2026-current.json";
import { findTeam } from "./docs/js/wpbl2026-teams.js";
import { getBoxscore } from "./utils.bun.js";

await main();

async function main() {
  const results = [];
  for (const g of Object.values(games)) {
    const { officialDate: date, game_id } = g;
    if (game_id === "") continue;

    const { boxscore } = await getBoxscore(game_id);
    const { teams, } = boxscore;
    const players = teams.flatMap((t) => {
      return [...t.players.map((p) => { p.team = t.name; return p; })]
    });
    const pitchers = players.filter((p) => p.pitching)
      .filter((p) => p.pitching.appear === "1" && Number(p.pitching.ip) >= 5)
      .map((p) => {
        const { team, name, throws: pitchHand } = p
        const { ip, r, er, win, loss } = p.pitching;
        return {
          date, name, pitchHand, ip: Number(ip), r, er, team: findTeam(team).abbreviation, win, loss,
        }
      })
      ;
    results.push(pitchers);
  }
  const data = results.flatMap((p) => p)
    .map(({ date, name, pitchHand, ip, r, er, team, win, loss }) => `${date.split("-").slice(-2).join("")} ${team.padStart(3)} ${pitchHand}HP ${name.padEnd(18)} ${ip} IP, ${r} R, ${er} ER${win ? ', W' : ''}${loss ? ', L' : ''}`)
    ;
  const cols = Math.max(...data.map(s => s.length));
  const title = `Starting Pitchers with 5+ Innings Pitched`;
  const output = [
    `${' '.repeat(cols * .5 - title.length * .5)}${title}`,
    `=`.repeat(cols),
    ...data,
    `-`.repeat(cols),
  ].join("\n");
  console.log(output);
}