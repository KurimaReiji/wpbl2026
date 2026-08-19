import pkg from 'fast-json-patch';
const { applyPatch } = pkg;

const createTeamProfile = () => ({
  "team_id": "",
  "code": "",
  "abbreviation": "",
  "name": "",
  "franchiseName": "",
  "teamName": "",
  "manager": "",
});

const db = [1, 2, 3, 4]
  .map((i) => {
    const team = createTeamProfile();
    team.code = `WPBL${String(i).padStart(3, "0")}`;
    return team;
  })
  .reduce((acc, cur) => {
    acc[cur.code] = cur;
    return acc;
  }, {})
  ;

const ops = `
{"effectiveDate": "2026-07-31", "op": "replace", "path": "/WPBL001/team_id", "value": "9f08or2mffx81409"}
{"effectiveDate": "2026-07-31", "op": "replace", "path": "/WPBL002/team_id", "value": "v4gisr4rbgmn67b0"}
{"effectiveDate": "2026-07-31", "op": "replace", "path": "/WPBL003/team_id", "value": "fttth861nft1j2s7"}
{"effectiveDate": "2026-07-31", "op": "replace", "path": "/WPBL004/team_id", "value": "vhubhz8li07tmgq8"}
{"effectiveDate": "2026-07-31", "op": "replace", "path": "/WPBL001/abbreviation", "value": "BOS"}
{"effectiveDate": "2026-07-31", "op": "replace", "path": "/WPBL002/abbreviation", "value": "LA"}
{"effectiveDate": "2026-07-31", "op": "replace", "path": "/WPBL003/abbreviation", "value": "NY"}
{"effectiveDate": "2026-07-31", "op": "replace", "path": "/WPBL004/abbreviation", "value": "SF"}
{"effectiveDate": "2026-07-31", "op": "replace", "path": "/WPBL001/name", "value": "Boston Hunters"}
{"effectiveDate": "2026-07-31", "op": "replace", "path": "/WPBL002/name", "value": "Los Angeles Queens"}
{"effectiveDate": "2026-07-31", "op": "replace", "path": "/WPBL003/name", "value": "New York Heights"}
{"effectiveDate": "2026-07-31", "op": "replace", "path": "/WPBL004/name", "value": "San Francisco Firebells"}
{"effectiveDate": "2026-07-31", "op": "replace", "path": "/WPBL001/franchiseName", "value": "Boston"}
{"effectiveDate": "2026-07-31", "op": "replace", "path": "/WPBL002/franchiseName", "value": "Los Angeles"}
{"effectiveDate": "2026-07-31", "op": "replace", "path": "/WPBL003/franchiseName", "value": "New York"}
{"effectiveDate": "2026-07-31", "op": "replace", "path": "/WPBL004/franchiseName", "value": "San Francisco"}
{"effectiveDate": "2026-07-31", "op": "replace", "path": "/WPBL001/teamName", "value": "Hunters"}
{"effectiveDate": "2026-07-31", "op": "replace", "path": "/WPBL002/teamName", "value": "Queens"}
{"effectiveDate": "2026-07-31", "op": "replace", "path": "/WPBL003/teamName", "value": "Heights"}
{"effectiveDate": "2026-07-31", "op": "replace", "path": "/WPBL004/teamName", "value": "Firebells"}
{"effectiveDate": "2026-07-31", "op": "replace", "path": "/WPBL001/manager", "value": "Keith Foulke"}
{"effectiveDate": "2026-07-31", "op": "replace", "path": "/WPBL002/manager", "value": "Eric Young Sr."}
{"effectiveDate": "2026-07-31", "op": "replace", "path": "/WPBL003/manager", "value": "Rachelle \\"Rocky\\" Henley"}
{"effectiveDate": "2026-07-31", "op": "replace", "path": "/WPBL004/manager", "value": "Matt Williams"}
{"effectiveDate": "2026-08-10", "op": "replace", "path": "/WPBL001/manager", "value": "Jemile Weeks"}
`;

const patches = ops.trim().split("\n").map((line) => JSON.parse(line));
applyPatch(db, patches, { mutateDocument: true });

const data = Object.values(db);
const output = JSON.stringify(data, null, 2);
console.log(output);
