import { auth } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { enableBasicProtection, addWatermark } from "./protect.js";

enableBasicProtection();

let isLoggedIn = false;

const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

const userChip = document.getElementById("userChip");
const loginLink = document.getElementById("loginLink");
const logoutBtn = document.getElementById("logoutBtn");

// WhatsApp (ضع رقمك)
const WHATSAPP_NUMBER = "201000000000"; // مثال: 201xxxxxxxxx
function waLink(text){
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}
const waFab = document.getElementById("waFab");
if (waFab) waFab.href = waLink("مرحبًا، أريد الاستفسار عن الكورسات/الكتب.");
const waBtn = document.getElementById("waBtn");
if (waBtn) waBtn.href = waLink("مرحبًا، لدي استفسار.");

onAuthStateChanged(auth, (user) => {
  isLoggedIn = !!user;
  if (isLoggedIn) localStorage.setItem("heba_user_logged_in", "1");
  else localStorage.removeItem("heba_user_logged_in");

  if (user) {
    if (userChip) { userChip.style.display = "inline-flex"; userChip.textContent = user.email || "User"; }
    if (loginLink) loginLink.style.display = "none";
    if (logoutBtn) logoutBtn.style.display = "inline-flex";

    // Watermark on protected-ish pages
    const path = location.pathname.toLowerCase();
    const protectPages = ["courses.html","books.html","product.html","cart.html","checkout.html","dashboard.html"];
    if (protectPages.some(p => path.endsWith(p))) {
      addWatermark(`حساب: ${user.email || "User"}`);
    }
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

// ---------- helpers ----------
async function loadJson(path){
  const res = await fetch(path, { cache: "no-store" });
  if (!res.ok) throw new Error("Cannot load " + path);
  return res.json();
}
function uniq(arr) { return [...new Set(arr.filter(Boolean))]; }

// ---------- Cart ----------
const CART_KEY = "heba_cart_v2";
const COUPON_KEY = "heba_coupon_v1";

function getCart(){
  try { return JSON.parse(localStorage.getItem(CART_KEY) || "[]"); } catch { return []; }
}
function setCart(cart){
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartBadge(cart);
}
function updateCartBadge(cart = getCart()){
  const count = cart.reduce((s, it) => s + (it.qty||0), 0);
  const el = document.getElementById("cartCount");
  if (el) el.textContent = String(count);
}
function addToCart(id){
  const cart = getCart();
  const f = cart.find(x => x.id === id);
  if (f) f.qty += 1;
  else cart.push({ id, qty: 1 });
  setCart(cart);
}
function changeQty(id, delta){
  const cart = getCart();
  const f = cart.find(x => x.id === id);
  if (!f) return;
  f.qty += delta;
  setCart(cart.filter(x => x.qty > 0));
}
function clearCart(){ setCart([]); }

function getCoupon(){ return (localStorage.getItem(COUPON_KEY) || "").trim().toUpperCase(); }
function setCoupon(code){ localStorage.setItem(COUPON_KEY, (code||"").trim().toUpperCase()); }

// ---------- Render ----------
function productUrl(item){ return `product.html?id=${encodeURIComponent(item.id)}`; }

function renderCard(item){
  const tags = [
    item.category ? `<span class="tag">${item.category}</span>` : "",
    item.level ? `<span class="tag">${item.level}</span>` : "",
    item.duration ? `<span class="tag">${item.duration}</span>` : ""
  ].join("");

  return `
    <div class="card">
      <h3>${item.title}</h3>
      <p>${item.description || ""}</p>
      <div class="kv">${tags}</div>
      <div class="row" style="justify-content:space-between;align-items:center;margin-top:12px">
        <div class="muted"><strong>${item.price || 0}</strong> جنيه</div>
        <div class="row">
          <a class="btn" href="${productUrl(item)}">التفاصيل</a>
          <button class="btn primary" data-add="${item.id}">أضف للسلة</button>
        </div>
      </div>
    </div>
  `;
}

function mountAddToCart(){
  document.querySelectorAll("[data-add]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-add");
      addToCart(id);
      btn.textContent = "تم ✅";
      setTimeout(() => (btn.textContent = "أضف للسلة"), 900);
    });
  });
}

// ---------- Filtering ----------
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

// ---------- Home counts + featured ----------
function setCounts(items){
  const c = items.filter(x=>x.type==="course").length;
  const b = items.filter(x=>x.type==="book").length;
  const w = items.filter(x=>x.type==="webinar").length;

  const elC = document.getElementById("coursesCount");
  const elB = document.getElementById("booksCount");
  const elW = document.getElementById("webinarsCount");
  if (elC) elC.textContent = String(c);
  if (elB) elB.textContent = String(b);
  if (elW) elW.textContent = String(w);

  const box = document.getElementById("featuredBox");
  if (!box) return;
  const featured = items.find(x=>x.featured) || items[0];
  if (!featured) return;

  box.innerHTML = `
    <div class="card" style="margin-top:14px">
      <h3>${featured.title}</h3>
      <p>${featured.description||""}</p>
      <div class="kv">
        ${featured.category ? `<span class="tag">${featured.category}</span>`:""}
        ${featured.level ? `<span class="tag">${featured.level}</span>`:""}
      </div>
      <div class="row" style="justify-content:space-between;align-items:center;margin-top:12px">
        <div class="muted"><strong>${featured.price||0}</strong> جنيه</div>
        <div class="row">
          <a class="btn" href="${productUrl(featured)}">التفاصيل</a>
          <button class="btn dark" id="featuredAdd">أضف للسلة</button>
        </div>
      </div>
    </div>
  `;
  document.getElementById("featuredAdd")?.addEventListener("click", ()=>addToCart(featured.id));
}

// ---------- Product page ----------
function getQueryParam(name){
  const u = new URL(location.href);
  return u.searchParams.get(name);
}

function renderProductPage(items, faq){
  const id = getQueryParam("id");
  if (!id) return;

  const item = items.find(x => x.id === id);
  if (!item) return;

  document.title = `${item.title} | Heba ElSherif Academy`;

  const title = document.getElementById("title");
  const desc = document.getElementById("desc");
  const tags = document.getElementById("tags");
  const price = document.getElementById("price");
  const cat = document.getElementById("cat");
  const lvl = document.getElementById("lvl");
  const bullets = document.getElementById("bullets");
  const faqBox = document.getElementById("faqBox");
  const addBtn = document.getElementById("addBtn");

  if (title) title.textContent = item.title;
  if (desc) desc.textContent = item.description || "";
  if (tags) tags.innerHTML = `
    ${item.category ? `<span class="tag">${item.category}</span>`:""}
    ${item.level ? `<span class="tag">${item.level}</span>`:""}
    ${item.duration ? `<span class="tag">${item.duration}</span>`:""}
  `;
  if (price) price.textContent = String(item.price || 0);
  if (cat) cat.textContent = item.category || "-";
  if (lvl) lvl.textContent = item.level || "-";

  const bulletList = item.bullets || ["محتوى منظم خطوة بخطوة", "تطبيق عملي", "دعم وإرشاد"];
  if (bullets) bullets.innerHTML = bulletList.map(b => `<li>${b}</li>`).join("");

  if (faqBox && faq?.items) {
    faqBox.innerHTML = faq.items.map(x => `
      <div class="card">
        <h3 style="margin-bottom:6px">${x.q}</h3>
        <p class="muted">${x.a}</p>
      </div>
    `).join("");
  }

  addBtn?.addEventListener("click", () => {
    addToCart(item.id);
    addBtn.textContent = "تم ✅";
    setTimeout(()=>addBtn.textContent="أضف للسلة", 900);
  });
}

// ---------- Cart ----------
function renderCartPage(items){
  const cartItemsEl = document.getElementById("cartItems");
  if (!cartItemsEl) return;

  const itemsTotalEl = document.getElementById("itemsTotal");
  const priceTotalEl = document.getElementById("priceTotal");
  const clearBtn = document.getElementById("clearCartBtn");
  const checkoutBtn = document.getElementById("checkoutBtn");
  const couponInput = document.getElementById("couponCode");
  const applyCouponBtn = document.getElementById("applyCouponBtn");
  const couponInfo = document.getElementById("couponInfo");

  const cart = getCart();
  if (cart.length === 0) {
    cartItemsEl.innerHTML = `<p class="muted">السلة فارغة. أضف منتجات من الكورسات/الكتب.</p>`;
    if (itemsTotalEl) itemsTotalEl.textContent = "0";
    if (priceTotalEl) priceTotalEl.textContent = "0";
    return;
  }

  const merged = cart.map(ci => {
    const product = items.find(p => p.id === ci.id) || { id: ci.id, title: "منتج", price: 0, paymentLink: "" };
    return { ...ci, product };
  });

  const totalItems = merged.reduce((s, x) => s + x.qty, 0);
  let totalPrice = merged.reduce((s, x) => s + (Number(x.product.price || 0) * x.qty), 0);

  const code = getCoupon();
  let discount = 0;
  if (code === "HEB10") discount = Math.round(totalPrice * 0.10);
  if (code === "HEB20") discount = Math.round(totalPrice * 0.20);
  totalPrice = Math.max(0, totalPrice - discount);

  if (itemsTotalEl) itemsTotalEl.textContent = String(totalItems);
  if (priceTotalEl) priceTotalEl.textContent = String(totalPrice);

  cartItemsEl.innerHTML = merged.map(x => `
    <div class="cart-row">
      <div>
        <div style="font-weight:900">${x.product.title}</div>
        <div class="muted" style="font-size:13px">${x.product.price || 0} جنيه</div>
      </div>
      <div class="qty">
        <button data-dec="${x.id}">-</button>
        <span>${x.qty}</span>
        <button data-inc="${x.id}">+</button>
      </div>
    </div>
  `).join("");

  cartItemsEl.querySelectorAll("[data-inc]").forEach(b => {
    b.addEventListener("click", () => { changeQty(b.getAttribute("data-inc"), +1); renderCartPage(items); });
  });
  cartItemsEl.querySelectorAll("[data-dec]").forEach(b => {
    b.addEventListener("click", () => { changeQty(b.getAttribute("data-dec"), -1); renderCartPage(items); });
  });

  if (couponInput) couponInput.value = getCoupon();
  applyCouponBtn?.addEventListener("click", () => {
    setCoupon(couponInput?.value || "");
    if (couponInfo) couponInfo.textContent = `تم تطبيق الكوبون: ${getCoupon() || "لا يوجد"}`;
    renderCartPage(items);
  });

  clearBtn?.addEventListener("click", () => { clearCart(); renderCartPage(items); });

  checkoutBtn?.addEventListener("click", () => {
    const logged = isLoggedIn || localStorage.getItem("heba_user_logged_in") === "1";
    if (!logged) {
      localStorage.setItem("heba_redirect_after_login", "cart.html");
      window.location.href = "login.html";
      return;
    }
    window.location.href = "checkout.html";
  });
}

// ---------- Checkout ----------
function renderCheckoutPage(items){
  const box = document.getElementById("checkoutBox");
  if (!box) return;

  const logged = isLoggedIn || localStorage.getItem("heba_user_logged_in") === "1";
  if (!logged) {
    localStorage.setItem("heba_redirect_after_login", "checkout.html");
    window.location.href = "login.html";
    return;
  }

  const cart = getCart();
  if (cart.length === 0) {
    box.innerHTML = `<p class="muted">السلة فارغة.</p><a class="btn primary" href="courses.html">تصفح الكورسات</a>`;
    return;
  }

  const merged = cart.map(ci => {
    const product = items.find(p => p.id === ci.id);
    return { ...ci, product };
  }).filter(x => x.product);

  box.innerHTML = `
    <h3>روابط الدفع</h3>
    <p class="muted">في الوضع Static، ادفع لكل عنصر عبر رابط الدفع الخاص به.</p>
    <div class="hr"></div>
    ${merged.map(x => `
      <div class="line-row">
        <div>
          <div style="font-weight:900">${x.product.title} × ${x.qty}</div>
          <div class="muted" style="font-size:13px">${x.product.price || 0} جنيه</div>
        </div>
        <a class="btn primary" target="_blank" rel="noopener"
           href="${x.product.paymentLink || "#"}"
           onclick="${x.product.paymentLink ? "" : "alert('ضع paymentLink في catalog.json'); return false;"}">
          ادفع الآن
        </a>
      </div>
    `).join("")}
    <div class="hr"></div>
    <button class="btn dark" id="clearAfterPay">تفريغ السلة بعد الدفع</button>
  `;

  document.getElementById("clearAfterPay")?.addEventListener("click", () => {
    clearCart();
    window.location.href = "index.html";
  });
}

// ---------- Blog ----------
function renderBlog(posts){
  const grid = document.getElementById("postsGrid");
  if (!grid) return;
  grid.innerHTML = posts.map(p => `
    <a class="card card-link" href="post.html?id=${encodeURIComponent(p.id)}">
      <h3>${p.title}</h3>
      <p class="muted">${p.excerpt}</p>
      <div class="muted" style="font-size:12px">${p.date}</div>
    </a>
  `).join("");
}

function renderPost(posts){
  const id = getQueryParam("id");
  if (!id) return;
  const post = posts.find(p => p.id === id);
  if (!post) return;

  document.title = post.title;
  const t = document.getElementById("postTitle");
  const d = document.getElementById("postDate");
  const c = document.getElementById("postContent");
  if (t) t.textContent = post.title;
  if (d) d.textContent = post.date;
  if (c) c.textContent = post.content;
}

// ---------- Boot ----------
(async function boot(){
  updateCartBadge();

  let catalog = { items: [] };
  let faq = { items: [] };
  let posts = { posts: [] };

  try { catalog = await loadJson("data/catalog.json"); } catch {}
  try { faq = await loadJson("data/faq.json"); } catch {}
  try { posts = await loadJson("data/posts.json"); } catch {}

  const items = catalog.items || [];
  setCounts(items);

  // page-type specific
  const path = location.pathname.toLowerCase();
  if (path.endsWith("product.html")) renderProductPage(items, faq);
  if (path.endsWith("cart.html")) renderCartPage(items);
  if (path.endsWith("checkout.html")) renderCheckoutPage(items);
  if (path.endsWith("blog.html")) renderBlog(posts.posts || []);
  if (path.endsWith("post.html")) renderPost(posts.posts || []);

  // listings filter
  const grid = document.getElementById("grid");
  if (grid) {
    const search = document.getElementById("search");
    const category = document.getElementById("category");
    const level = document.getElementById("level");

    const title = document.title;
    const isCourses = title.includes("الكورسات");
    const isBooks = title.includes("الكتب");
    const isWebinars = title.includes("الويبينار");

    let pageItems = items;
    if (isCourses) pageItems = items.filter(x=>x.type==="course");
    if (isBooks) pageItems = items.filter(x=>x.type==="book");
    if (isWebinars) pageItems = items.filter(x=>x.type==="webinar");

    if (category) fillSelect(category, uniq(pageItems.map(x=>x.category)));

    function rerender(){
      const q = search ? search.value : "";
      const c = category ? category.value : "";
      const l = level ? level.value : "";
      const filtered = applyFilters(pageItems, q, c, l);
      grid.innerHTML = filtered.map(renderCard).join("") || `<div class="card"><p class="muted">لا توجد نتائج.</p></div>`;
      mountAddToCart();
      updateCartBadge();
    }
    rerender();
    search?.addEventListener("input", rerender);
    category?.addEventListener("change", rerender);
    level?.addEventListener("change", rerender);
  }
})();
