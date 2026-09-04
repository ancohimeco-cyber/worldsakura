// Runs the full static build in the required order:
//   1. build_entities.js — generates 1 static file per country/animal/people/castle,
//      using country.html/animals.html/peoples.html/castles.html as CLEAN templates
//      (their list containers must still be empty at this point).
//   2. build_lists.js — prerenders the link grids into the actual standalone list pages
//      (countries.html, capitals.html, flags.html, culture.html, food.html, words.html,
//      animals.html, peoples.html, castles.html).
//   3. gen_sitemap.js — regenerates sitemap.xml from current data.
//
// Running build_lists.js before build_entities.js would bake each page's full link grid
// into every entity page's (hidden) template copy too — always run in this order.
const { execFileSync } = require("child_process");
const path = require("path");

const scripts = ["build_entities.js", "build_lists.js", "gen_sitemap.js"];
for (const script of scripts) {
  console.log(`\n=== running ${script} ===`);
  execFileSync(process.execPath, [path.join(__dirname, script)], { stdio: "inherit" });
}
console.log("\nbuild_all complete.");
