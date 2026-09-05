const SPOTJAPAN_GENRES = [
  { name: "定番観光名所・寺社仏閣", cls: "g1" },
  { name: "自然・絶景スポット", cls: "g2" },
  { name: "テーマパーク・エンタメ施設", cls: "g3" },
  { name: "体験・癒し施設", cls: "g4" },
  { name: "ショッピング・街歩きエリア", cls: "g5" },
];

let ALL_SPOTS = [];
let activeSpotGenre = 0;

async function fetchSpotJapan() {
  const res = await fetch("data/japan_spot100.json");
  return res.json();
}

function spotCard(item, cls) {
  const sourcesHtml = (item.sources || [])
    .map((s) => `<a href="${s.url}" target="_blank" rel="noopener">出典</a>`)
    .join(" ");
  return `
    <div class="spot-rank ${cls}">
      <div class="spot-plate">${item.rank}</div>
      <div class="spot-body">
        <h3>${item.name}</h3>
        <div class="spot-en">${item.nameEn} ・ ${item.location || ""}</div>
        <p class="spot-desc">${item.description}</p>
        <div class="spot-evidence">
          <span class="spot-evidence-label">根拠:</span>${item.evidence}
          <div class="spot-src">${sourcesHtml}</div>
        </div>
      </div>
    </div>`;
}

function renderSpotTabs() {
  const tabs = document.getElementById("spotjapan-tabs");
  if (!tabs) return;
  tabs.innerHTML = SPOTJAPAN_GENRES.map((g, i) => {
    const count = ALL_SPOTS.filter((d) => d.genre === g.name).length;
    return `<button class="${i === activeSpotGenre ? "active" : ""}" data-i="${i}">${g.name}(${count})</button>`;
  }).join("");
  tabs.querySelectorAll("button").forEach((btn) => {
    btn.addEventListener("click", () => {
      activeSpotGenre = Number(btn.dataset.i);
      renderSpotTabs();
      renderSpotList();
    });
  });
}

function renderSpotList() {
  const container = document.getElementById("spotjapan-list");
  const countEl = document.getElementById("spotjapan-count");
  if (!container) return;
  const g = SPOTJAPAN_GENRES[activeSpotGenre];
  const items = ALL_SPOTS.filter((d) => d.genre === g.name).sort((a, b) => a.rank - b.rank);
  if (countEl) countEl.textContent = `${g.name} ・ 全${items.length}件`;
  container.innerHTML = `<div class="dish-list">${items.map((item) => spotCard(item, g.cls)).join("")}</div>`;
}

async function initSpotJapanPage() {
  ALL_SPOTS = await fetchSpotJapan();
  renderSpotTabs();
  renderSpotList();
}

document.addEventListener("DOMContentLoaded", initSpotJapanPage);
