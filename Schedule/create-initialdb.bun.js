import events from "./events.json";
import { findTeam } from "../docs/js/wpbl2026-teams.js";

const outfile = `${import.meta.dirname}/wpbl2026-start.json`;

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
  "seriesDescription": "Regular Season",
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
  const ids = `
01a0079d-1b2e-7000-a8d9-ae6f42616786
01a0079d-1b3c-7000-9c20-2a32335cadd3
01a0079d-1b3c-7001-aab4-1db927086d2e
01a0079d-1b3c-7002-893a-79c489825d29
01a0079d-1b3c-7003-baa4-6030e3f6f6e0
01a0079d-1b3c-7004-ab27-c2e4b3606a72
01a0079d-1b3c-7005-a543-1837593de3ca
01a0079d-1b3c-7006-a0c8-5607c4cb8751
01a0079d-1b3c-7007-9188-f9f33e829b69
01a0079d-1b3c-7008-93fb-b7656acd4a9f
01a0079d-1b3c-7009-a3e1-0868ff96af25
01a0079d-1b3c-700a-aca2-c7b300d5b78c
01a0079d-1b3c-700b-8f29-e259b9106a57
01a0079d-1b3c-700c-83d7-31b95b87d05f
01a0079d-1b3c-700d-a09e-1b625178f9a1
01a0079d-1b3c-700e-b8b1-b5ba4dc7057f
01a0079d-1b3c-700f-b539-ff8603e162f5
01a0079d-1b3c-7010-85bf-c9e3391e107a
01a0079d-1b3c-7011-8ff5-6e7b98aab713
01a0079d-1b3c-7012-a0cc-e1189bd58247
01a0079d-1b3c-7013-90e3-84fe7eece072
01a0079d-1b3c-7014-94e9-f9557748fed0
01a0079d-1b3c-7015-b568-1796c89c6bcd
01a0079d-1b3c-7016-aec2-33233519646d
01a0079d-1b3c-7017-8a0b-5ce834798cfe
01a0079d-1b3c-7018-a2ae-ed3119c59b39
01a0079d-1b3c-7019-a8fb-cd2f9c564a7e
01a0079d-1b3c-701a-96ee-90229b7ca18c
01a0079d-1b3c-701b-85d7-1d7244761484
01a0079d-1b3c-701c-9f92-48190d26fa98
`.trim().split("\n");

  yield* ids;
}
