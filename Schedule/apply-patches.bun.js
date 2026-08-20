import { join } from "node:path";
import pkg from 'fast-json-patch';
const { applyPatch } = pkg;

import inputs from "./wpbl2026-start.json";

const outfile = join(import.meta.dirname, `../docs/wpbl2026-current.json`);

const patchfiles = ['wpbl2026-patch-gameIds.jsonl', 'wpbl2026-patch-boxscores.jsonl']
  .map((fname) => `${import.meta.dirname}/${fname}`);
const patches = [];

for (const infile of patchfiles) {
  const file = Bun.file(infile);
  const buf = (await file.exists()) ? await file.text() : "";
  patches.push(buf.trim().split("\n").flatMap((line) => line !== "" ? [JSON.parse(line)] : []));
}

const result = applyPatch(inputs, patches.flat(), { mutateDocument: false }).newDocument;
const output = JSON.stringify(result, null, 2);
Bun.write(outfile, `${output}\n`);
console.warn(`outfile: ${outfile}`);
