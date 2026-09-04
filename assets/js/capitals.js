function capitalCard(c) {
  return `
    <a class="country-card" href="${countryUrl(c)}">
      <img class="flag" src="assets/flags/${c.code}.svg" alt="${c.nameEn}の国旗" loading="lazy" />
      <h3>${c.capital}</h3>
      <p>${c.name}(${c.nameEn})</p>
    </a>`;
}

async function renderCapitalsList() {
  const countries = await fetchCountries();
  const container = document.getElementById("capital-list");
  const countEl = document.getElementById("capital-count");
  if (!container) return;

  const sorted = [...countries].sort((a, b) => a.capital.localeCompare(b.capital, "ja"));

  container.innerHTML = `<div class="country-grid">${sorted.map(capitalCard).join("")}</div>`;
  if (countEl) countEl.textContent = `${sorted.length}都市を首都名の五十音順で表示中`;
}

document.addEventListener("DOMContentLoaded", renderCapitalsList);
