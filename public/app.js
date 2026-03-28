// ============================================================
// HOUSE OF QUEEN BEE — app.js  |  +263 78 612 7266
// Full Production Payment Integration
// ============================================================

const WA_NUMBER = "263786127266";
const BACKEND_URL = "http://localhost:3000"; 

// ============================================================
// PRODUCTS DATA - Synced with index.html IDs
// ============================================================
const BASE = "https://www.houseofqueenbee.com/assets/images/thumbnails/";

const products = [
  { id:1,  name:"Nana Dresses",              img:BASE+"1763981240TBO4ZRdT.jpg", category:"dresses", price:40,  badge:"Sold out",     desc:"A fan favourite — light, elegant and effortlessly beautiful." },
  { id:2,  name:"Samira dress",              img:BASE+"1764323427Rwa6kRbM.jpg", category:"dresses", price:45,  badge:null,           desc:"Graceful silhouette with a modern African touch." },
  { id:3,  name:"Mahuswa dress",              img:BASE+"1764321128QMpX1vU2.jpg", category:"dresses", price:60,  badge:null,           desc:"Elegant and refined with a natural African aesthetic." },
  { id:4,  name:"Asoke short",                img:BASE+"1763994900Td13i2ov.jpg", category:"dresses", price:60,  badge:"Best Seller",  desc:"Authentic Asoke weave in a modern short dress cut." },
  { id:5,  name:"Queen Bee dress",            img:BASE+"1763994749VQdcz2v2.jpg", category:"dresses", price:60,  badge:"Best Seller",  desc:"Our signature piece. Wear it and own every room." },
  { id:6,  name:"Malaika Dresses",            img:BASE+"1763989365qNQcNpAU.jpg", category:"dresses", price:50,  badge:"Best Seller",  desc:"Stunning everyday elegance. A wardrobe essential." },
  { id:7,  name:"Bitibiti Dresses",           img:BASE+"17639886677BRqz3PN.jpg", category:"dresses", price:50,  badge:"Best Seller",  desc:"Bold, vibrant and unmistakably African." },
  { id:8,  name:"Garita Dresses",             img:BASE+"1763988326gE1tkPvX.jpg", category:"dresses", price:50,  badge:"Best Seller",  desc:"Flowing fabric meets striking prints." },
  { id:9,  name:"Stunning Boubou",            img:BASE+"1763995954MpBcnFJt.jpg", category:"boubou",  price:50,  badge:"Best Seller",  desc:"Breathtaking Boubou craftsmanship." },
  { id:10, name:"Sarafina Dresses",           img:BASE+"17639895032kG3t6Oc.jpg", category:"dresses", price:50,  badge:"Best Seller",  desc:"Soft, feminine and beautifully crafted." },
  { id:11, name:"2kg Dress",                  img:BASE+"1763995291WLcbhdgs.jpg", category:"gowns",   price:55,  badge:"Best Seller",  desc:"Rich, heavy fabric with a commanding presence." },
  { id:12, name:"Premium or Nothing",         img:BASE+"1763994199ehwnixp0.jpg", category:"dresses", price:50,  badge:"Best Seller",  desc:"Premium quality, premium feel." },
  { id:13, name:"haija Dress",                img:BASE+"1763737973MKZxUYdG.jpg", category:"boubou",  price:50,  badge:"Best Seller",  desc:"A stunning Boubou silhouette with rich detail." },
  { id:14, name:"Short Kimono Dress",         img:BASE+"1764167733ua2hut9n.jpg", category:"kimonos", price:60,  badge:"Best Seller",  desc:"A beautiful short Kimono with African print detailing." },
  { id:15, name:"Imara Dresses",              img:BASE+"17639880596Bs8bXw3.jpg", category:"dresses", price:60,  badge:"Best Seller",  desc:"Strong, bold and beautiful." },
  { id:16, name:"Malkia",                     img:BASE+"17639817238dh5A5cK.jpg", category:"dresses", price:60,  badge:"Best Seller",  desc:"Fit for royalty. Flowing, regal and crafted with care." },
  { id:17, name:"Zahara Dresses",             img:BASE+"1763981518DT7tAKYx.jpg", category:"dresses", price:60,  badge:"Best Seller",  desc:"A perennial favourite. Timeless style." },
  { id:18, name:"Malkia Dresses",             img:BASE+"17639817238dh5A5cK.jpg", category:"dresses", price:60,  badge:"Best Seller",  desc:"Regal design for special occasions." },
  { id:19, name:"Mahra Dresses",              img:BASE+"17643314729lr6vXEB.jpg", category:"dresses", price:60,  badge:"Best Seller",  desc:"Sophisticated evening wear." },
  { id:20, name:"Cyra Boubou Dresses",        img:BASE+"1763986068dp2fLUoS.jpg", category:"boubou",  price:60,  badge:"Best Seller",  desc:"A lighter Boubou silhouette with delicate details." },
  { id:21, name:"Crystal Bubu Dresses",       img:BASE+"1763985772qrQ3kIMw.jpg", category:"boubou",  price:60,  badge:"Best Seller",  desc:"Crystal-inspired detailing on a classic Boubou frame." },
  { id:22, name:"Asoke long Dress",           img:BASE+"17637393295sBVXUR8.jpg", category:"gowns",   price:60,  badge:"Best Seller",  desc:"Floor-length Asoke weave gown." }
];

let cart = [];

// ============================================================
// UI & INTERACTION FUNCTIONS
// ============================================================

// Open Quick View Modal
function openQuickView(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;

  const qvImg = document.getElementById("qv-img");
  const qvName = document.getElementById("qv-name");
  const qvPrice = document.getElementById("qv-price");
  const qvDesc = document.getElementById("qv-desc");

  if (qvImg) qvImg.src = product.img;
  if (qvName) qvName.textContent = product.name;
  if (qvPrice) qvPrice.textContent = "$" + product.price;
  if (qvDesc) qvDesc.textContent = product.desc;
  
  const addBtn = document.querySelector(".qv-add-btn");
  if (addBtn) {
    addBtn.onclick = () => {
      addToCart(product.id);
      closeQuickView();
    };
  }

  const overlay = document.getElementById("quick-view-overlay");
  if (overlay) {
    overlay.style.display = "flex";
    document.body.style.overflow = "hidden";
  }
}

// Close Quick View Modal
function closeQuickView() {
  const overlay = document.getElementById("quick-view-overlay");
  if (overlay) {
    overlay.style.display = "none";
    document.body.style.overflow = "auto";
  }
}

// Cart Management
function addToCart(productId) {
  const product = products.find(p => p.id === productId);
  if (product) {
    cart.push(product);
    updateCartUI();
    showToast(product.name + " added to bag!");
  }
}

function updateCartUI() {
  const cartCount = document.querySelector(".cart-count");
  if (cartCount) cartCount.textContent = cart.length;
  
  const cartItems = document.getElementById("cart-items-list");
  if (!cartItems) return;
  
  cartItems.innerHTML = "";
  let total = 0;

  cart.forEach((item, index) => {
    total += item.price;
    const div = document.createElement("div");
    div.className = "cart-item";
    div.style.display = "flex";
    div.style.justifyContent = "space-between";
    div.style.padding = "10px 0";
    div.style.borderBottom = "1px solid #eee";
    div.innerHTML = `
      <span>${item.name}</span>
      <span>$${item.price} <button onclick="removeFromCart(${index})" style="background:none; border:none; color:#C9A84C; cursor:pointer; font-weight:bold; margin-left:8px;">✕</button></span>
    `;
    cartItems.appendChild(div);
  });

  const totalDisplay = document.getElementById("cart-total-amt");
  if (totalDisplay) totalDisplay.textContent = "$" + total;
}

function removeFromCart(index) {
  cart.splice(index, 1);
  updateCartUI();
}

function toggleCart() {
  const sidebar = document.getElementById("cart-sidebar");
  if (sidebar) sidebar.classList.toggle("active");
}

// Feedback Toast
function showToast(msg) {
  const existing = document.querySelector(".toast");
  if (existing) existing.remove();
  
  const t = document.createElement("div");
  t.className = "toast";
  t.textContent = msg;
  t.style.cssText = "position:fixed;bottom:32px;left:50%;transform:translateX(-50%);background:#0A0A0A;color:#C9A84C;padding:14px 28px;font-family:'Montserrat',sans-serif;font-size:13px;letter-spacing:1px;border-radius:2px;z-index:9999;box-shadow:0 8px 24px rgba(0,0,0,0.3);";
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3500);
}

// Mobile Menu Toggle
function toggleMenu() {
  const links = document.querySelector(".nav-links");
  if (!links) return;
  const isOpen = links.style.display === "flex";
  links.style.display = isOpen ? "none" : "flex";
  if (!isOpen) {
    links.style.flexDirection = "column";
    links.style.position = "absolute";
    links.style.top = "70px";
    links.style.left = "0";
    links.style.right = "0";
    links.style.background = "#0A0A0A";
    links.style.padding = "20px";
  }
}