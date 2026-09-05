const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const countries = require(path.join(root, "data/countries.json"));
const animals = require(path.join(root, "data/animals.json"));
const peoples = require(path.join(root, "data/peoples.json"));
const castles = require(path.join(root, "data/castles.json"));

const base = "https://worldsakura.com/";
const today = new Date().toISOString().slice(0, 10);

const staticPages = [
  "",
  "countries.html",
  "flags.html",
  "capitals.html",
  "culture.html",
  "food.html",
  "animals.html",
  "words.html",
  "peoples.html",
  "castles.html",
  "search.html",
  "sns.html",
  "about.html",
  "privacy.html",
  "contact.html",
  "foodjapan.html",
];

function slugify(text) {
  return (text || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const urls = [];
staticPages.forEach((p) => urls.push({ loc: base + p, priority: p === "" ? "1.0" : "0.8" }));
countries.forEach((c) =>
  urls.push({ loc: base + `country-${c.id}-${slugify(c.nameEn)}.html`, priority: "0.7" })
);
animals.forEach((a) => urls.push({ loc: base + `animal-${a.key}.html`, priority: "0.6" }));
peoples.forEach((p) => urls.push({ loc: base + `people-${p.key}.html`, priority: "0.6" }));
castles.forEach((c) => urls.push({ loc: base + `castle-${c.key}.html`, priority: "0.6" }));

const xml =
  '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  urls
    .map(
      (u) =>
        "  <url>\n    <loc>" +
        u.loc.replace(/&/g, "&amp;") +
        "</loc>\n    <lastmod>" +
        today +
        "</lastmod>\n    <priority>" +
        u.priority +
        "</priority>\n  </url>"
    )
    .join("\n") +
  "\n</urlset>\n";

fs.writeFileSync(path.join(root, "sitemap.xml"), xml);
console.log("sitemap.xml written:", urls.length, "urls");
