const outfile = `${import.meta.dirname}/events.json`;

const url = new URL('https://www.womensprobaseballleague.com/wp-json/wpbl/v1/calendar-events');

url.searchParams.set('start', '2026-07-01T00:00:00+09:00');
url.searchParams.set('end', '2026-10-01T00:00:00+09:00');

const res = await fetch(url, { cache: "no-cache", });
const inputs = await res.json();

const data = inputs
  .filter(({ title }) => !title.includes("Playoff"))
  .filter(({ title }) => !title.includes("Championship"))
  ;
const output = JSON.stringify(data, null, 2);
Bun.write(outfile, output);
console.warn(`outfile: ${outfile}`);
