const COLOR_LABELS = {
  red: "赤", blue: "青", green: "緑", yellow: "黄", black: "黒", white: "白", orange: "橙",
};

let ALL_MOTIFS = [];
let COUNTRY_MAP = new Map();
let FLAG_COLORS = {};
let activeColor = "all";

function flagCard(code) {
  const c = COUNTRY_MAP.get(code);
  if (!c) return "";
  return `
    <a class="country-card" href="country.html?id=${c.id}">
      <img class="flag" src="assets/flags/${code}.svg" alt="${c.nameEn}の国旗" loading="lazy" />
      <h3>${c.name}</h3>
      <p>${c.nameEn}</p>
    </a>`;
}

function motifSection(motif) {
  const countries = activeColor === "all"
    ? motif.countries
    : motif.countries.filter((code) => (FLAG_COLORS[code] || []).includes(activeColor));

  if (countries.length === 0) return "";

  const cards = countries.map(flagCard).join("");
  return `
    <div id="motif-${motif.key}" class="motif-block">
      <div class="letter-group-title">${motif.label}(${countries.length}か国)</div>
      <p class="section-intro">${motif.meaning}</p>
      <div class="country-grid">${cards}</div>
    </div>`;
}

function renderMotifNav() {
  const nav = document.getElementById("motif-nav");
  if (!nav) return;
  nav.innerHTML = ALL_MOTIFS.map((m) => `<a href="#motif-${m.key}">${m.label}</a>`).join("");
}

function renderColorTabs() {
  const tabs = document.getElementById("color-tabs");
  if (!tabs) return;
  const colors = Object.keys(COLOR_LABELS);
  tabs.innerHTML =
    `<button class="active" data-color="all">すべての色</button>` +
    colors.map((c) => `<button data-color="${c}">${COLOR_LABELS[c]}</button>`).join("");
  tabs.querySelectorAll("button").forEach((btn) => {
    btn.addEventListener("click", () => {
      tabs.querySelectorAll("button").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      activeColor = btn.dataset.color;
      renderMotifs();
    });
  });
}

function renderMotifs() {
  const container = document.getElementById("motif-list");
  if (!container) return;
  container.innerHTML = ALL_MOTIFS.map(motifSection).join("");
}

async function initFlagsPage() {
  const [motifs, countries, colors] = await Promise.all([
    fetch("data/flag_motifs.json").then((r) => r.json()),
    fetchCountries(),
    fetch("data/flag_colors.json").then((r) => r.json()),
  ]);
  ALL_MOTIFS = motifs;
  COUNTRY_MAP = new Map(countries.map((c) => [c.code, c]));
  FLAG_COLORS = colors;

  renderMotifNav();
  renderColorTabs();
  renderMotifs();
}

document.addEventListener("DOMContentLoaded", initFlagsPage);
