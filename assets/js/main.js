const FILTER_LABELS = {
  all: "すべて",
  language: "言語",
  animal: "生息動物",
  capital: "首都",
  landmark: "観光名所",
};

let countries = [];
let activeFilter = "all";

async function loadCountries() {
  const res = await fetch("data/countries.json");
  countries = await res.json();
  renderAlphabetNav();
  renderCountryList();
}

function renderAlphabetNav() {
  const nav = document.getElementById("alpha-nav");
  if (!nav) return;
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  nav.innerHTML = letters
    .map((l) => `<a href="#letter-${l}">${l}</a>`)
    .join("");
}

function renderCountryList() {
  const container = document.getElementById("country-list");
  if (!container) return;

  const sorted = [...countries].sort((a, b) =>
    a.nameEn.localeCompare(b.nameEn)
  );

  const groups = {};
  sorted.forEach((c) => {
    const letter = c.nameEn[0].toUpperCase();
    if (!groups[letter]) groups[letter] = [];
    groups[letter].push(c);
  });

  container.innerHTML = Object.keys(groups)
    .sort()
    .map((letter) => {
      const cards = groups[letter]
        .map(
          (c) => `
        <a class="country-card" href="country.html?code=${c.code}">
          <div class="flag">${c.flagEmoji}</div>
          <h3>${c.name}</h3>
          <p>${c.nameEn} ・ ${c.capital}</p>
        </a>`
        )
        .join("");
      return `
        <div id="letter-${letter}">
          <div class="letter-group-title">${letter}</div>
          <div class="country-grid">${cards}</div>
        </div>`;
    })
    .join("");
}

function setupReverseSearch() {
  const input = document.getElementById("reverse-search-input");
  const results = document.getElementById("reverse-search-results");
  const tabs = document.querySelectorAll(".filter-tabs button");
  if (!input || !results) return;

  tabs.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabs.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      activeFilter = btn.dataset.filter;
      runSearch(input.value);
    });
  });

  input.addEventListener("input", () => runSearch(input.value));
}

function fieldsForFilter(country) {
  switch (activeFilter) {
    case "language":
      return country.languages;
    case "animal":
      return country.animals;
    case "capital":
      return [country.capital];
    case "landmark":
      return country.landmarks;
    default:
      return [
        country.capital,
        ...country.languages,
        ...country.animals,
        ...country.landmarks,
        country.name,
        country.nameEn,
      ];
  }
}

function runSearch(query) {
  const results = document.getElementById("reverse-search-results");
  const q = query.trim().toLowerCase();

  if (!q) {
    results.innerHTML = `<p class="empty-state">キーワードを入力すると、該当する国が表示されます。</p>`;
    return;
  }

  const matched = countries.filter((c) =>
    fieldsForFilter(c).some((v) => v && v.toLowerCase().includes(q))
  );

  if (matched.length === 0) {
    results.innerHTML = `<p class="empty-state">「${query}」に一致する国が見つかりませんでした。</p>`;
    return;
  }

  results.innerHTML = `<div class="country-grid">${matched
    .map(
      (c) => `
      <a class="country-card" href="country.html?code=${c.code}">
        <div class="flag">${c.flagEmoji}</div>
        <h3>${c.name}</h3>
        <p>${c.nameEn} ・ ${c.capital}</p>
      </a>`
    )
    .join("")}</div>`;
}

document.addEventListener("DOMContentLoaded", () => {
  loadCountries();
  setupReverseSearch();
});
