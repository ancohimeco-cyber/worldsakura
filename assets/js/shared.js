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

function setupHeaderNav() {
  const toggle = document.getElementById("nav-toggle");
  const nav = document.getElementById("site-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  }

  document.querySelectorAll(".nav-dropdown").forEach((dropdown) => {
    const btn = dropdown.querySelector(".nav-dropdown-toggle");
    if (!btn) return;
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = dropdown.classList.toggle("open");
      btn.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  });

  document.addEventListener("click", (e) => {
    document.querySelectorAll(".nav-dropdown.open").forEach((dropdown) => {
      if (!dropdown.contains(e.target)) dropdown.classList.remove("open");
    });
  });
}

document.addEventListener("DOMContentLoaded", setupHeaderNav);
