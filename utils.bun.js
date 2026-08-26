import { join } from "node:path";

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
    if (res.boxscore.status.complete) {
      const output = JSON.stringify(res);
      Bun.write(boxfile, output);
    }
    return res;
  }
}

export {
  getBoxscore,
}