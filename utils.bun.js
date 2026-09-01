import { join } from "node:path";
import pkg from 'fast-json-patch';
const { applyPatch } = pkg;

async function getBoxscore(game_id) {
  const boxfile = join(import.meta.dirname, `./Boxscores/${game_id}-boxscore.json`);
  const patchfilename = join(import.meta.dirname, `./Boxscores/${game_id}-boxscore-patch.json`);
  const file = Bun.file(boxfile);
  const patchfile = Bun.file(patchfilename);

  let result;
  try {
    const json = await file.json();
    result = json;
  } catch (error) {
    console.warn(`fetching: ${game_id}`);
    const url = `https://stats.womensprobaseballleague.com/v1/games/${game_id}/boxscore`;
    const res = await (await fetch(url)).json();
    if (res.boxscore.status.complete) {
      const output = JSON.stringify(res, null, 2);
      Bun.write(boxfile, output);
    }
    result = res;
  }
  // applyPatch

  try {
    const patches = (await patchfile.exists()) ? await patchfile.json() : [];
    result = applyPatch(result, patches, { mutateDocument: false }).newDocument;
  } catch (err) {
    console.error(err);
    throw new Error("E");
  }
  return result;
}

export {
  getBoxscore,
}