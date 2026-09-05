const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const { renderCountryBody } = require(path.join(root, "assets/js/templates/country-template.js"));
const { renderAnimalBody } = require(path.join(root, "assets/js/templates/animal-template.js"));
const { renderPeopleBody } = require(path.join(root, "assets/js/templates/people-template.js"));
const { renderCastleBody } = require(path.join(root, "assets/js/templates/castle-template.js"));

function slugify(text) {
  return (text || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function injectHead(templateHtml, { title, description, canonicalPath, ogImage, breadcrumb, extraJsonLd }) {
  const canonicalUrl = "https://worldsakura.com/" + canonicalPath;
  const esc = (s) => String(s).replace(/"/g, "&quot;");
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumb.map((b, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: b.name,
      item: "https://worldsakura.com/" + b.path,
    })),
  };

  const jsonLdScripts = [breadcrumbLd, ...(extraJsonLd ? [extraJsonLd] : [])]
    .map((obj) => `<script type="application/ld+json">${JSON.stringify(obj)}</script>`)
    .join("\n  ");

  const metaBlock = `<title>${title}</title>
  <meta name="description" content="${esc(description)}" />
  <link rel="canonical" href="${canonicalUrl}" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="世界の図鑑 WORLD SAKURA" />
  <meta property="og:title" content="${esc(title)}" />
  <meta property="og:description" content="${esc(description)}" />
  <meta property="og:url" content="${canonicalUrl}" />
  <meta property="og:image" content="${ogImage}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${esc(title)}" />
  <meta name="twitter:description" content="${esc(description)}" />
  <meta name="twitter:image" content="${ogImage}" />
  ${jsonLdScripts}`;

  return templateHtml.replace(/<title>[\s\S]*?<\/title>[\s\S]*?(?=\s*<link rel="icon")/, metaBlock + "\n  ");
}

function injectSingleRoot(templateHtml, rootId, bodyHtml) {
  const re = new RegExp(`(<main id="${rootId}"[^>]*>)([\\s\\S]*?)(</main>)`);
  if (!re.test(templateHtml)) {
    throw new Error(`could not find <main id="${rootId}"> in template`);
  }
  return templateHtml.replace(re, `$1\n${bodyHtml}\n    $3`);
}

// animals.html/peoples.html/castles.html are BOTH the live list page (maintained by
// build_lists.js, which fills their #<x>-list div with hundreds of real links) AND the
// template this script reads to build each entity's detail page. Before treating one as
// a template we must reset its list container back to empty, or every generated detail
// page would silently carry a full hidden copy of the entire list.
function stripContainer(html, id) {
  const openTagRe = new RegExp(`<div id="${id}"[^>]*>`);
  const openMatch = openTagRe.exec(html);
  if (!openMatch) throw new Error(`container #${id} not found`);
  const openTag = openMatch[0];
  const contentStart = openMatch.index + openTag.length;

  let depth = 1;
  let closeIndex = -1;
  const tagRe = /<div\b[^>]*>|<\/div>/g;
  tagRe.lastIndex = contentStart;
  let m;
  while ((m = tagRe.exec(html))) {
    if (m[0] === "</div>") {
      depth--;
      if (depth === 0) {
        closeIndex = m.index;
        break;
      }
    } else {
      depth++;
    }
  }
  if (closeIndex === -1) throw new Error(`unbalanced <div> while locating #${id}'s closing tag`);
  return html.slice(0, contentStart) + html.slice(closeIndex);
}

function injectDetailWithListHide(templateHtml, detailId, listSectionId, bodyHtml) {
  const listRe = new RegExp(`(<section class="section page-title-section" id="${listSectionId}")(>)`);
  const detailRe = new RegExp(`<div id="${detailId}" hidden></div>`);
  if (!listRe.test(templateHtml)) throw new Error(`could not find list section #${listSectionId}`);
  if (!detailRe.test(templateHtml)) throw new Error(`could not find detail div #${detailId}`);
  let out = templateHtml.replace(listRe, `$1 hidden$2`);
  out = out.replace(detailRe, `<div id="${detailId}">\n${bodyHtml}\n    </div>`);
  return out;
}

function truncate(s, n) {
  s = (s || "").replace(/\s+/g, " ").trim();
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}

let totalWritten = 0;

// ---- Countries ----
{
  const template = fs.readFileSync(path.join(root, "country.html"), "utf8");
  const countries = require(path.join(root, "data/countries.json"));
  const animals = require(path.join(root, "data/animals.json"));
  const motifs = require(path.join(root, "data/flag_motifs.json"));

  for (const c of countries) {
    const fileName = `country-${c.id}-${slugify(c.nameEn)}.html`;
    const title = `${c.name}(${c.nameEn}) | 世界の図鑑`;
    // Lead with something country-specific (formation story) rather than a boilerplate
    // opener repeated identically on all 193 pages — same instinct as varied thumbnails.
    const leadIn = c.formation ? c.formation : `${c.name}の位置・首都・人口・文化などを紹介する国別ページです。`;
    const description = truncate(`${leadIn} 首都・政治体制・言語・食文化・国旗の由来なども掲載。`, 150);

    const motif = motifs.find((m) => m.countries.includes(c.code));
    const countryAnimals = animals.filter((a) => a.countries.includes(c.code));
    const body = renderCountryBody(c, countryAnimals, motif);

    let html = injectHead(template, {
      title,
      description,
      canonicalPath: fileName,
      ogImage: `https://worldsakura.com/assets/flags/${c.code}.svg`,
      breadcrumb: [
        { name: "ホーム", path: "" },
        { name: "193か国", path: "countries.html" },
        { name: c.name, path: fileName },
      ],
      extraJsonLd: {
        "@context": "https://schema.org",
        "@type": "Country",
        name: c.name,
        alternateName: c.nameEn,
        url: `https://worldsakura.com/${fileName}`,
      },
    });
    html = injectSingleRoot(html, "country-root", body);
    fs.writeFileSync(path.join(root, fileName), html);
    totalWritten++;
  }
  console.log("countries:", countries.length);
}

// ---- Animals ----
{
  const template = stripContainer(fs.readFileSync(path.join(root, "animals.html"), "utf8"), "animal-list");
  const animals = require(path.join(root, "data/animals.json"));
  const countries = require(path.join(root, "data/countries.json"));
  const countryMap = new Map(countries.map((c) => [c.code, c]));

  for (const a of animals) {
    const fileName = `animal-${a.key}.html`;
    const title = `${a.name} | 世界の図鑑`;
    const description = truncate(a.blurb || `${a.name}(${a.nameEn})について紹介します。`, 140);
    const body = renderAnimalBody(a, countryMap);

    let html = injectHead(template, {
      title,
      description,
      canonicalPath: fileName,
      ogImage: a.img ? `https://worldsakura.com/${a.img}` : "https://worldsakura.com/assets/img/page-bg.png",
      breadcrumb: [
        { name: "ホーム", path: "" },
        { name: "世界の動物・自然", path: "animals.html" },
        { name: a.name, path: fileName },
      ],
    });
    html = injectDetailWithListHide(html, "animal-detail", "animal-list-section", body);
    fs.writeFileSync(path.join(root, fileName), html);
    totalWritten++;
  }
  console.log("animals:", animals.length);
}

// ---- Peoples ----
{
  const template = stripContainer(fs.readFileSync(path.join(root, "peoples.html"), "utf8"), "peoples-list");
  const peoples = require(path.join(root, "data/peoples.json"));
  const countries = require(path.join(root, "data/countries.json"));
  const countryMap = new Map(countries.map((c) => [c.code, c]));

  for (const p of peoples) {
    const fileName = `people-${p.key}.html`;
    const title = `${p.name} | 世界の図鑑`;
    const description = truncate(p.history || `${p.name}(${p.nameEn})の暮らし・言語・文化を紹介します。`, 140);
    const body = renderPeopleBody(p, countryMap);

    let html = injectHead(template, {
      title,
      description,
      canonicalPath: fileName,
      ogImage: p.img ? `https://worldsakura.com/${p.img}` : "https://worldsakura.com/assets/img/page-bg.png",
      breadcrumb: [
        { name: "ホーム", path: "" },
        { name: "世界の民族・人びと", path: "peoples.html" },
        { name: p.name, path: fileName },
      ],
    });
    html = injectDetailWithListHide(html, "peoples-detail", "peoples-list-section", body);
    fs.writeFileSync(path.join(root, fileName), html);
    totalWritten++;
  }
  console.log("peoples:", peoples.length);
}

// ---- Castles ----
{
  const template = stripContainer(fs.readFileSync(path.join(root, "castles.html"), "utf8"), "castles-list");
  const castles = require(path.join(root, "data/castles.json"));
  const countries = require(path.join(root, "data/countries.json"));
  const countryMap = new Map(countries.map((c) => [c.code, c]));

  for (const c of castles) {
    const fileName = `castle-${c.key}.html`;
    const title = `${c.name} | 世界の図鑑`;
    const description = truncate(c.history || `${c.name}(${c.nameEn})の歴史・様式・見どころを紹介します。`, 140);
    const body = renderCastleBody(c, countryMap);

    let html = injectHead(template, {
      title,
      description,
      canonicalPath: fileName,
      ogImage: c.img
        ? c.img.startsWith("http")
          ? c.img
          : `https://worldsakura.com/${c.img}`
        : "https://worldsakura.com/assets/img/page-bg.png",
      breadcrumb: [
        { name: "ホーム", path: "" },
        { name: "世界のお城", path: "castles.html" },
        { name: c.name, path: fileName },
      ],
    });
    html = injectDetailWithListHide(html, "castles-detail", "castles-list-section", body);
    fs.writeFileSync(path.join(root, fileName), html);
    totalWritten++;
  }
  console.log("castles:", castles.length);
}

console.log("total entity pages written:", totalWritten);
