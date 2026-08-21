import games from "../docs/wpbl2026-current.json";

const jsonlFile = Bun.file(`${import.meta.dirname}/wpbl2026-patch-gameIds.jsonl`);

const dateFormatter = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Chicago", });

await main();

async function main() {
  const writer = jsonlFile.writer();
  for (const g of Object.values(games)) {
    if (g.game_id.length > 0) continue;
    const d = new Date(g.scheduledDate);
    if (d > new Date()) continue;
    const game_id = await getGameId(g.url);
    const patch = {
      "effectiveDate": dateFormatter.format(d),
      "op": "add",
      "path": `/${g.uuid}/game_id`,
      "value": game_id,
    };
    const json = JSON.stringify(patch);
    console.info(json);
    writer.write(`${json}\n`);
  };
  writer.end();
}

async function getGameId(url) {
  const html = await (await fetch(url)).text();
  const match = html.match(/data-game-id="(\S+)"/);
  return match?.at(1) ?? match;
}
