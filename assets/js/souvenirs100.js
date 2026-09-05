const SOUVENIR_GENRES = [
  { name: "お菓子・スイーツ", cls: "g1" },
  { name: "ドラッグストア・日用品", cls: "g2" },
  { name: "伝統工芸・和雑貨", cls: "g3" },
  { name: "アニメ・キャラクター・ポップカルチャー", cls: "g4" },
  { name: "食品・調味料・お酒", cls: "g5" },
];

let ALL_SOUVENIRS = [];
let activeSouvenirGenre = 0;

async function fetchSouvenirs() {
  const res = await fetch("data/souvenirs100.json");
  return res.json();
}

function souvenirCard(item, cls) {
  const sourcesHtml = (item.sources || [])
    .map((s) => `<a href="${s.url}" target="_blank" rel="noopener">出典</a>`)
    .join(" ");
  return `
    <div class="dish-rank ${cls}">
      <div class="dish-plate">${item.rank}</div>
      <div class="dish-body">
        <h3>${item.name}</h3>
        <div class="dish-en">${item.nameEn}</div>
        <p class="dish-desc">${item.description}</p>
        <div class="dish-evidence">
          <span class="dish-evidence-label">根拠:</span>${item.evidence}
          <div class="dish-src">${sourcesHtml}</div>
        </div>
      </div>
    </div>`;
}

function renderSouvenirTabs() {
  const tabs = document.getElementById("souvenirs100-tabs");
  if (!tabs) return;
  tabs.innerHTML = SOUVENIR_GENRES.map((g, i) => {
    const count = ALL_SOUVENIRS.filter((d) => d.genre === g.name).length;
    return `<button class="${i === activeSouvenirGenre ? "active" : ""}" data-i="${i}">${g.name}(${count})</button>`;
  }).join("");
  tabs.querySelectorAll("button").forEach((btn) => {
    btn.addEventListener("click", () => {
      activeSouvenirGenre = Number(btn.dataset.i);
      renderSouvenirTabs();
      renderSouvenirList();
    });
  });
}

function renderSouvenirList() {
  const container = document.getElementById("souvenirs100-list");
  const countEl = document.getElementById("souvenirs100-count");
  if (!container) return;
  const g = SOUVENIR_GENRES[activeSouvenirGenre];
  const items = ALL_SOUVENIRS.filter((d) => d.genre === g.name).sort((a, b) => a.rank - b.rank);
  if (countEl) countEl.textContent = `${g.name} ・ 全${items.length}品`;
  container.innerHTML = `<div class="dish-list">${items.map((item) => souvenirCard(item, g.cls)).join("")}</div>`;
}

async function initSouvenirsPage() {
  ALL_SOUVENIRS = await fetchSouvenirs();
  renderSouvenirTabs();
  renderSouvenirList();
}

document.addEventListener("DOMContentLoaded", initSouvenirsPage);
