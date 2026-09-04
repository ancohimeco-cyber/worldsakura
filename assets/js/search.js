let countries = [];
let animalsData = [];
let peoplesData = [];
let castlesData = [];
let activeFilter = "all";

function fieldsForFilter(country) {
  const languages = country.languages || [];
  const landmarks = country.landmarks || [];
  switch (activeFilter) {
    case "language":
      return languages;
    case "capital":
      return [country.capital];
    case "landmark":
      return landmarks;
    default:
      return [country.capital, ...languages, ...landmarks, country.name, country.nameEn];
  }
}

function animalSearchCard(a) {
  const icon = { "哺乳類": "🐾", "鳥類": "🐦", "爬虫類": "🦎", "両生類": "🐸", "魚類": "🐟", "甲殻類": "🦀", "軟体動物": "🐌" }[a.type] || "🐾";
  return `
    <a class="country-card" href="${animalUrl(a)}">
      <div class="animal-icon">${icon}</div>
      <h3>${a.name}</h3>
      <p>${a.nameEn} ・ ${a.countries.length}か国に生息</p>
    </a>`;
}

function peopleSearchCard(p) {
  return `
    <a class="country-card" href="${peopleUrl(p)}">
      <div class="animal-icon">🧑‍🤝‍🧑</div>
      <h3>${p.name}</h3>
      <p>${p.nameEn} ・ ${(p.region || []).join("・")}</p>
    </a>`;
}

function castleSearchCard(c) {
  return `
    <a class="country-card" href="${castleUrl(c)}">
      <div class="animal-icon">🏰</div>
      <h3>${c.name}</h3>
      <p>${c.nameEn} ・ ${c.era || ""}</p>
    </a>`;
}

function runSearch(query) {
  const results = document.getElementById("reverse-search-results");
  const q = query.trim().toLowerCase();

  if (!q) {
    results.innerHTML = `<p class="empty-state">キーワードを入力すると、該当する結果が表示されます。</p>`;
    return;
  }

  if (activeFilter === "animal") {
    const matched = animalsData.filter(
      (a) => a.name.toLowerCase().includes(q) || a.nameEn.toLowerCase().includes(q)
    );
    if (matched.length === 0) {
      results.innerHTML = `<p class="empty-state">「${query}」に一致する生きものが見つかりませんでした。</p>`;
      return;
    }
    results.innerHTML = `<div class="country-grid">${matched.map(animalSearchCard).join("")}</div>`;
    return;
  }

  if (activeFilter === "people") {
    const matched = peoplesData.filter(
      (p) => p.name.toLowerCase().includes(q) || p.nameEn.toLowerCase().includes(q)
    );
    if (matched.length === 0) {
      results.innerHTML = `<p class="empty-state">「${query}」に一致する民族が見つかりませんでした。</p>`;
      return;
    }
    results.innerHTML = `<div class="country-grid">${matched.map(peopleSearchCard).join("")}</div>`;
    return;
  }

  if (activeFilter === "castle") {
    const matched = castlesData.filter(
      (c) => c.name.toLowerCase().includes(q) || c.nameEn.toLowerCase().includes(q)
    );
    if (matched.length === 0) {
      results.innerHTML = `<p class="empty-state">「${query}」に一致するお城が見つかりませんでした。</p>`;
      return;
    }
    results.innerHTML = `<div class="country-grid">${matched.map(castleSearchCard).join("")}</div>`;
    return;
  }

  const matched = countries.filter((c) => fieldsForFilter(c).some((v) => v && v.toLowerCase().includes(q)));

  if (matched.length === 0) {
    results.innerHTML = `<p class="empty-state">「${query}」に一致する国が見つかりませんでした。</p>`;
    return;
  }

  results.innerHTML = `<div class="country-grid">${matched.map(countryCard).join("")}</div>`;
}

async function setupReverseSearch() {
  [countries, animalsData, peoplesData, castlesData] = await Promise.all([
    fetchCountries(),
    fetch("data/animals.json").then((r) => r.json()),
    fetch("data/peoples.json").then((r) => r.json()),
    fetch("data/castles.json").then((r) => r.json()),
  ]);

  const input = document.getElementById("reverse-search-input");
  const tabs = document.querySelectorAll(".filter-tabs button");
  if (!input) return;

  tabs.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabs.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      activeFilter = btn.dataset.filter;
      runSearch(input.value);
    });
  });

  input.addEventListener("input", () => runSearch(input.value));

  const params = new URLSearchParams(window.location.search);
  const q = params.get("q");
  if (q) {
    input.value = q;
    runSearch(q);
  }
}

document.addEventListener("DOMContentLoaded", setupReverseSearch);
