import { auth } from "./firebase.js";
import { CONFIG } from "./config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

const userChip = document.getElementById("userChip");
const loginLink = document.getElementById("loginLink");
const logoutBtn = document.getElementById("logoutBtn");

function waLink(text){
  return `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(text)}`;
}
const waFab = document.getElementById("waFab");
if (waFab) waFab.href = waLink("مرحبًا، أريد حجز جلسة.");
const waBtn = document.getElementById("waBtn");
if (waBtn) waBtn.href = waLink("مرحبًا، أريد حجز جلسة.");

onAuthStateChanged(auth, (user) => {
  if (user) {
    if (userChip) { userChip.style.display = "inline-flex"; userChip.textContent = user.email || "User"; }
    if (loginLink) loginLink.style.display = "none";
    if (logoutBtn) logoutBtn.style.display = "inline-flex";
  } else {
    if (userChip) userChip.style.display = "none";
    if (loginLink) loginLink.style.display = "inline-flex";
    if (logoutBtn) logoutBtn.style.display = "none";
  }
});

logoutBtn?.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "index.html";
});

async function loadJson(path){
  const res = await fetch(path, { cache: "no-store" });
  if (!res.ok) throw new Error("Cannot load " + path);
  return res.json();
}
function uniq(arr) { return [...new Set(arr.filter(Boolean))]; }

function applyFilters(items, q, cat, level){
  const query = (q||"").trim().toLowerCase();
  return items.filter(it => {
    const okQ = !query || (it.title + " " + (it.description||"")).toLowerCase().includes(query);
    const okC = !cat || it.category === cat;
    const okL = !level || it.level === level;
    return okQ && okC && okL;
  });
}
function fillSelect(selectEl, values){
  const current = selectEl.value;
  selectEl.innerHTML = [`<option value="">كل التصنيفات</option>`].concat(values.map(v => `<option value="${v}">${v}</option>`)).join("");
  selectEl.value = current || "";
}

function renderComingSoonCard(item){
  const tags = [
    item.category ? `<span class="tag">${item.category}</span>` : "",
    item.level ? `<span class="tag">${item.level}</span>` : "",
    `<span class="tag soon">قريباً</span>`
  ].join("");

  return `
    <div class="card">
      <h3>${item.title}</h3>
      <p>${item.description || "قريباً..."}</p>
      <div class="row" style="justify-content:space-between;align-items:center;margin-top:10px">
        <div class="row" style="gap:8px;flex-wrap:wrap">${tags}</div>
      </div>
      <div class="hr"></div>
      <div class="row" style="justify-content:space-between;align-items:center">
        <span class="muted" style="font-weight:900">غير متاح للشراء الآن</span>
        <a class="btn primary" href="booking.html">احجز جلسة بدلًا من ذلك</a>
      </div>
    </div>
  `;
}

(async function boot(){
  let catalog = { items: [] };
  try { catalog = await loadJson("data/catalog.json"); } catch {}

  const items = catalog.items || [];

  const elC = document.getElementById("coursesCount");
  const elB = document.getElementById("booksCount");
  if (elC) elC.textContent = String(items.filter(x=>x.type==="course").length);
  if (elB) elB.textContent = String(items.filter(x=>x.type==="book").length);

  const grid = document.getElementById("grid");
  if (grid) {
    const search = document.getElementById("search");
    const category = document.getElementById("category");
    const level = document.getElementById("level");

    const title = document.title;
    const isCourses = title.includes("الكورسات");
    const isBooks = title.includes("الكتب");

    let pageItems = items;
    if (isCourses) pageItems = items.filter(x=>x.type==="course");
    if (isBooks) pageItems = items.filter(x=>x.type==="book");

    if (category) fillSelect(category, uniq(pageItems.map(x=>x.category)));

    function rerender(){
      const q = search ? search.value : "";
      const c = category ? category.value : "";
      const l = level ? level.value : "";
      const filtered = applyFilters(pageItems, q, c, l);
      grid.innerHTML = filtered.map(renderComingSoonCard).join("") || `<div class="card"><p class="muted">لا توجد نتائج.</p></div>`;
    }
    rerender();
    search?.addEventListener("input", rerender);
    category?.addEventListener("change", rerender);
    level?.addEventListener("change", rerender);
  }
})();