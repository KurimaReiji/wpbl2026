# Schedule

1. fetch calendar => events.json

```
$ bun fetch-schedule.bun.js
```

2. create initial database => wpbl2026-start.json

```
$ bun create-initialdb.bun.js
```

3. get gameIds => wpbl2026-patch-gameIds.jsonl

```
$ bun create-patch-gameid.bun.js
```

4. apply wpbl2026-patch-gameIds.jsonl to wpbl2026-start.json => wpbl2026-current.json

```
$ bun apply-patches.bun.js
```

5. get boxscores => wpbl2026-patch-boxscores.jsonl

```
$ bun create-patch-boxscore.bun.js
```

6. apply wpbl2026-patch-boxscores.jsonl to wpbl2026-start.json => wpbl2026-current.json

```
$ bun apply-patches.bun.js
```