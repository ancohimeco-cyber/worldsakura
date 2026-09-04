const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");

function slugify(text) {
  return (text || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function injectHead(templateHtml, { title, description, canonicalPath, ogImage, breadcrumb }) {
  const canonicalUrl = "https://worldsakura.com/" + canonicalPath;
  const esc = (s) => String(s).replace(/"/g, "&quot;");
  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumb.map((b, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: b.name,
      item: "https://worldsakura.com/" + b.path,
    })),
  });

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
  <script type="application/ld+json">${jsonLd}</script>`;

  return templateHtml.replace(/<title>[\s\S]*?<\/title>[\s\S]*?(?=\s*<link rel="icon")/, metaBlock + "\n  ");
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
  for (const c of countries) {
    const fileName = `country-${c.id}-${slugify(c.nameEn)}.html`;
    const title = `${c.name}(${c.nameEn}) | 世界の図鑑`;
    const description = truncate(
      `${c.name}の位置・首都・人口・政治体制・言語・食文化・自然・国旗の由来などを紹介。${c.formation || ""}`,
      140
    );
    const html = injectHead(template, {
      title,
      description,
      canonicalPath: fileName,
      ogImage: `https://worldsakura.com/assets/flags/${c.code}.svg`,
      breadcrumb: [
        { name: "ホーム", path: "" },
        { name: "193か国", path: "countries.html" },
        { name: c.name, path: fileName },
      ],
    });
    fs.writeFileSync(path.join(root, fileName), html);
    totalWritten++;
  }
  console.log("countries:", countries.length);
}

// ---- Animals ----
{
  const template = fs.readFileSync(path.join(root, "animals.html"), "utf8");
  const animals = require(path.join(root, "data/animals.json"));
  for (const a of animals) {
    const fileName = `animal-${a.key}.html`;
    const title = `${a.name} | 世界の図鑑`;
    const description = truncate(a.blurb || `${a.name}(${a.nameEn})について紹介します。`, 140);
    const html = injectHead(template, {
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
    fs.writeFileSync(path.join(root, fileName), html);
    totalWritten++;
  }
  console.log("animals:", animals.length);
}

// ---- Peoples ----
{
  const template = fs.readFileSync(path.join(root, "peoples.html"), "utf8");
  const peoples = require(path.join(root, "data/peoples.json"));
  for (const p of peoples) {
    const fileName = `people-${p.key}.html`;
    const title = `${p.name} | 世界の図鑑`;
    const description = truncate(p.history || `${p.name}(${p.nameEn})の暮らし・言語・文化を紹介します。`, 140);
    const html = injectHead(template, {
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
    fs.writeFileSync(path.join(root, fileName), html);
    totalWritten++;
  }
  console.log("peoples:", peoples.length);
}

// ---- Castles ----
{
  const template = fs.readFileSync(path.join(root, "castles.html"), "utf8");
  const castles = require(path.join(root, "data/castles.json"));
  for (const c of castles) {
    const fileName = `castle-${c.key}.html`;
    const title = `${c.name} | 世界の図鑑`;
    const description = truncate(c.history || `${c.name}(${c.nameEn})の歴史・様式・見どころを紹介します。`, 140);
    const html = injectHead(template, {
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
    fs.writeFileSync(path.join(root, fileName), html);
    totalWritten++;
  }
  console.log("castles:", castles.length);
}

console.log("total entity pages written:", totalWritten);
