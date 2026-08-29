import inputs from "../docs/wpbl2026-homeruns.json";

await main();

async function main() {

  const data = inputs.homeruns
    .sort((a, b) => {
      if (a.date < b.date) return -1;
      if (a.date > b.date) return 1;
      return 0;
    })
    .map(({ date, inning, halfInning, batter, pitcher, outs, RoB, whereHit, runs }) => {
      const score = halfInning === "top" ? `${String(runs.away).padStart(2)}-${String(runs.home).padEnd(2)}` : `${String(runs.home).padStart(2)}-${String(runs.away).padEnd(2)}`;
      const row = [
        date.split("-").slice(1).join(""),
        batter.team.abbreviation.padStart(3),
        batter.name.padEnd(20 - 2),
        inning,
        String(outs).padStart(3),
        RoB,
        whereHit.padStart(3),
        pitcher.team.abbreviation.padStart(3),
        pitcher.name.padEnd(20 - 2),
        score,
      ];
      return row.join(" ");
    })
    ;
  //const output = JSON.stringify(data, null, 2);
  //console.log(output);

  const cols = 5 + 4 + 20 + 4 + 4 + 4 + 4 + 20 + 5;
  const header = [
    'Date',
    '   ',
    'Batter'.padEnd(20 - 4),
    'Inn',
    'Out',
    'RoB',
    'W/H',
    '   ',
    'Pitcher'.padEnd(20 - 4 + 2),
    'Score',
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
    'Score: score from the perspective of the batting team',
  ];

  console.log(lines.join("\n"));
  console.warn("\n#" + title);
  const leaders = inputs.leaders
    .map(({ name, number }) => `${number} ${name}`)
    .join("\n")
  console.warn(leaders + `\n#wpblstats`);
}


