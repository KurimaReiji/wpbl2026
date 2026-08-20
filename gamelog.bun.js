import games from "./Schedule/wpbl2026-current.json";

const rows = [];
Object.values(games).forEach((g) => {
  const { status, officialDate, teams, decisions } = g;
  const { away, home } = teams;
  if (status === "Final") {
    const { winner, loser, save } = decisions;
    const result = ["away", "home"]
      .map((side) => teams[side])
      .map((t) => ({ teamName: t.team.teamName, score: t.score }))
      .sort((a, b) => {
        if (a.score > b.score) return -1;
        if (a.score < b.score) return 1;
        return 0;
      })
      .map(({ teamName, score }, i) => `${teamName} ${score}`.padStart(i === 0 ? 12 : 0))
      .join(", ");
    rows.push(`${officialDate}  ${result.padEnd(26)}  W: ${winner}, L: ${loser}${save ? ', S: ' : ''}${save ? save : ''}`);
  } else {
    rows.push(`${officialDate}  ${home.team.teamName.padStart(9)} vs ${away.team.teamName}`);
  }
});

const cols = Math.max(...rows.map(r => r.length));
const completed = rows.filter((line) => line.includes('W: ')).length;
const title = `WPBL 2026 Regular Season (${completed} of 30 games)`;
console.log([
  `${' '.repeat(.5 * (cols - title.length))}${title}`,
  '='.repeat(cols),
  ...rows
].join("\n").replace(/Naraski ?/g, 'Narasaki'));