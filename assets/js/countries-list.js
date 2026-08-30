async function renderCountryList() {
  const countries = await fetchCountries();
  const nav = document.getElementById("alpha-nav");
  const container = document.getElementById("country-list");
  if (nav) {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    nav.innerHTML = letters.map((l) => `<a href="#letter-${l}">${l}</a>`).join("");
  }
  if (!container) return;

  const sorted = [...countries].sort((a, b) => a.id - b.id);
  const groups = {};
  sorted.forEach((c) => {
    const letter = c.nameEn[0].toUpperCase();
    if (!groups[letter]) groups[letter] = [];
    groups[letter].push(c);
  });

  const readyCount = countries.filter((c) => c.detailReady).length;
  const progressNote = document.getElementById("progress-note");
  if (progressNote) {
    progressNote.textContent = `現在 ${countries.length}か国中 ${readyCount}か国の詳細ページが完成しています。残りは順次追加中です。`;
  }

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

document.addEventListener("DOMContentLoaded", renderCountryList);
