import { auth } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

const userChip = document.getElementById("userChip");
const loginLink = document.getElementById("loginLink");
const logoutBtn = document.getElementById("logoutBtn");

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

async function loadCatalog() {
  const res = await fetch("data/catalog.json", { cache: "no-store" });
  if (!res.ok) throw new Error("Cannot load catalog.json");
  return res.json();
}

function uniq(arr) { return [...new Set(arr.filter(Boolean))]; }

function openPaymentLink(item) {
  // ضع لينك الدفع الحقيقي هنا داخل catalog.json (paymentLink)
  if (item.paymentLink) {
    window.open(item.paymentLink, "_blank");
    return;
  }
  alert("ضع لينك الدفع (Payment Link) داخل data/catalog.json للمنتج ده.");
}

function renderCard(item) {
  const tags = [
    item.category ? `<span class="tag">${item.category}</span>` : "",
    item.level ? `<span class="tag">${item.level}</span>` : "",
    item.duration ? `<span class="tag">${item.duration}</span>` : "",
  ].join("");

  const price = item.price ? `<div class="muted"><strong>${item.price}</strong> جنيه</div>` : "";
  const btnText = item.type === "book" ? "اشترِ / حمّل" : (item.type === "webinar" ? "سجّل الآن" : "اشترك الآن");

  return `
    <div class="card">
      <h3>${item.title}</h3>
      <p>${item.description || ""}</p>
      <div class="kv">${tags}</div>
      <div class="row" style="justify-content:space-between;align-items:center;margin-top:12px">
        ${price}
        <button class="btn primary" data-pay="${item.id}">${btnText}</button>
      </div>
    </div>
  `;
}

function mountPayments(items) {
  document.querySelectorAll("[data-pay]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-pay");
      const item = items.find(x => x.id === id);
      if (item) openPaymentLink(item);
    });
  });
}

function applyFilters(items, q, cat, level) {
  const query = (q || "").trim().toLowerCase();
  return items.filter(it => {
    const okQ = !query || (it.title + " " + (it.description||"")).toLowerCase().includes(query);
    const okC = !cat || it.category === cat;
    const okL = !level || it.level === level;
    return okQ && okC && okL;
  });
}

function fillSelect(selectEl, values) {
  const current = selectEl.value;
  const opts = [`<option value="">كل التصنيفات</option>`].concat(values.map(v => `<option value="${v}">${v}</option>`));
  selectEl.innerHTML = opts.join("");
  selectEl.value = current || "";
}

function setCounts(catalog) {
  const c = (catalog.items||[]).filter(x => x.type === "course").length;
  const b = (catalog.items||[]).filter(x => x.type === "book").length;
  const w = (catalog.items||[]).filter(x => x.type === "webinar").length;
  const coursesCount = document.getElementById("coursesCount");
  const booksCount = document.getElementById("booksCount");
  const webinarsCount = document.getElementById("webinarsCount");
  if (coursesCount) coursesCount.textContent = String(c);
  if (booksCount) booksCount.textContent = String(b);
  if (webinarsCount) webinarsCount.textContent = String(w);
}

function setFeatured(items) {
  const box = document.getElementById("featuredBox");
  if (!box) return;
  const featured = items.find(x => x.featured) || items[0];
  if (!featured) return;

  box.innerHTML = `
    <div class="card" style="margin-top:14px">
      <h3>${featured.title}</h3>
      <p>${featured.description || ""}</p>
      <div class="kv">
        ${featured.category ? `<span class="tag">${featured.category}</span>` : ""}
        ${featured.level ? `<span class="tag">${featured.level}</span>` : ""}
      </div>
      <div class="row" style="justify-content:space-between;align-items:center;margin-top:12px">
        ${featured.price ? `<div class="muted"><strong>${featured.price}</strong> جنيه</div>` : ""}
        <button class="btn dark" id="featuredPay">اشترك الآن</button>
      </div>
    </div>
  `;
  document.getElementById("featuredPay")?.addEventListener("click", () => openPaymentLink(featured));
}

(async function boot(){
  let catalog;
  try { catalog = await loadCatalog(); }
  catch { catalog = { items: [] }; }

  const items = catalog.items || [];
  setCounts(catalog);
  setFeatured(items);

  // صفحة كورسات
  const grid = document.getElementById("grid");
  const search = document.getElementById("search");
  const category = document.getElementById("category");
  const level = document.getElementById("level");

  if (!grid) return;

  // Determine page type by title
  const isCourses = document.title.includes("الكورسات");
  const isBooks = document.title.includes("الكتب");
  const isWebinars = document.title.includes("الويبينار");

  let pageItems = items;
  if (isCourses) pageItems = items.filter(x => x.type === "course");
  if (isBooks) pageItems = items.filter(x => x.type === "book");
  if (isWebinars) pageItems = items.filter(x => x.type === "webinar");

  // fill categories select if exists
  if (category) {
    const cats = uniq(pageItems.map(x => x.category));
    fillSelect(category, cats);
  }

  function rerender(){
    const q = search ? search.value : "";
    const c = category ? category.value : "";
    const l = level ? level.value : "";
    const filtered = applyFilters(pageItems, q, c, l);

    grid.innerHTML = filtered.map(renderCard).join("") || `<div class="card"><p class="muted">لا توجد نتائج.</p></div>`;
    mountPayments(pageItems);
  }

  rerender();
  search?.addEventListener("input", rerender);
  category?.addEventListener("change", rerender);
  level?.addEventListener("change", rerender);
})();
