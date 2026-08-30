function dayOfYear() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now - start;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

async function renderHomeHighlights() {
  const countries = await fetchCountries();
  const ready = countries.filter((c) => c.detailReady);
  if (ready.length === 0) return;

  const todayContainer = document.getElementById("today-country");
  const addedContainer = document.getElementById("added-countries");
  const triviaContainer = document.getElementById("trivia-snippet");

  const todayIndex = dayOfYear() % ready.length;
  const today = ready[todayIndex];

  if (todayContainer) {
    todayContainer.innerHTML = countryCard(today);
  }

  if (addedContainer) {
    addedContainer.innerHTML = ready.map(countryCard).join("");
  }

  if (triviaContainer) {
    const triviaCountry = ready[(todayIndex + 1) % ready.length];
    triviaContainer.innerHTML = `
      <p class="trivia-text">💡 ${triviaCountry.trivia}</p>
      <a class="trivia-link" href="country.html?id=${triviaCountry.id}">${triviaCountry.name}について詳しく見る →</a>`;
  }
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
  setupHomeSearchForm();
});
