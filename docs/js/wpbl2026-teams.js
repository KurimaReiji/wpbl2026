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
`;

const updates = `
{"effectiveDate": "2026-08-10", "op": "replace", "path": "/WPBL001/manager", "value": "Jemile Weeks"}
`;

// パッチデータをまとめる（ソート済みにしておく）
const allPatches = `${ops.trim()}\n${updates.trim()}`
  .trim()
  .split("\n")
  .map((line) => JSON.parse(line))
  .sort((a, b) => a.effectiveDate.localeCompare(b.effectiveDate));

/**
 * 指定日付時点のチームデータを復元して取得する
 * @param {string} [date] - ISO日付文字列 (省略した場合は全パッチを適用)
 */
function getTeams(date) {
  // 空のデータベースを生成
  const db = [1, 2, 3, 4]
    .map((i) => {
      const team = createTeamProfile();
      team.code = `WPBL${String(i).padStart(3, "0")}`;
      return team;
    })
    .reduce((acc, cur) => {
      acc[cur.code] = cur;
      return acc;
    }, {});

  // date が指定されている場合はその日付までのパッチ、なければ全パッチを適用
  const targetPatches = date
    ? allPatches.filter(({ effectiveDate }) => effectiveDate <= date)
    : allPatches;

  const resultDb = applyPatch(db, targetPatches, { mutateDocument: false }).newDocument;
  return Object.values(resultDb);
}

// Teams は引数なし getTeams() の実行結果（＝最新状態）を入れるだけでOK！
const Teams = getTeams();

function findTeam(str, teams = Teams) {
  return teams.find((t) => Object.values(t).includes(str)) ?? {};
}

export {
  Teams,
  findTeam,
  getTeams,
}