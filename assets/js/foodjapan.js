const FOODJAPAN_GENRES = [
  { name: "ちゃんとした食事・名物料理", cls: "g1" },
  { name: "B級グルメ・ご当地グルメ", cls: "g2" },
  { name: "スイーツ・和菓子", cls: "g3" },
  { name: "コンビニ・スーパーグルメ", cls: "g4" },
  { name: "飲み物・お酒", cls: "g5" },
];

let ALL_DISHES = [];
let activeGenre = 0;

async function fetchFoodJapan() {
  const res = await fetch("data/japan_food100.json");
  return res.json();
}

function dishCard(item, cls) {
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

function renderTabs() {
  const tabs = document.getElementById("foodjapan-tabs");
  if (!tabs) return;
  tabs.innerHTML = FOODJAPAN_GENRES.map((g, i) => {
    const count = ALL_DISHES.filter((d) => d.genre === g.name).length;
    return `<button class="${i === activeGenre ? "active" : ""}" data-i="${i}">${g.name}(${count})</button>`;
  }).join("");
  tabs.querySelectorAll("button").forEach((btn) => {
    btn.addEventListener("click", () => {
      activeGenre = Number(btn.dataset.i);
      renderTabs();
      renderList();
    });
  });
}

function renderList() {
  const container = document.getElementById("foodjapan-list");
  const countEl = document.getElementById("foodjapan-count");
  if (!container) return;
  const g = FOODJAPAN_GENRES[activeGenre];
  const items = ALL_DISHES.filter((d) => d.genre === g.name).sort((a, b) => a.rank - b.rank);
  if (countEl) countEl.textContent = `${g.name} ・ 全${items.length}品`;
  container.innerHTML = `<div class="dish-list">${items.map((item) => dishCard(item, g.cls)).join("")}</div>`;
}

async function initFoodJapanPage() {
  ALL_DISHES = await fetchFoodJapan();
  renderTabs();
  renderList();
}

document.addEventListener("DOMContentLoaded", initFoodJapanPage);
