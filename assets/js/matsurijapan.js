const MATSURIJAPAN_GENRES = [
  { name: "三大祭・都市部の大規模祭り", cls: "g1" },
  { name: "花火大会", cls: "g2" },
  { name: "雪・氷の祭り", cls: "g3" },
  { name: "奇祭・伝統儀式的な祭り", cls: "g4" },
  { name: "季節の祭り・イルミネーション", cls: "g5" },
];

let ALL_MATSURI = [];
let activeMatsuriGenre = 0;

async function fetchMatsuriJapan() {
  const res = await fetch("data/japan_matsuri100.json");
  return res.json();
}

function matsuriCard(item, cls) {
  const sourcesHtml = (item.sources || [])
    .map((s) => `<a href="${s.url}" target="_blank" rel="noopener">出典</a>`)
    .join(" ");
  return `
    <div class="spot-rank ${cls}">
      <div class="spot-plate">${item.rank}</div>
      <div class="spot-body">
        <h3>${item.name}</h3>
        <div class="spot-en">${item.nameEn} ・ ${item.location || ""} ・ ${item.season || ""}</div>
        <p class="spot-desc">${item.description}</p>
        <div class="spot-evidence">
          <span class="spot-evidence-label">根拠:</span>${item.evidence}
          <div class="spot-src">${sourcesHtml}</div>
        </div>
      </div>
    </div>`;
}

function renderMatsuriTabs() {
  const tabs = document.getElementById("matsurijapan-tabs");
  if (!tabs) return;
  tabs.innerHTML = MATSURIJAPAN_GENRES.map((g, i) => {
    const count = ALL_MATSURI.filter((d) => d.genre === g.name).length;
    return `<button class="${i === activeMatsuriGenre ? "active" : ""}" data-i="${i}">${g.name}(${count})</button>`;
  }).join("");
  tabs.querySelectorAll("button").forEach((btn) => {
    btn.addEventListener("click", () => {
      activeMatsuriGenre = Number(btn.dataset.i);
      renderMatsuriTabs();
      renderMatsuriList();
    });
  });
}

function renderMatsuriList() {
  const container = document.getElementById("matsurijapan-list");
  const countEl = document.getElementById("matsurijapan-count");
  if (!container) return;
  const g = MATSURIJAPAN_GENRES[activeMatsuriGenre];
  const items = ALL_MATSURI.filter((d) => d.genre === g.name).sort((a, b) => a.rank - b.rank);
  if (countEl) countEl.textContent = `${g.name} ・ 全${items.length}件`;
  container.innerHTML = `<div class="dish-list">${items.map((item) => matsuriCard(item, g.cls)).join("")}</div>`;
}

async function initMatsuriJapanPage() {
  ALL_MATSURI = await fetchMatsuriJapan();
  renderMatsuriTabs();
  renderMatsuriList();
}

document.addEventListener("DOMContentLoaded", initMatsuriJapanPage);
