// 「新しく追加された国」に表示する国(手動管理・最大6件)。
// 詳細記事が仕上がっている国から選び、増やすときはここに code を足すだけでよい。
const FEATURED_LATEST = ["jp", "fr", "br", "au", "eg", "ke"];

// 今月の世界特集。中身とリンク先はここを書き換えるだけで更新できる。
const MONTHLY_FEATURE = {
  label: "今月の世界特集",
  title: "世界の朝ごはんを巡る",
  desc: "各国の朝は、どんな料理から始まるのでしょう。世界の食卓を旅してみましょう。",
  link: "food.html",
  linkLabel: "世界の食べ物を見る →",
  img: "assets/img/categories/monthly-breakfast.png",
};

function dayOfYear() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now - start;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function todayCard(c) {
  return `
    <div class="today-card">
      <img class="flag" src="assets/flags/${c.code}.svg" alt="${c.nameEn}の国旗" loading="lazy" />
      <div class="today-body">
        <div class="today-num">No.${c.id}</div>
        <h3>${c.name}</h3>
        <div class="today-en">${c.nameEn} ・ 首都: ${c.capital || "準備中"}</div>
        <p class="today-desc">${c.trivia || c.location || "この国の紹介は準備中です。"}</p>
        <a class="today-btn" href="country.html?id=${c.id}">この国を詳しく見る →</a>
      </div>
    </div>`;
}

async function renderHomeHighlights() {
  const countries = await fetchCountries();
  const ready = countries.filter((c) => c.detailReady);
  if (ready.length === 0) return;

  const todayContainer = document.getElementById("today-country");
  const addedContainer = document.getElementById("added-countries");

  const todayIndex = dayOfYear() % ready.length;
  const today = ready[todayIndex];

  if (todayContainer) {
    todayContainer.innerHTML = todayCard(today);
  }

  if (addedContainer) {
    const featured = FEATURED_LATEST
      .map((code) => countries.find((c) => c.code === code))
      .filter(Boolean)
      .slice(0, 6);
    addedContainer.innerHTML = featured.map(countryCard).join("");
  }
}

function renderMonthlyFeature() {
  const container = document.getElementById("monthly-feature");
  if (!container) return;
  const imgHtml = MONTHLY_FEATURE.img
    ? `<img class="monthly-feature-img" src="${MONTHLY_FEATURE.img}" alt="${MONTHLY_FEATURE.title}" loading="lazy" />`
    : "";
  container.innerHTML = `
    <div class="monthly-feature-card">
      ${imgHtml}
      <span class="monthly-label">${MONTHLY_FEATURE.label}</span>
      <h3>${MONTHLY_FEATURE.title}</h3>
      <p>${MONTHLY_FEATURE.desc}</p>
      <a class="today-btn" href="${MONTHLY_FEATURE.link}">${MONTHLY_FEATURE.linkLabel}</a>
    </div>`;
}

function setupHomeSearchForm() {
  const form = document.getElementById("home-search-form");
  if (!form) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const q = document.getElementById("home-search-input").value.trim();
    window.location.href = q ? `search.html?q=${encodeURIComponent(q)}` : "search.html";
  });
}

document.addEventListener("DOMContentLoaded", () => {
  renderHomeHighlights();
  renderMonthlyFeature();
  setupHomeSearchForm();
});
