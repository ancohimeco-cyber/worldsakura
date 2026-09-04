async function loadCountry() {
  const id = resolveIdFromPath("country");
  const [countriesRes, animalsRes, motifsRes] = await Promise.all([
    fetch("data/countries.json"),
    fetch("data/animals.json"),
    fetch("data/flag_motifs.json"),
  ]);
  const countries = await countriesRes.json();
  const animals = await animalsRes.json();
  const motifs = await motifsRes.json();
  const country = countries.find((c) => c.id === id);

  const root = document.getElementById("country-root");
  if (!country) {
    root.innerHTML = renderCountryBody(null);
    return;
  }

  updatePageMeta(
    `${country.name}(${country.nameEn}) | 世界の図鑑`,
    `${country.name}の位置・首都・人口・政治体制・言語・食文化・自然・国旗の由来などを紹介。${country.formation || ""}`.slice(0, 140),
    countryUrl(country)
  );

  const motif = motifs.find((m) => m.countries.includes(country.code));
  const countryAnimals = animals.filter((a) => a.countries.includes(country.code));

  root.innerHTML = renderCountryBody(country, countryAnimals, motif);
}

document.addEventListener("DOMContentLoaded", loadCountry);
