// One-off migration: adds the events.html nav link (年中行事・今日は何の日) right after
// souvenirs100.html in every HTML file's nav-dropdown-menu. Idempotent: skips files that
// already contain the link. Run once after adding the events.html page; not part of build_all.js
// because the nav list itself is duplicated into every static file rather than templated.
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const files = fs.readdirSync(root).filter((f) => f.endsWith(".html"));

const OLD = `<a href="souvenirs100.html">お土産100選</a>`;
const NEW = `<a href="souvenirs100.html">お土産100選</a>\n          <a href="events.html">年中行事・今日は何の日</a>`;

let updated = 0;
let skippedNoMatch = 0;
let skippedAlready = 0;

for (const f of files) {
  const fp = path.join(root, f);
  let html = fs.readFileSync(fp, "utf8");
  if (html.includes('href="events.html"')) {
    skippedAlready++;
    continue;
  }
  if (!html.includes(OLD)) {
    skippedNoMatch++;
    continue;
  }
  html = html.replace(OLD, NEW);
  fs.writeFileSync(fp, html);
  updated++;
}

console.log("updated:", updated, "skippedAlready:", skippedAlready, "skippedNoMatch:", skippedNoMatch, "total:", files.length);
