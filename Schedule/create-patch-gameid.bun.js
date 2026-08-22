import games from "../docs/wpbl2026-current.json";

const jsonlFilePath = `${import.meta.dirname}/wpbl2026-patch-gameIds.jsonl`;
const dateFormatter = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Chicago" });

await main();

async function main() {
  // ファイルを毎回新規作成（初期化）して開く
  const writer = Bun.file(jsonlFilePath).writer();

  try {
    for (const g of Object.values(games)) {
      const d = new Date(g.scheduledDate);
      if (d > new Date()) continue;

      const game_id = g.game_id.length > 0 ? g.game_id : await getGameId(g.url);
      const patch = {
        "effectiveDate": dateFormatter.format(d),
        "op": "add",
        "path": `/${g.uuid}/game_id`,
        "value": game_id,
      };

      const json = JSON.stringify(patch);
      console.info(json);

      writer.write(`${json}\n`);
    }
  } finally {
    // 確実に書き込みを完了させて閉じる
    await writer.flush();
    await writer.end();
  }
}

async function getGameId(url) {
  const html = await (await fetch(url)).text();
  const match = html.match(/data-game-id="(\S+)"/);
  return match?.[1] ?? "";
}