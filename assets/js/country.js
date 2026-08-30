async function loadCountry() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code");
  const res = await fetch("data/countries.json");
  const countries = await res.json();
  const country = countries.find((c) => c.code === code);

  const root = document.getElementById("country-root");
  if (!country) {
    root.innerHTML = `<p class="empty-state">国のデータが見つかりませんでした。</p>`;
    return;
  }

  document.title = `${country.name}(${country.nameEn}) | 世界の図鑑`;

  root.innerHTML = `
    <section class="country-hero">
      <div class="flag-big">${country.flagEmoji}</div>
      <h1>${country.name}</h1>
      <div class="name-en">${country.nameEn} / ${country.continent}</div>
    </section>
    <a class="back-link" href="index.html">← 一覧に戻る</a>
    <div class="info-grid">
      <div class="info-card">
        <h3>📍 位置</h3>
        <p>${country.location}</p>
      </div>
      <div class="info-card">
        <h3>🏙 首都</h3>
        <p>${country.capital}</p>
      </div>
      <div class="info-card">
        <h3>🗣 言語</h3>
        <ul>${country.languages.map((v) => `<li>${v}</li>`).join("")}</ul>
      </div>
      <div class="info-card">
        <h3>👥 民族</h3>
        <ul>${country.ethnicGroups.map((v) => `<li>${v}</li>`).join("")}</ul>
      </div>
      <div class="info-card">
        <h3>🦁 生息動物</h3>
        <ul>${country.animals.map((v) => `<li>${v}</li>`).join("")}</ul>
      </div>
      <div class="info-card">
        <h3>🏳 国旗の由来</h3>
        <p>${country.flagOrigin}</p>
      </div>
      <div class="info-card">
        <h3>💡 トリビア</h3>
        <p>${country.trivia}</p>
      </div>
      <div class="info-card">
        <h3>🗺 観光名所</h3>
        <ul>${country.landmarks.map((v) => `<li>${v}</li>`).join("")}</ul>
      </div>
    </div>
  `;
}

document.addEventListener("DOMContentLoaded", loadCountry);
