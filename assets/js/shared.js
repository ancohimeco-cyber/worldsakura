async function fetchCountries() {
  const res = await fetch("data/countries.json");
  return res.json();
}

function updatePageMeta(title, description, path) {
  document.title = title;
  const descTag = document.querySelector('meta[name="description"]');
  if (descTag) descTag.setAttribute("content", description);
  const canonicalUrl = "https://worldsakura.com/" + path;
  let canonicalTag = document.querySelector('link[rel="canonical"]');
  if (!canonicalTag) {
    canonicalTag = document.createElement("link");
    canonicalTag.setAttribute("rel", "canonical");
    document.head.appendChild(canonicalTag);
  }
  canonicalTag.setAttribute("href", canonicalUrl);
  [
    ["property", "og:title", title],
    ["property", "og:description", description],
    ["property", "og:url", canonicalUrl],
    ["name", "twitter:title", title],
    ["name", "twitter:description", description],
  ].forEach(([attr, key, value]) => {
    const tag = document.querySelector(`meta[${attr}="${key}"]`);
    if (tag) tag.setAttribute("content", value);
  });
}

function slugify(text) {
  return (text || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function countryUrl(c) {
  return `country-${c.id}-${slugify(c.nameEn)}.html`;
}

function animalUrl(a) {
  return `animal-${a.key}.html`;
}

function peopleUrl(p) {
  return `people-${p.key}.html`;
}

function castleUrl(c) {
  return `castle-${c.key}.html`;
}

function resolveIdFromPath(prefix) {
  const params = new URLSearchParams(window.location.search);
  if (params.get("id")) return Number(params.get("id"));
  const match = window.location.pathname.match(new RegExp(prefix + "-(\\d+)-"));
  return match ? Number(match[1]) : null;
}

function resolveKeyFromPath(prefix) {
  const params = new URLSearchParams(window.location.search);
  if (params.get("key")) return params.get("key");
  const match = window.location.pathname.match(new RegExp(prefix + "-(.+)\\.html$"));
  return match ? match[1] : null;
}

function countryCard(c) {
  return `
    <a class="country-card" href="${countryUrl(c)}">
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
