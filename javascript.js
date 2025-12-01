// ------------------- Data Produk -------------------
const WA_NUMBER = '6282350538688'; // no leading + or 0 (international format for wa.me)

// Make sure product ids are unique
const products = [
  { id: 'g1', name: 'Ayam Geprek Dada/Paha atas + Nasi', price: 20000, img: 'img/gambar2.jpg' },
  { id: 'g6', name: 'Ayam Geprek Sayap/Paha bawah  + Nasi', price: 18000, img: 'img/gambar7.jpg' },
  { id: 'g2', name: 'Ayam Krispy Paha Atas + Nasi', price: 15000, img: 'img/gambar1.jpg' },
  { id: 'g3', name: 'Ayam Krispy Dada + Nasi', price: 15000, img: 'img/gambar4.jpg' },
  { id: 'g4', name: 'Ayam Krispy Sayap + Nasi', price: 13000, img: 'img/gambar3.jpg' },
  { id: 'g5', name: 'Ayam Krispy Paha bawah + Nasi', price: 13000 , img: 'img/gambar6.jpg' },
  { id: 'f1', name: 'Frozen Chicken Geprek (1 pack)', price: 45000, img: 'img/gambar8.jpg' }
];

const PLACEHOLDER_IMG_SVG = encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300'>
     <rect width='100%' height='100%' fill='#eef1f4'/>
     <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='#9aa3ab' font-family='Arial, sans-serif' font-size='16'>Ganti gambar di sini</text>
   </svg>`
);
const PLACEHOLDER_IMG = data:image/svg+xml;utf8,${PLACEHOLDER_IMG_SVG};

function formatRupiah(n){
  return 'Rp ' + n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function renderMenu(){
  const grid = document.getElementById('menuGrid');
  grid.innerHTML = '';
  products.forEach(p => {
    const div = document.createElement('div');
    div.className = 'menu-item';

    const thumb = `<div class="menu-thumb" data-img="${p.img || ''}" ${p.img ? `style="background-image:url('${p.img}')" ` : ''}>${!p.img ? '<div style="padding:8px;text-align:center">GANTI GAMBAR</div>' : ''}</div>`;

    div.innerHTML = `
      ${thumb}
      <div class="menu-body">
        <h3>${p.name}</h3>
        <p>Resep khas, dibuat dengan bahan pilihan. Pilih jumlah dan tambah ke keranjang atau pesan cepat lewat WhatsApp.</p>
        <div class="menu-footer">
          <div>
            <button class="price-btn" onclick="quickOrder('${p.id}')">${formatRupiah(p.price)}</button>
          </div>
          <div style="display:flex;gap:8px">
            <button class="small-btn" onclick="addToCart('${p.id}', 1)">Tambah</button>
            <button class="small-btn" onclick="addToCart('${p.id}', 2)">+2</button>
          </div>
        </div>
      </div>
    `;
    grid.appendChild(div);
  });
}

// ------------------- Cart Logic -------------------
let cart = {}; // { productId: qty }

function saveCart(){ localStorage.setItem('agd_cart', JSON.stringify(cart)); }
function loadCart(){ try{ cart = JSON.parse(localStorage.getItem('agd_cart')) || {}; }catch(e){ cart = {}; } }

function addToCart(id, qty=1){
  if(!cart[id]) cart[id]=0;
  cart[id] += qty;
  if(cart[id] < 1) delete cart[id];
  saveCart();
  renderCart();
  openCart();
}

function updateQty(id, qty){
  if(qty <= 0){ delete cart[id]; }
  else cart[id] = qty;
  saveCart(); renderCart();
}

function removeFromCart(id){
  delete cart[id]; saveCart(); renderCart();
}

function clearCart(){ cart={}; saveCart(); renderCart(); }

function cartSummary(){
  let total=0, items=0;
  for(const id in cart){
    const p = products.find(x=>x.id===id);
    if(!p) continue;
    const qty = cart[id];
    total += p.price * qty;
    items += qty;
  }
  return { total, items };
}

function renderCart(){
  const panel = document.getElementById('cartDrawer');
  const itemsWrap = document.getElementById('cartItems');
  const count = document.getElementById('cartCount');
  const itemCount = document.getElementById('cartItemCount');
  const totalEl = document.getElementById('cartTotal');

  itemsWrap.innerHTML = '';
  let any=false;
  for(const id in cart){
    const p = products.find(x=>x.id===id);
    if(!p) continue;
    any=true;
    const qty = cart[id];
    const row = document.createElement('div');
    row.className = 'cart-row';
    const imgSrc = p.img ? p.img : PLACEHOLDER_IMG;
    row.innerHTML = `
      <img src="${imgSrc}" alt="${p.name}">
      <div style="flex:1">
        <div style="font-weight:700">${p.name}</div>
        <div style="color:var(--muted);font-size:13px">${formatRupiah(p.price)} x ${qty} = <strong>${formatRupiah(p.price*qty)}</strong></div>
        <div style="margin-top:8px;display:flex;gap:6px;align-items:center">
          <div class="qty-control">
            <button class="small-btn" onclick="updateQty('${id}', ${qty-1})">-</button>
            <div style="padding:6px 10px;border-radius:8px;background:#f7f7f9">${qty}</div>
            <button class="small-btn" onclick="updateQty('${id}', ${qty+1})">+</button>
          </div>
          <button class="small-btn" onclick="removeFromCart('${id}')">Hapus</button>
        </div>
      </div>
    `;
    itemsWrap.appendChild(row);
  }

  const { total, items } = cartSummary();
  count.textContent = items;
  itemCount.textContent = items + ' item';
  totalEl.textContent = formatRupiah(total);

  if(!any){
    itemsWrap.innerHTML = <div style="padding:14px;color:var(--muted)">Keranjang kosong. Tambah menu untuk memesan.</div>;
  }
}

// ------------------- Quick Order (price click) -------------------
function quickOrder(id){
  const p = products.find(x=>x.id===id);
  if(!p) return;
  let qty = prompt('Jumlah ' + p.name + ' yang dipesan:', '1');
  if(qty === null) return;
  qty = parseInt(qty) || 1;
  let address = prompt('Masukkan alamat pengiriman (contoh: Jl. ABC No. 1):', '');
  if(address === null) return;
  const subtotal = p.price * qty;
  const msg = Halo Ayam Geprek Dini 👋%0A%0ASaya mau pesan:%0A- ${encodeURIComponent(qty + ' x ' + p.name)}%0AHarga per pcs: ${encodeURIComponent(formatRupiah(p.price))}%0ASubtotal: ${encodeURIComponent(formatRupiah(subtotal))}%0A%0AAlamat antar: ${encodeURIComponent(address)}%0A%0ATerima kasih.;
  const url = https://wa.me/${WA_NUMBER}?text=${msg};
  window.open(url, '_blank');
}

// ------------------- Cart UI Controls -------------------
const cartDrawer = document.getElementById('cartDrawer');
const openCartBtn = document.getElementById('openCartBtn');

function openCart(){ cartDrawer.classList.add('open'); }
function closeCart(){ cartDrawer.classList.remove('open'); }

openCartBtn.addEventListener('click', ()=>{ cartDrawer.classList.toggle('open'); });

// ------------------- Checkout -------------------
const modalBackdrop = document.getElementById('modalBackdrop');
function openCheckout(){
  const { items } = cartSummary();
  if(items === 0){
    alert('Keranjang kosong. Tambahkan menu terlebih dahulu atau gunakan pesan cepat.');
    return;
  }
  modalBackdrop.classList.add('show');
}
function closeCheckout(){ modalBackdrop.classList.remove('show'); }

document.getElementById('checkoutForm').addEventListener('submit', function(e){
  e.preventDefault();
  const name = document.getElementById('checkoutName').value.trim();
  const address = document.getElementById('checkoutAddress').value.trim();
  const note = document.getElementById('checkoutNote').value.trim();
  if(!name || !address){ alert('Nama dan alamat wajib diisi.'); return; }

  let text = Halo Ayam Geprek Dini 👋%0A%0APesanan dari: ${encodeURIComponent(name)}%0AAlamat: ${encodeURIComponent(address)}%0A%0ADetail pesanan:%0A;
  let total = 0;
  for(const id in cart){
    const p = products.find(x=>x.id===id);
    if(!p) continue;
    const qty = cart[id];
    total += p.price*qty;
    text += - ${encodeURIComponent(qty + ' x ' + p.name)} = ${encodeURIComponent(formatRupiah(p.price*qty))}%0A;
  }
  text += %0ATotal:%20${encodeURIComponent(formatRupiah(total))}%0A;
  if(note) text += %0ANote:%20${encodeURIComponent(note)}%0A;
  text += %0ATerima%20kasih.;

  const url = https://wa.me/${WA_NUMBER}?text=${text};
  window.open(url, '_blank');

  clearCart();
  closeCheckout();
  closeCart();
});

// Quick contact form sends directly to WA (single message)
document.getElementById('quickContact').addEventListener('submit', function(e){
  e.preventDefault();
  const name = document.getElementById('contactName').value.trim();
  const order = document.getElementById('contactOrder').value.trim();
  const address = document.getElementById('contactAddress').value.trim();
  if(!name || !address){ alert('Nama dan alamat wajib diisi.'); return; }
  let text = Halo Ayam Geprek Dini 👋%0A%0A${encodeURIComponent('Nama: ' + name)}%0AAlamat: ${encodeURIComponent(address)}%0A;
  if(order) text += %0APesanan (ditulis manual): ${encodeURIComponent(order)}%0A;
  text += %0ATerima%20kasih.;
  const url = https://wa.me/${WA_NUMBER}?text=${text};
  window.open(url, '_blank');
});

// ------------------- Navigation & Init -------------------
document.addEventListener('DOMContentLoaded', ()=>{
  renderMenu();
  loadCart();
  renderCart();

  const navLinks = document.querySelectorAll('.nav-link');
  const pageSections = document.querySelectorAll('.page-section');
  navLinks.forEach(link=>{
    link.addEventListener('click', function(e){
      e.preventDefault();
      const target = this.dataset.target;
      if(!target) return;
      navLinks.forEach(l=>l.classList.remove('active'));
      this.classList.add('active');
      pageSections.forEach(s=>s.classList.remove('active'));
      const el = document.getElementById(target);
      if(el) el.classList.add('active');
      document.getElementById('navUl').classList.remove('show');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });

  const mobileToggle = document.getElementById('mobileToggle');
  mobileToggle.addEventListener('click', ()=> {
    document.getElementById('navUl').classList.toggle('show');
  });

  setupPosters();

  const aboutImg = document.getElementById('aboutImage');
  if(!aboutImg.getAttribute('src') || aboutImg.getAttribute('src') === '') aboutImg.setAttribute('src', PLACEHOLDER_IMG);
});

function scrollToSection(id){
  const link = document.querySelector(.nav-link[data-target="${id}"]);
  if(link) link.click();
}

// Posters
function setupPosters(){
  const posters = Array.from(document.querySelectorAll('.poster'));
  posters.forEach(p=>{
    const url = p.getAttribute('data-img') || '';
    if(url){
      p.style.backgroundImage = url('${url}');
    } else {
      p.setAttribute('data-img', '');
    }
  });

  let idx = 0;
  setInterval(()=>{
    const current = posters[idx];
    current.classList.remove('active');
    idx = (idx+1) % posters.length;
    const next = posters[idx];
    setTimeout(()=> next.classList.add('active'), 60);
  }, 3000);
}