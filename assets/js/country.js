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

  const meta = countryMeta(country);
  updatePageMeta(meta.title, meta.description.slice(0, 150), countryUrl(country));

  const motif = motifs.find((m) => m.countries.includes(country.code));
  const countryAnimals = animals.filter((a) => a.countries.includes(country.code));
  const codeMap = new Map(countries.map((c) => [c.code, c]));
  const neighborCountries = (country.borders || []).map((code) => codeMap.get(code)).filter(Boolean);

  const sorted = [...countries].sort((a, b) => a.id - b.id);
  const idx = sorted.findIndex((c) => c.id === country.id);
  const prevCountry = sorted[(idx - 1 + sorted.length) % sorted.length];
  const nextCountry = sorted[(idx + 1) % sorted.length];

  root.innerHTML = renderCountryBody(country, countryAnimals, motif, neighborCountries, prevCountry, nextCountry);
}

document.addEventListener("DOMContentLoaded", loadCountry);
