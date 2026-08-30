let countries = [];
let activeFilter = "all";

function fieldsForFilter(country) {
  const languages = country.languages || [];
  const animals = country.animals || [];
  const landmarks = country.landmarks || [];
  switch (activeFilter) {
    case "language":
      return languages;
    case "animal":
      return animals;
    case "capital":
      return [country.capital];
    case "landmark":
      return landmarks;
    default:
      return [country.capital, ...languages, ...animals, ...landmarks, country.name, country.nameEn];
  }
}

function runSearch(query) {
  const results = document.getElementById("reverse-search-results");
  const q = query.trim().toLowerCase();

  if (!q) {
    results.innerHTML = `<p class="empty-state">キーワードを入力すると、該当する国が表示されます。</p>`;
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
  countries = await fetchCountries();

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
