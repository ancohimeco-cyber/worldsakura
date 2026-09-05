const MONTH_LABELS = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];
const REGION_CLASS = { japan: "g1", world: "g2" };
const REGION_LABEL = { japan: "🇯🇵 日本の行事", world: "🌍 世界の行事" };
const DAILY_CLASS_CYCLE = ["g1", "g2", "g3", "g4", "g5"];

let ALL_MONTHLY = [];
let ALL_DAILY = [];
let activeView = "monthly";
let activeMonthlyMonth = new Date().getMonth() + 1;
let activeDailyMonth = new Date().getMonth() + 1;

async function fetchEventsData() {
  const [monthlyRes, dailyRes] = await Promise.all([
    fetch("data/monthly_events.json"),
    fetch("data/today_events.json"),
  ]);
  return [await monthlyRes.json(), await dailyRes.json()];
}

function todayKey() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${mm}-${dd}`;
}

function monthlyCard(item) {
  const cls = REGION_CLASS[item.region] || "g1";
  const sourcesHtml = (item.sources || [])
    .map((s) => `<a href="${s.url}" target="_blank" rel="noopener">出典</a>`)
    .join(" ");
  const flag = item.region === "world" ? "🌍" : "🇯🇵";
  return `
    <div class="spot-rank ${cls}">
      <div class="spot-plate">${flag}</div>
      <div class="spot-body">
        <h3>${item.name}</h3>
        <div class="spot-en">${item.nameEn || ""} ・ ${item.dateInfo || ""}</div>
        <p class="spot-desc">${item.description}</p>
        <div class="spot-src">${sourcesHtml}</div>
      </div>
    </div>`;
}

function renderViewTabs() {
  const tabs = document.getElementById("events-view-tabs");
  if (!tabs) return;
  tabs.querySelectorAll("button").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.view === activeView);
    btn.onclick = () => {
      activeView = btn.dataset.view;
      renderViewTabs();
      document.getElementById("events-monthly-view").hidden = activeView !== "monthly";
      document.getElementById("events-daily-view").hidden = activeView !== "daily";
    };
  });
}

function renderMonthlyTabs() {
  const tabs = document.getElementById("events-monthly-tabs");
  if (!tabs) return;
  tabs.innerHTML = MONTH_LABELS.map((label, i) => {
    const m = i + 1;
    const count = ALL_MONTHLY.filter((e) => e.month === m).length;
    return `<button class="${m === activeMonthlyMonth ? "active" : ""}" data-m="${m}">${label}(${count})</button>`;
  }).join("");
  tabs.querySelectorAll("button").forEach((btn) => {
    btn.addEventListener("click", () => {
      activeMonthlyMonth = Number(btn.dataset.m);
      renderMonthlyTabs();
      renderMonthlyList();
    });
  });
}

function renderMonthlyList() {
  const container = document.getElementById("events-monthly-list");
  const countEl = document.getElementById("events-monthly-count");
  if (!container) return;
  const items = ALL_MONTHLY.filter((e) => e.month === activeMonthlyMonth);
  if (countEl) countEl.textContent = `${MONTH_LABELS[activeMonthlyMonth - 1]}の行事 ・ 全${items.length}件`;
  const groups = ["japan", "world"]
    .map((region) => {
      const regionItems = items.filter((e) => e.region === region);
      if (!regionItems.length) return "";
      return `
        <div class="letter-group-title">${REGION_LABEL[region]}</div>
        <div class="dish-list">${regionItems.map(monthlyCard).join("")}</div>`;
    })
    .join("");
  container.innerHTML = groups || `<p class="empty-state">準備中です</p>`;
}

function dailyDayCard(entry, cls, isToday) {
  const [mm, dd] = entry.date.split("-").map(Number);
  const itemsHtml = (entry.items || [])
    .map((it) => `<li><strong>${it.name}</strong> — ${it.description}</li>`)
    .join("");
  const sourceHtml = entry.source
    ? `<div class="spot-src"><a href="${entry.source}" target="_blank" rel="noopener">出典</a></div>`
    : "";
  return `
    <div class="spot-rank ${cls}${isToday ? " is-today" : ""}" id="day-${entry.date}">
      <div class="spot-plate date-plate">${mm}/${dd}</div>
      <div class="spot-body">
        <h3>${mm}月${dd}日は何の日？</h3>
        <ul class="today-items">${itemsHtml}</ul>
        ${sourceHtml}
      </div>
    </div>`;
}

function renderTodayBanner() {
  const banner = document.getElementById("events-today-banner");
  if (!banner) return;
  const key = todayKey();
  const entry = ALL_DAILY.find((e) => e.date === key);
  if (!entry) {
    banner.innerHTML = "";
    return;
  }
  const [mm, dd] = entry.date.split("-").map(Number);
  const itemsHtml = (entry.items || [])
    .map((it) => `<li><strong>${it.name}</strong> — ${it.description}</li>`)
    .join("");
  banner.innerHTML = `
    <h3>🎉 今日、${mm}月${dd}日は何の日？</h3>
    <ul class="today-items">${itemsHtml}</ul>`;
}

function renderDailyTabs() {
  const tabs = document.getElementById("events-daily-tabs");
  if (!tabs) return;
  tabs.innerHTML = MONTH_LABELS.map((label, i) => {
    const m = i + 1;
    return `<button class="${m === activeDailyMonth ? "active" : ""}" data-m="${m}">${label}</button>`;
  }).join("");
  tabs.querySelectorAll("button").forEach((btn) => {
    btn.addEventListener("click", () => {
      activeDailyMonth = Number(btn.dataset.m);
      renderDailyTabs();
      renderDailyList();
    });
  });
}

function renderDailyList() {
  const container = document.getElementById("events-daily-list");
  const countEl = document.getElementById("events-daily-count");
  if (!container) return;
  const key = todayKey();
  const items = ALL_DAILY.filter((e) => e.month === activeDailyMonth).sort((a, b) => a.day - b.day);
  if (countEl) countEl.textContent = `${MONTH_LABELS[activeDailyMonth - 1]} ・ 全${items.length}日`;
  container.innerHTML = `<div class="dish-list">${items
    .map((entry, i) => dailyDayCard(entry, DAILY_CLASS_CYCLE[i % DAILY_CLASS_CYCLE.length], entry.date === key))
    .join("")}</div>`;
}

async function initEventsPage() {
  [ALL_MONTHLY, ALL_DAILY] = await fetchEventsData();
  renderViewTabs();
  renderMonthlyTabs();
  renderMonthlyList();
  renderTodayBanner();
  renderDailyTabs();
  renderDailyList();
}

document.addEventListener("DOMContentLoaded", initEventsPage);
