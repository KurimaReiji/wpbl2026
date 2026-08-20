const outfile = `${import.meta.dirname}/events.json`;

const url = new URL('https://www.womensprobaseballleague.com/wp-json/wpbl/v1/calendar-events');

url.searchParams.set('start', '2026-07-01T00:00:00+09:00');
url.searchParams.set('end', '2026-10-01T00:00:00+09:00');

const res = await fetch(url, { cache: "no-cache", });
const inputs = await res.json();

const data = inputs
  .filter(({ title }) => !title.includes("Playoff"))
  .filter(({ title }) => !title.includes("Championship"))
  .sort((a, b) => {
    if (a.start < b.start) return -1;
    if (a.start > b.start) return 1;
    return 0;
  })
  ;
const output = JSON.stringify(data, null, 2);
Bun.write(outfile, output);
console.warn(`outfile: ${outfile}`);
