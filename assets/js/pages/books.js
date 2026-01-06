import { $, $all } from "../utils.js";
import { getLang, t } from "../i18n.js";

async function loadCatalog(){
  const res = await fetch("/assets/data/catalog.json", { cache: "no-store" });
  if (!res.ok) return { items: [] };
  return res.json();
}

function card(it, lang){
  return `
    <div class="card">
      <b>${it.title}</b>
      <div class="muted small">${it.description || ""}</div>
      <div class="hr"></div>
      <div style="display:flex;justify-content:space-between;gap:10px;align-items:center;flex-wrap:wrap">
        <span class="pill small">${it.category || ""}</span>
        <span class="pill small">${lang==="ar" ? "قريباً" : "Coming soon"}</span>
      </div>
    </div>
  `;
}

export async function initBooks(){
  const lang = getLang();
  const grid = document.getElementById("booksGrid");
  const search = document.getElementById("searchBooks");
  const data = await loadCatalog();
  const items = (data.items||[]).filter(x=>x.type==="book");

  function render(){
    const q = (search?.value||"").trim().toLowerCase();
    const filtered = items.filter(it => !q || (it.title + " " + (it.description||"")).toLowerCase().includes(q));
    grid.innerHTML = filtered.map(it=>card(it, lang)).join("") || `<div class="muted">${lang==="ar" ? "لا توجد نتائج." : "No results."}</div>`;
  }
  render();
  search?.addEventListener("input", render);
}
