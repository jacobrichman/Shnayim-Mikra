import { spawnSync } from 'node:child_process';
// Prepare current reading and the next two weekly readings, skipping saved data.
const today = new Intl.DateTimeFormat('en-CA', {timeZone:'Asia/Jerusalem',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
const base = new Date((process.env.PARSHA_DATE || today) + 'T12:00:00Z');
let failed = false;
for (const days of [0, 7, 14]) {
  const date = new Date(base); date.setUTCDate(date.getUTCDate() + days);
  const child = spawnSync(process.execPath, ['scripts/generate-phrases.mjs'], {stdio:'inherit',env:{...process.env,PARSHA_DATE:date.toISOString().slice(0,10)}});
  if (child.status !== 0) { failed = true; break; }
}
if (failed) process.exit(1);
