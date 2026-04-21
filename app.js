// app.js - Interacciones: drawer, submenus, buscador, filtrado, registro y pago demo, modal pedido
document.addEventListener('DOMContentLoaded', () => {
  const hamburger = document.getElementById('hamburger');
  const drawer = document.getElementById('mobileDrawer');
  const drawerToggles = document.querySelectorAll('.drawer-toggle');
  const cats = document.querySelectorAll('.cat');
  const cards = Array.from(document.querySelectorAll('.card'));
  const orderModal = document.getElementById('orderModal');
  const orderTitle = document.getElementById('orderTitle');
  const orderBody = document.getElementById('orderBody');
  const closeModalBtn = document.getElementById('closeModal');
  const toPayBtn = document.getElementById('toPay');
  const amountInput = document.getElementById('p-amount');
  const searchInput = document.getElementById('searchInput');

  // Hamburger toggles drawer
  hamburger.addEventListener('click', () => {
    const visible = drawer.style.display === 'block';
    drawer.style.display = visible ? 'none' : 'block';
    drawer.setAttribute('aria-hidden', visible ? 'true' : 'false');
  });

  // Drawer submenus
  drawerToggles.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = document.getElementById(btn.dataset.target);
      if (!target) return;
      const open = target.style.display === 'block';
      target.style.display = open ? 'none' : 'block';
      btn.setAttribute('aria-expanded', String(!open));
    });
  });

  // Desktop submenu keyboard toggle
  document.querySelectorAll('.nav-desktop .has-sub .nav-btn').forEach(btn => {
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const sub = btn.nextElementSibling;
        sub.style.display = sub.style.display === 'block' ? 'none' : 'block';
      }
    });
  });

  // Filtrado por categoría (botones y enlaces)
  function filterBy(cat) {
    cards.forEach(card => {
      const c = card.dataset.cat;
      card.style.display = (cat === 'todas' || c === cat) ? '' : 'none';
    });
    document.querySelectorAll('.cat').forEach(c => c.classList.toggle('active', c.dataset.cat === cat));
  }

  cats.forEach(c => {
    c.addEventListener('click', () => filterBy(c.dataset.cat));
  });

  document.querySelectorAll('[data-cat]').forEach(link => {
    link.addEventListener('click', (e) => {
      const cat = link.dataset.cat;
      if (cat) filterBy(cat);
      if (drawer.style.display === 'block') { drawer.style.display = 'none'; drawer.setAttribute('aria-hidden','true'); }
    });
  });

  // Buscador: filtra por title, desc o data-keywords
  searchInput.addEventListener('input', () => {
    const q = searchInput.value.trim().toLowerCase();
    if (!q) {
      cards.forEach(c => c.style.display = '');
      return;
    }
    cards.forEach(card => {
      const title = card.querySelector('h3')?.textContent.toLowerCase() || '';
      const desc = card.querySelector('.desc')?.textContent.toLowerCase() || '';
      const keywords = (card.dataset.keywords || '').toLowerCase();
      const match = title.includes(q) || desc.includes(q) || keywords.includes(q);
      card.style.display = match ? '' : 'none';
    });
  });

  // Pedir: abrir modal con resumen
  document.querySelectorAll('.order').forEach(btn => {
    btn.addEventListener('click', () => {
      const name = btn.dataset.name;
      const price = btn.dataset.price;
      orderTitle.textContent = name;
      orderBody.innerHTML = `<div style="font-weight:800">$${price}</div><div class="muted" style="margin-top:8px">¿Deseas pagar ahora?</div>`;
      if (amountInput) amountInput.value = `$${price}`;
      orderModal.classList.add('open');
      orderModal.setAttribute('aria-hidden','false');
    });
  });

  function closeModal() {
    orderModal.classList.remove('open');
    orderModal.setAttribute('aria-hidden','true');
  }
  closeModalBtn.addEventListener('click', closeModal);
  orderModal.addEventListener('click', (e) => { if (e.target === orderModal) closeModal(); });

  toPayBtn.addEventListener('click', () => {
    closeModal();
    document.getElementById('p-name').focus();
    document.getElementById('paymentMsg').textContent = 'Listo para pagar';
  });

  // Registro demo (cliente-side)
  const registerForm = document.getElementById('registerForm');
  const registerMsg = document.getElementById('registerMsg');
  registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('r-name').value.trim();
    const email = document.getElementById('r-email').value.trim();
    if (!name || !email) {
      registerMsg.textContent = 'Completa los campos requeridos.';
      return;
    }
    registerMsg.textContent = 'Cuenta creada correctamente (demo). Revisa tu correo.';
    registerForm.reset();
  });

  document.getElementById('fillDemo').addEventListener('click', () => {
    document.getElementById('r-name').value = 'Cliente Demo';
    document.getElementById('r-email').value = 'demo@ejemplo.com';
    document.getElementById('r-phone').value = '+54 9 11 1234 5678';
    document.getElementById('r-password').value = 'demo1234';
  });

  // Pago demo (cliente-side)
  const paymentForm = document.getElementById('paymentForm');
  const paymentMsg = document.getElementById('paymentMsg');
  paymentForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const card = document.getElementById('p-card').value.replace(/\s/g,'');
    const cvv = document.getElementById('p-cvv').value.trim();
    if (card.length < 12 || cvv.length < 3) {
      paymentMsg.textContent = 'Datos de tarjeta inválidos (demo).';
      return;
    }
    paymentMsg.textContent = 'Pago simulado realizado. Gracias por tu compra.';
    setTimeout(() => { paymentForm.reset(); if (amountInput) amountInput.value = '$0'; }, 1200);
  });

  // Formateo número de tarjeta
  const cardInput = document.getElementById('p-card');
  cardInput.addEventListener('input', function() {
    let v = this.value.replace(/\D/g,'').slice(0,19);
    v = v.match(/.{1,4}/g)?.join(' ') || v;
    this.value = v;
  });

  // Close drawer on outside click
  document.addEventListener('click', (e) => {
    if (!drawer.contains(e.target) && e.target !== hamburger) {
      drawer.style.display = 'none';
      drawer.setAttribute('aria-hidden','true');
    }
  });
});
