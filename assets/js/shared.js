async function fetchCountries() {
  const res = await fetch("data/countries.json");
  return res.json();
}

function countryCard(c) {
  return `
    <a class="country-card" href="country.html?id=${c.id}">
      <img class="flag" src="assets/flags/${c.code}.svg" alt="${c.nameEn}の国旗" loading="lazy" />
      <h3>${c.name}</h3>
      <p>${c.nameEn} ・ ${c.capital || "詳細準備中"}</p>
    </a>`;
}
