// app.js - Interacciones: drawer, submenus, buscador, filtrado, registro y pago demo, modal pedido, carrito de compra

// ===== CARRITO DE COMPRA - SISTEMA COMPLETO =====
class ShoppingCart {
  constructor() {
    this.items = this.loadFromStorage();
    this.init();
  }

  loadFromStorage() {
    const stored = localStorage.getItem('carrito');
    return stored ? JSON.parse(stored) : [];
  }

  saveToStorage() {
    localStorage.setItem('carrito', JSON.stringify(this.items));
  }

  addItem(name, price) {
    const existingItem = this.items.find(item => item.name === name);
    if (existingItem) {
      existingItem.quantity++;
    } else {
      this.items.push({ name, price, quantity: 1 });
    }
    this.saveToStorage();
    this.updateUI();
    
    // Animación de notificación
    this.showNotification();
  }

  removeItem(name) {
    this.items = this.items.filter(item => item.name !== name);
    this.saveToStorage();
    this.updateUI();
  }

  updateQuantity(name, quantity) {
    const item = this.items.find(item => item.name === name);
    if (item) {
      if (quantity <= 0) {
        this.removeItem(name);
      } else {
        item.quantity = quantity;
        this.saveToStorage();
        this.updateUI();
      }
    }
  }

  getTotal() {
    return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  getItemCount() {
    return this.items.reduce((count, item) => count + item.quantity, 0);
  }

  clear() {
    this.items = [];
    this.saveToStorage();
    this.updateUI();
  }

  updateUI() {
    this.updateBadge();
    this.updateCartModal();
  }

  updateBadge() {
    const badge = document.getElementById('cartBadge');
    const count = this.getItemCount();
    if (badge) {
      badge.textContent = count;
      badge.style.display = count > 0 ? 'flex' : 'none';
    }
  }

  updateCartModal() {
    const cartList = document.getElementById('cartList');
    const cartTotal = document.getElementById('cartTotal');
    
    if (!cartList) return;

    if (this.items.length === 0) {
      cartList.innerHTML = '<div class="empty-cart">El carrito está vacío</div>';
      if (cartTotal) cartTotal.textContent = '$0';
      return;
    }

    cartList.innerHTML = this.items.map(item => `
      <div class="cart-item">
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">$${item.price.toLocaleString('es-AR')}</div>
        </div>
        <div class="cart-item-qty">
          <button class="qty-btn" onclick="cart.updateQuantity('${item.name.replace(/'/g, "\\'")}', ${item.quantity - 1})">−</button>
          <span class="qty-value">${item.quantity}</span>
          <button class="qty-btn" onclick="cart.updateQuantity('${item.name.replace(/'/g, "\\'")}', ${item.quantity + 1})">+</button>
        </div>
        <div class="cart-item-subtotal">$${(item.price * item.quantity).toLocaleString('es-AR')}</div>
        <button class="cart-remove" onclick="cart.removeItem('${item.name.replace(/'/g, "\\'")}')">✕</button>
      </div>
    `).join('');

    const total = this.getTotal();
    if (cartTotal) cartTotal.textContent = `$${total.toLocaleString('es-AR')}`;
  }

  showNotification() {
    const notification = document.getElementById('cartNotification');
    if (notification) {
      notification.classList.add('show');
      animateElement(notification, 'bounce-in');
      setTimeout(() => {
        notification.classList.remove('show');
      }, 3000);
    }
  }

  init() {
    this.updateBadge();
    this.updateCartModal();
  }
}

// Instancia global del carrito
let cart = new ShoppingCart();

// ===== FUNCIONES PARA ACTUALIZAR VISUALIZACIÓN DE TARJETA =====

// Actualizar nombre en la tarjeta
function updateCardHolder(value) {
  const display = document.getElementById('cardHolderDisplay');
  if (display) {
    display.textContent = value.toUpperCase() || 'SU NOMBRE';
  }
}

// Actualizar número de tarjeta con formato
function updateCardNumber(value) {
  let formatted = value.replace(/\D/g, '').slice(0, 16);
  formatted = formatted.match(/.{1,4}/g)?.join(' ') || formatted;
  
  const input = document.getElementById('p-card');
  if (input) input.value = formatted;
  
  const display = document.getElementById('cardNumberDisplay');
  if (display) {
    display.textContent = formatted || '•••• •••• •••• ••••';
  }
}

// Actualizar fecha de vencimiento
function updateCardExpiry(value) {
  let formatted = value.replace(/\D/g, '');
  if (formatted.length >= 2) {
    formatted = formatted.slice(0, 2) + '/' + formatted.slice(2, 4);
  }
  
  const input = document.getElementById('p-expiry');
  if (input) input.value = formatted;
  
  const display = document.getElementById('cardExpiryDisplay');
  if (display) {
    display.textContent = formatted || 'MM/YY';
  }
}

// Función global para agregar al carrito (usada en onclick)
function agregarCarrito(name, price) {
  cart.addItem(name, price);
  showCartNotification();
}

// Notificación visual al agregar
function showCartNotification() {
  const notification = document.getElementById('cartNotification');
  if (!notification) return;
  notification.classList.add('show');
  setTimeout(() => notification.classList.remove('show'), 2000);
}

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

  // ===== HAMBURGER MENU =====
  if (hamburger) {
    hamburger.addEventListener('click', (e) => {
      e.stopPropagation();
      if (drawer) {
        const isActive = drawer.classList.contains('active');
        if (isActive) {
          drawer.classList.remove('active');
          drawer.setAttribute('aria-hidden', 'true');
        } else {
          drawer.classList.add('active');
          drawer.setAttribute('aria-hidden', 'false');
        }
      }
    });
  }

  // Close drawer on outside click
  document.addEventListener('click', (e) => {
    if (drawer && !drawer.contains(e.target) && e.target !== hamburger) {
      drawer.classList.remove('active');
      drawer.setAttribute('aria-hidden', 'true');
    }
  });

  // ===== DRAWER SUBMENUS =====
  drawerToggles.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.getElementById(btn.dataset.target);
      if (!target) return;
      
      const isOpen = target.classList.contains('active');
      const isExpanded = btn.getAttribute('aria-expanded') === 'true';
      
      // Close others in the drawer
      document.querySelectorAll('.drawer-submenu.active').forEach(sub => {
        if (sub !== target) sub.classList.remove('active');
      });
      document.querySelectorAll('.drawer-toggle[aria-expanded="true"]').forEach(toggle => {
        if (toggle !== btn) toggle.setAttribute('aria-expanded', 'false');
      });
      
      // Toggle this one
      target.classList.toggle('active');
      btn.setAttribute('aria-expanded', String(!isExpanded));
    });
  });

  // Close drawer when clicking on a link
  if (drawer) {
    document.querySelectorAll('.drawer-menu a').forEach(link => {
      link.addEventListener('click', () => {
        // Close all submenus
        document.querySelectorAll('.drawer-submenu.active').forEach(sub => sub.classList.remove('active'));
        document.querySelectorAll('.drawer-toggle[aria-expanded="true"]').forEach(toggle => toggle.setAttribute('aria-expanded', 'false'));
        // Close drawer
        drawer.classList.remove('active');
        drawer.setAttribute('aria-hidden', 'true');
      });
    });
  }

  // ===== DESKTOP SUBMENU KEYBOARD =====
  document.querySelectorAll('.nav-desktop .has-sub .nav-btn').forEach(btn => {
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const sub = btn.nextElementSibling;
        if (sub) {
          sub.style.display = sub.style.display === 'block' ? 'none' : 'block';
        }
      }
    });
  });

  // ===== FILTRADO POR CATEGORÍA =====
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
    });
  });

  // ===== BUSCADOR =====
  if (searchInput) {
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
  }

  // ===== CARRITO MODAL =====
  const cartBtn = document.getElementById('cartBtn');
  const cartModal = document.getElementById('cartModal');
  const closeCartBtn = document.getElementById('closeCart');
  const checkoutBtn = document.getElementById('checkoutBtn');

  if (cartBtn && cartModal) {
    cartBtn.addEventListener('click', () => {
      cartModal.classList.add('open');
      cartModal.setAttribute('aria-hidden', 'false');
    });
  }

  if (closeCartBtn && cartModal) {
    closeCartBtn.addEventListener('click', () => {
      cartModal.classList.remove('open');
      cartModal.setAttribute('aria-hidden', 'true');
    });
  }

  if (cartModal) {
    cartModal.addEventListener('click', (e) => {
      if (e.target === cartModal) {
        cartModal.classList.remove('open');
        cartModal.setAttribute('aria-hidden', 'true');
      }
    });
  }

  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      if (cart.items.length === 0) {
        alert('El carrito está vacío');
        return;
      }
      const total = cart.getTotal();
      const amountInput = document.getElementById('p-amount');
      if (amountInput) amountInput.value = `$${total.toLocaleString('es-AR')}`;
      
      // Ir a la sección de pago
      const paymentSection = document.getElementById('pago');
      if (paymentSection) {
        paymentSection.scrollIntoView({ behavior: 'smooth' });
        if (cartModal) {
          cartModal.classList.remove('open');
          cartModal.setAttribute('aria-hidden', 'true');
        }
      }
    });
  }

  // ===== MODAL DE PEDIDO =====

  if (orderModal) {
    document.querySelectorAll('.order').forEach(btn => {
      btn.addEventListener('click', () => {
        const name = btn.dataset.name;
        const price = btn.dataset.price;
        if (orderTitle) orderTitle.textContent = name || 'Pedido';
        if (orderBody) orderBody.innerHTML = `<div style="font-weight:800">$${price || '0'}</div><div class="muted" style="margin-top:8px">¿Deseas pagar ahora?</div>`;
        if (amountInput) amountInput.value = `$${price || '0'}`;
        orderModal.classList.add('open');
        orderModal.setAttribute('aria-hidden','false');
      });
    });

    function closeModal() {
      orderModal.classList.remove('open');
      orderModal.setAttribute('aria-hidden','true');
    }

    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    orderModal.addEventListener('click', (e) => { if (e.target === orderModal) closeModal(); });

    if (toPayBtn) {
      toPayBtn.addEventListener('click', () => {
        closeModal();
        const paymentNameInput = document.getElementById('p-name');
        if (paymentNameInput) paymentNameInput.focus();
        const paymentMsg = document.getElementById('paymentMsg');
        if (paymentMsg) paymentMsg.textContent = 'Listo para pagar';
      });
    }
  }

  // ===== REGISTRO =====
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    const registerMsg = document.getElementById('registerMsg');
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('r-name')?.value.trim();
      const email = document.getElementById('r-email')?.value.trim();
      const password = document.getElementById('r-password')?.value;
      const confirmPassword = document.getElementById('r-confirm-password')?.value;

      if (!name || !email || !password) {
        showMessage(registerMsg, 'Completa todos los campos requeridos.', 'error');
        return;
      }

      if (password !== confirmPassword) {
        showMessage(registerMsg, 'Las contraseñas no coinciden.', 'error');
        return;
      }

      if (password.length < 6) {
        showMessage(registerMsg, 'La contraseña debe tener al menos 6 caracteres.', 'error');
        return;
      }

      showMessage(registerMsg, 'Cuenta creada correctamente (demo). Revisa tu correo.', 'success');
      createConfetti();
      registerForm.reset();
    });

    const fillDemoBtn = document.getElementById('fillDemo');
    if (fillDemoBtn) {
      fillDemoBtn.addEventListener('click', () => {
        const rName = document.getElementById('r-name');
        const rEmail = document.getElementById('r-email');
        const rPhone = document.getElementById('r-phone');
        const rPassword = document.getElementById('r-password');
        const rConfirmPassword = document.getElementById('r-confirm-password');
        if (rName) rName.value = 'Cliente Demo';
        if (rEmail) rEmail.value = 'demo@ejemplo.com';
        if (rPhone) rPhone.value = '+54 9 11 1234 5678';
        if (rPassword) rPassword.value = 'demo1234';
        if (rConfirmPassword) rConfirmPassword.value = 'demo1234';
      });
    }
  }

  // ===== FUNCIONES DE ANIMACIÓN =====
  function animateElement(element, animationClass, duration = 500) {
    if (!element) return;
    
    element.classList.add(animationClass);
    setTimeout(() => {
      element.classList.remove(animationClass);
    }, duration);
  }

  function showMessage(element, message, type = 'info') {
    if (!element) return;
    
    element.textContent = message;
    element.className = `msg ${type}`;
    animateElement(element, 'fade-in');
    
    // Auto-hide success messages after 3 seconds
    if (type === 'success') {
      setTimeout(() => {
        element.style.opacity = '0';
        setTimeout(() => {
          element.textContent = '';
          element.style.opacity = '1';
        }, 300);
      }, 3000);
    }
  }

  function animateButtonLoading(button, loading = true) {
    if (!button) return;
    
    if (loading) {
      button.classList.add('loading');
      button.disabled = true;
    } else {
      button.classList.remove('loading');
      button.disabled = false;
    }
  }

  function createConfetti() {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b', '#eb4d4b', '#6c5ce7', '#a29bfe'];
    
    for (let i = 0; i < 50; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      confetti.style.left = Math.random() * 100 + 'vw';
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.animationDelay = Math.random() * 3 + 's';
      confetti.style.animationDuration = (Math.random() * 3 + 2) + 's';
      document.body.appendChild(confetti);
      
      setTimeout(() => {
        confetti.remove();
      }, 5000);
    }
  }
  function updateCardNumber(value) {
    const display = document.getElementById('cardNumberDisplay');
    const typeDisplay = document.getElementById('cardTypeDisplay');
    const input = document.getElementById('p-card');
    
    // Formatear número
    let formatted = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
    input.value = formatted;
    
    // Detectar tipo de tarjeta
    const cardType = detectCardType(value.replace(/\s/g, ''));
    typeDisplay.textContent = getCardTypeIcon(cardType);
    
    // Mostrar en la tarjeta
    const masked = value.replace(/\s/g, '').replace(/(\d{4})(?=\d)/g, '$1 ');
    display.textContent = masked || '•••• •••• •••• ••••';
  }

  function updateCardHolder(value) {
    const display = document.getElementById('cardHolderDisplay');
    display.textContent = value.toUpperCase() || 'SU NOMBRE';
  }

  function updateCardExpiry(value) {
    const display = document.getElementById('cardExpiryDisplay');
    const input = document.getElementById('p-expiry');
    
    // Formatear MM/YY
    let formatted = value.replace(/\D/g, '');
    if (formatted.length >= 2) {
      formatted = formatted.slice(0, 2) + '/' + formatted.slice(2, 4);
    }
    input.value = formatted;
    display.textContent = formatted || 'MM/YY';
  }

  function updateCardCvv(value) {
    const display = document.getElementById('cardCvvDisplay');
    const cardInner = document.querySelector('.card-inner');
    
    display.textContent = value || '•••';
    
    // Animar volteo de tarjeta
    if (value) {
      cardInner.style.transform = 'rotateY(180deg)';
    } else {
      cardInner.style.transform = 'rotateY(0deg)';
    }
  }

  function detectCardType(number) {
    const patterns = {
      visa: /^4/,
      mastercard: /^5[1-5]/,
      amex: /^3[47]/,
      discover: /^6(?:011|5)/
    };
    
    for (const [type, pattern] of Object.entries(patterns)) {
      if (pattern.test(number)) return type;
    }
    return 'unknown';
  }

  function getCardTypeIcon(type) {
    const icons = {
      visa: '💳',
      mastercard: '💳',
      amex: '💳',
      discover: '💳',
      unknown: ''
    };
    return icons[type] || '';
  }

  function validateCardNumber(number) {
    // Algoritmo de Luhn
    const digits = number.replace(/\s/g, '').split('').reverse().map(d => parseInt(d));
    const sum = digits.reduce((acc, digit, index) => {
      if (index % 2 === 1) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      return acc + digit;
    }, 0);
    return sum % 10 === 0;
  }

  // Event listeners para tarjeta
  const cardInput = document.getElementById('p-card');
  const cardholderInput = document.getElementById('p-cardholder');
  const expiryInput = document.getElementById('p-expiry');
  const cvvInput = document.getElementById('p-cvv');
  
  if (cardInput) cardInput.addEventListener('input', (e) => updateCardNumber(e.target.value));
  if (cardholderInput) cardholderInput.addEventListener('input', (e) => updateCardHolder(e.target.value));
  if (expiryInput) cardholderInput.addEventListener('input', (e) => updateCardExpiry(e.target.value));
  if (cvvInput) cvvInput.addEventListener('input', (e) => updateCardCvv(e.target.value));
  if (cvvInput) cvvInput.addEventListener('blur', () => updateCardCvv('')); // Voltear de vuelta al perder foco

  const submitPaymentBtn = document.getElementById('submitPaymentBtn');
  if (submitPaymentBtn) {
    submitPaymentBtn.addEventListener('click', () => {
      animateButtonLoading(submitPaymentBtn, true);
      
      setTimeout(() => {
        const fullname = document.getElementById('p-fullname')?.value.trim();
        const email = document.getElementById('p-email')?.value.trim();
        const phone = document.getElementById('p-phone')?.value.trim();
        const address = document.getElementById('p-address')?.value.trim();
        const city = document.getElementById('p-city')?.value.trim();
        const metodo = document.querySelector('input[name="metodo"]:checked')?.value;
        const paymentMsg = document.getElementById('paymentMsg');

        if (!fullname || !email || !phone || !address || !city) {
          showMessage(paymentMsg, '❌ Completa todos los datos del cliente', 'error');
          animateButtonLoading(submitPaymentBtn, false);
          return;
        }

        if (metodo === 'tarjeta') {
          const card = document.getElementById('p-card')?.value.replace(/\s/g, '') || '';
          const cvv = document.getElementById('p-cvv')?.value.trim() || '';
          const cardholder = document.getElementById('p-cardholder')?.value.trim() || '';
          const expiry = document.getElementById('p-expiry')?.value.trim() || '';
          
          if (!cardholder || card.length < 13 || cvv.length < 3 || !expiry) {
            showMessage(paymentMsg, '❌ Completa todos los datos de la tarjeta', 'error');
            animateButtonLoading(submitPaymentBtn, false);
            return;
          }
          
          if (!validateCardNumber(card)) {
            showMessage(paymentMsg, '❌ Número de tarjeta inválido', 'error');
            animateButtonLoading(submitPaymentBtn, false);
            return;
          }
          
          showMessage(paymentMsg, '✓ Pago con tarjeta procesado. Gracias por tu compra.', 'success');
          createConfetti();
        } else if (metodo === 'transferencia') {
          showMessage(paymentMsg, '✓ Por favor realiza la transferencia. Te confirmaremos cuando la recibamos.', 'success');
        } else if (metodo === 'mercadopago') {
          window.location.href = 'https://www.mercadopago.com.ar';
          animateButtonLoading(submitPaymentBtn, false);
          return;
        }

        animateButtonLoading(submitPaymentBtn, false);
        cart.clear();
        setTimeout(() => {
          location.reload();
        }, 2000);
      }, 1000); // Simular procesamiento
    });
  }

  // Actualizar resumen de compra
  function updateOrderSummary() {
    const orderSummary = document.getElementById('orderSummary');
    const paymentTotal = document.getElementById('paymentTotal');
    
    if (!orderSummary) return;
    
    if (cart.items.length === 0) {
      orderSummary.innerHTML = '<div class="summary-empty">El carrito está vacío</div>';
      if (paymentTotal) paymentTotal.textContent = '$0';
      return;
    }

    orderSummary.innerHTML = cart.items.map(item => `
      <div class="summary-item">
        <span>${item.name}</span>
        <span>${item.quantity}x</span>
        <span>$${(item.price * item.quantity).toLocaleString('es-AR')}</span>
      </div>
    `).join('');

    const total = cart.getTotal();
    if (paymentTotal) paymentTotal.textContent = `$${total.toLocaleString('es-AR')}`;
  }

  // Actualizar al cargar la página
  updateOrderSummary();
});
