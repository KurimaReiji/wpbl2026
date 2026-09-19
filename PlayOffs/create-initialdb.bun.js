import events from "./events.json";
import { findTeam } from "../docs/js/wpbl2026-teams.js";

const outfile = `${import.meta.dirname}/wpbl2026-playoff-start.json`;

const dateFormatter = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Chicago", });
const gen = idGenerator();

const createScheduleData = () => ({
  "id": "",
  "game_id": "",
  "uuid": "",
  "title": "",
  "season": "2026",
  "scheduledDate": "",
  "officialDate": "",
  "venue": "Robin Roberts Stadium",
  "url": "",
  "seriesDescription": "Post Season",
  "status": "Scheduled",
  "teams": {
    "away": {
      "team": {
        "id": "",
        "name": "",
      },
    },
    "home": {
      "team": {
        "id": "",
        "name": "",
      },
    },
  }
});

const data = events
  .map((s) => {
    const obj = createScheduleData();
    obj.uuid = gen.next().value;
    ["id", "title", "url"].forEach((prop) => {
      obj[prop] = s[prop]
    });
    obj.scheduledDate = s.start;
    obj.officialDate = dateFormatter.format(new Date(s.start));
    ["away", "home"].forEach((side) => {
      const team = findTeam(s.extendedProps[`${side}Team`]);
      obj.teams[side].team.id = team.team_id;
      ["abbreviation", "name", "franchiseName", "teamName"].forEach((item) => {
        obj.teams[side].team[item] = team[item];
      });
    });
    return obj;
  })
  .reduce((acc, cur) => {
    acc[cur.uuid] = cur;
    return acc;
  }, {})
  ;

const output = JSON.stringify(data, null, 2);
Bun.write(outfile, output);
console.warn(`outfile: ${outfile}`);

function* idGenerator() {
  const ids = [
    "01a0b969-5918-751f-b3fc-71d83f828314", "01a0b969-5919-7620-8867-fa59e7d65c56", "01a0b969-5919-7621-bfd5-a23b9752d0e3",
    "01a0b969-5919-7622-a48d-46978ba155dc", "01a0b969-5919-7623-bbf2-a8b3267ede4f", "01a0b969-5919-7624-9682-14040cf4c139",
    "01a0b969-5919-7625-8ff6-98b07f02ebc2", "01a0b969-5919-7626-a0af-5b0733e539a4", "01a0b969-5919-7627-9074-44c28d2d9bef",
    "01a0b969-5919-7628-8601-8c2a49cdc0f2", "01a0b969-5919-7629-98d2-6c05e2742918"
  ];
  yield* ids;
}
