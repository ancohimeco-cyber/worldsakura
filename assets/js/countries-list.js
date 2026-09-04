let ALL_COUNTRIES = [];
let activeGovernmentFilter = "all";

function renderGroups(countries) {
  const container = document.getElementById("country-list");
  if (!container) return;

  const sorted = [...countries].sort((a, b) => a.id - b.id);
  const groups = {};
  sorted.forEach((c) => {
    const letter = c.nameEn[0].toUpperCase();
    if (!groups[letter]) groups[letter] = [];
    groups[letter].push(c);
  });

  container.innerHTML = Object.keys(groups)
    .sort()
    .map((letter) => {
      const cards = groups[letter].map(countryCard).join("");
      return `
        <div id="letter-${letter}">
          <div class="letter-group-title">${letter}</div>
          <div class="country-grid">${cards}</div>
        </div>`;
    })
    .join("");
}

function applyGovernmentFilter() {
  const filtered =
    activeGovernmentFilter === "all"
      ? ALL_COUNTRIES
      : ALL_COUNTRIES.filter((c) => c.government === activeGovernmentFilter);
  renderGroups(filtered);
}

function setupGovernmentTabs() {
  const tabs = document.querySelectorAll("#government-tabs button");
  tabs.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabs.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      activeGovernmentFilter = btn.dataset.government;
      applyGovernmentFilter();
    });
  });
}

async function renderCountryList() {
  const countries = await fetchCountries();
  ALL_COUNTRIES = countries;
  const nav = document.getElementById("alpha-nav");
  if (nav) {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    nav.innerHTML = letters.map((l) => `<a href="#letter-${l}">${l}</a>`).join("");
  }

  const readyCount = countries.filter((c) => c.detailReady).length;
  const monarchyCount = countries.filter((c) => c.government === "君主制").length;
  const progressNote = document.getElementById("progress-note");
  if (progressNote) {
    progressNote.textContent = `現在 ${countries.length}か国中 ${readyCount}か国の詳細ページが完成しています(うち君主制の国 ${monarchyCount}か国)。残りは順次追加中です。`;
  }

  setupGovernmentTabs();
  applyGovernmentFilter();
}

document.addEventListener("DOMContentLoaded", renderCountryList);
