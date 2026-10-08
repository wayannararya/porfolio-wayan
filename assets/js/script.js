'use strict';



// element toggle function
const elementToggleFunc = function (elem) { elem.classList.toggle("active"); }



// sidebar variables
const sidebar = document.querySelector("[data-sidebar]");
const sidebarBtn = document.querySelector("[data-sidebar-btn]");

// sidebar toggle functionality for mobile
sidebarBtn.addEventListener("click", function () { elementToggleFunc(sidebar); });



// contact form variables
const form = document.querySelector("[data-form]");
const formInputs = document.querySelectorAll("[data-form-input]");
const formBtn = document.querySelector("[data-form-btn]");

// add event to all form input field
for (let i = 0; i < formInputs.length; i++) {
  formInputs[i].addEventListener("input", function () {

    // check form validation
    if (form.checkValidity()) {
      formBtn.removeAttribute("disabled");
    } else {
      formBtn.setAttribute("disabled", "");
    }

  });
}



// page navigation variables
const navigationLinks = document.querySelectorAll("[data-nav-link]");
const pages = document.querySelectorAll("[data-page]");

// add event to all nav link
for (let i = 0; i < navigationLinks.length; i++) {
  navigationLinks[i].addEventListener("click", function () {

    for (let i = 0; i < pages.length; i++) {
      if (this.innerHTML.toLowerCase() === pages[i].dataset.page) {
        pages[i].classList.add("active");
        navigationLinks[i].classList.add("active");
        window.scrollTo(0, 0);
      } else {
        pages[i].classList.remove("active");
        navigationLinks[i].classList.remove("active");
      }
    }

  });
}

/* ===== Gallery lightbox + zoom ===== */
(function () {
  const lb = document.querySelector('[data-lightbox]');
  if (!lb) return;

  const imgEl         = lb.querySelector('[data-lb-img]');
  const titleEl       = lb.querySelector('[data-lb-title]');
  const counterEl     = lb.querySelector('[data-lb-counter]');
  const dotsEl        = lb.querySelector('[data-lb-dots]');
  const prevBtn       = lb.querySelector('[data-lb-prev]');
  const nextBtn       = lb.querySelector('[data-lb-next]');
  const zoomInBtn     = lb.querySelector('[data-lb-zoom-in]');
  const zoomOutBtn    = lb.querySelector('[data-lb-zoom-out]');
  const zoomResetBtn  = lb.querySelector('[data-lb-zoom-reset]');
  const zoomLevelEl   = lb.querySelector('[data-lb-zoom-level]');

  const MIN_SCALE = 1;
  const MAX_SCALE = 5;
  const BUTTON_STEP = 1.4;

  let images = [];
  let index = 0;
  let title = '';

  let scale = 1;
  let tx = 0;
  let ty = 0;

  function clamp(v, min, max) { return Math.min(max, Math.max(min, v)); }

  /* ---------- zoom ---------- */

  function applyTransform(animate) {
    const maxX = Math.max(0, (imgEl.offsetWidth  * scale - imgEl.offsetWidth)  / 2);
    const maxY = Math.max(0, (imgEl.offsetHeight * scale - imgEl.offsetHeight) / 2);
    tx = clamp(tx, -maxX, maxX);
    ty = clamp(ty, -maxY, maxY);

    imgEl.style.transition = animate ? 'transform .18s ease' : 'none';
    imgEl.style.transform = 'translate(' + tx + 'px,' + ty + 'px) scale(' + scale + ')';
    imgEl.classList.toggle('is-zoomed', scale > 1.01);

    zoomLevelEl.textContent = Math.round(scale * 100) + '%';
    zoomInBtn.disabled = scale >= MAX_SCALE - 0.01;
    zoomOutBtn.disabled = scale <= MIN_SCALE + 0.01;
    zoomResetBtn.disabled = scale <= MIN_SCALE + 0.01;
  }

  function zoomAt(newScale, px, py, animate) {
    newScale = clamp(newScale, MIN_SCALE, MAX_SCALE);

    const lbRect = lb.getBoundingClientRect();
    const baseCx = lbRect.left + imgEl.offsetLeft + imgEl.offsetWidth / 2;
    const baseCy = lbRect.top  + imgEl.offsetTop  + imgEl.offsetHeight / 2;
    if (px === undefined) { px = baseCx; py = baseCy; }

    const dx = px - baseCx;
    const dy = py - baseCy;
    const ux = (dx - tx) / scale;
    const uy = (dy - ty) / scale;

    tx = dx - ux * newScale;
    ty = dy - uy * newScale;
    scale = newScale;

    if (scale <= MIN_SCALE) { tx = 0; ty = 0; }
    applyTransform(animate);
  }

  function resetZoom(animate) {
    scale = 1; tx = 0; ty = 0;
    applyTransform(animate);
  }

  function toggleZoom(px, py) {
    if (scale > 1.01) resetZoom(true);
    else zoomAt(2.5, px, py, true);
  }

  /* ---------- tampilkan gambar ---------- */

  function show(i) {
    index = (i + images.length) % images.length;
    resetZoom(false);
    imgEl.src = images[index];
    imgEl.alt = title + ' - image ' + (index + 1);
    counterEl.textContent = (index + 1) + ' / ' + images.length;

    dotsEl.querySelectorAll('.lightbox-dot').forEach(function (dot, n) {
      dot.classList.toggle('active', n === index);
    });

    if (images.length > 1) new Image().src = images[(index + 1) % images.length];
  }

  function open(list, cardTitle, startAt) {
    images = list;
    title = cardTitle;
    titleEl.textContent = cardTitle;

    const single = images.length < 2;
    prevBtn.hidden = single;
    nextBtn.hidden = single;
    dotsEl.hidden = single;

    dotsEl.innerHTML = '';
    images.forEach(function (_, n) {
      const dot = document.createElement('button');
      dot.className = 'lightbox-dot';
      dot.setAttribute('aria-label', 'Go to image ' + (n + 1));
      dot.addEventListener('click', function () { show(n); });
      dotsEl.appendChild(dot);
    });

    lb.hidden = false;
    document.body.style.overflow = 'hidden';
    show(startAt || 0);
  }

  function close() {
    lb.hidden = true;
    imgEl.src = '';
    resetZoom(false);
    document.body.style.overflow = '';
  }

  /* ---------- pasang ke thumbnail ---------- */

  document.querySelectorAll('.project-thumb[data-gallery]').forEach(function (thumb) {
    let list;
    try { list = JSON.parse(thumb.dataset.gallery); } catch (e) { return; }
    if (!Array.isArray(list) || list.length === 0) return;

    const badge = thumb.querySelector('.project-count');
    if (badge) badge.textContent = list.length + (list.length === 1 ? ' image' : ' images');

    const cardTitle = thumb.closest('.project-card').querySelector('.project-card-title').textContent;

    thumb.setAttribute('tabindex', '0');
    thumb.setAttribute('role', 'button');
    thumb.addEventListener('click', function () { open(list, cardTitle, 0); });
    thumb.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') open(list, cardTitle, 0);
    });
  });

  /* ---------- tombol ---------- */

  lb.querySelector('[data-lb-close]').addEventListener('click', close);
  prevBtn.addEventListener('click', function () { show(index - 1); });
  nextBtn.addEventListener('click', function () { show(index + 1); });

  zoomInBtn.addEventListener('click', function () { zoomAt(scale * BUTTON_STEP, undefined, undefined, true); });
  zoomOutBtn.addEventListener('click', function () { zoomAt(scale / BUTTON_STEP, undefined, undefined, true); });
  zoomResetBtn.addEventListener('click', function () { resetZoom(true); });

  /* ---------- keyboard ---------- */

  document.addEventListener('keydown', function (e) {
    if (lb.hidden) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft' && images.length > 1) show(index - 1);
    if (e.key === 'ArrowRight' && images.length > 1) show(index + 1);
    if (e.key === '+' || e.key === '=') zoomAt(scale * BUTTON_STEP, undefined, undefined, true);
    if (e.key === '-' || e.key === '_') zoomAt(scale / BUTTON_STEP, undefined, undefined, true);
    if (e.key === '0') resetZoom(true);
  });

  /* ---------- scroll mouse / pinch trackpad ---------- */

  lb.addEventListener('wheel', function (e) {
    e.preventDefault();
    const delta = clamp(e.deltaY, -100, 100);
    zoomAt(scale * Math.exp(-delta * 0.0015), e.clientX, e.clientY, false);
  }, { passive: false });

  /* ---------- geser, cubit, ketuk dua kali ---------- */

  const pointers = new Map();
  let startX = 0, startY = 0, lastX = 0, lastY = 0;
  let moved = false, multi = false, suppressClick = false;
  let pinchDist = 0, pinchScale = 1;
  let lastTap = 0;

  lb.addEventListener('pointerdown', function (e) {
    if (e.target.closest('button')) return;

    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.size === 1) {
      startX = lastX = e.clientX;
      startY = lastY = e.clientY;
      moved = false;
      multi = false;
      suppressClick = false;
    } else if (pointers.size === 2) {
      multi = true;
      const p = Array.from(pointers.values());
      pinchDist = Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y);
      pinchScale = scale;
    }

    if (scale > 1.01) imgEl.classList.add('is-dragging');
  });

  lb.addEventListener('pointermove', function (e) {
    if (!pointers.has(e.pointerId)) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.size === 2) {
      const p = Array.from(pointers.values());
      const dist = Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y);
      if (pinchDist > 0) {
        zoomAt(pinchScale * dist / pinchDist, (p[0].x + p[1].x) / 2, (p[0].y + p[1].y) / 2, false);
      }
      moved = true;
      return;
    }

    if (pointers.size === 1) {
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;

      if (Math.abs(e.clientX - startX) > 6 || Math.abs(e.clientY - startY) > 6) moved = true;

      if (scale > 1.01) {
        tx += dx;
        ty += dy;
        applyTransform(false);
      }
    }
  });

  function endPointer(e) {
    if (!pointers.has(e.pointerId)) return;
    pointers.delete(e.pointerId);
    imgEl.classList.remove('is-dragging');

    if (pointers.size > 0) {
      const p = Array.from(pointers.values())[0];
      lastX = p.x;
      lastY = p.y;
      return;
    }

    if (moved) suppressClick = true;
    if (e.type === 'pointercancel') return;

    if (multi) {
      if (scale <= 1.01) resetZoom(true);
      return;
    }

    if (!moved) {
      const now = Date.now();
      if (e.target === imgEl && now - lastTap < 300) {
        toggleZoom(e.clientX, e.clientY);
        lastTap = 0;
      } else {
        lastTap = now;
      }
      return;
    }

    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    if (scale <= 1.01 && images.length > 1 && Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      show(dx < 0 ? index + 1 : index - 1);
    }
  }

  lb.addEventListener('pointerup', endPointer);
  lb.addEventListener('pointercancel', endPointer);

  // klik area gelap untuk menutup (diabaikan setelah menggeser)
  lb.addEventListener('click', function (e) {
    if (suppressClick) { suppressClick = false; return; }
    if (e.target === lb) close();
  });

  window.addEventListener('resize', function () {
    if (!lb.hidden) applyTransform(false);
  });

  imgEl.addEventListener('dragstart', function (e) { e.preventDefault(); });
})();

// Simpan section aktif di URL (#about, #resume, #portfolio, #contact)
navigationLinks.forEach(function (link) {
  link.addEventListener("click", function () {
    history.replaceState(null, "", "#" + link.innerHTML.trim().toLowerCase());
  });
});

// Saat halaman dimuat, buka section sesuai URL
const savedPage = location.hash.slice(1);
if (savedPage) {
  const targetLink = Array.from(navigationLinks).find(function (link) {
    return link.innerHTML.trim().toLowerCase() === savedPage;
  });
  if (targetLink) targetLink.click();
}  


function showToast(title, text) {
  // hapus notifikasi lama kalau masih ada
  const old = document.querySelector(".toast");
  if (old) old.remove();

  const toast = document.createElement("div");
  toast.className = "toast";
  toast.setAttribute("role", "status");
  toast.innerHTML =
    '<div class="toast-icon"><ion-icon name="checkmark-outline"></ion-icon></div>' +
    '<div class="toast-body">' +
      '<p class="toast-title">' + title + '</p>' +
      '<p class="toast-text">' + text + '</p>' +
    '</div>' +
    '<button class="toast-close" aria-label="Tutup"><ion-icon name="close-outline"></ion-icon></button>' +
    '<span class="toast-bar"></span>';

  document.body.appendChild(toast);
  requestAnimationFrame(function () { toast.classList.add("show"); });

  function closeToast() {
    toast.classList.remove("show");
    setTimeout(function () { toast.remove(); }, 400);
  }

  toast.querySelector(".toast-close").addEventListener("click", closeToast);
  setTimeout(closeToast, 4500);
}

(function () {
  function showToast(title, text) {
    var old = document.querySelector(".toast");
    if (old) old.remove();

    var toast = document.createElement("div");
    toast.className = "toast";
    toast.innerHTML =
      '<div class="toast-icon"><ion-icon name="checkmark-outline"></ion-icon></div>' +
      '<div class="toast-body">' +
        '<p class="toast-title">' + title + '</p>' +
        '<p class="toast-text">' + text + '</p>' +
      '</div>' +
      '<button type="button" class="toast-close" aria-label="Tutup"><ion-icon name="close-outline"></ion-icon></button>' +
      '<span class="toast-bar"></span>';

    document.body.appendChild(toast);
    requestAnimationFrame(function () { toast.classList.add("show"); });

    function closeToast() {
      toast.classList.remove("show");
      setTimeout(function () { toast.remove(); }, 400);
    }
    toast.querySelector(".toast-close").addEventListener("click", closeToast);
    setTimeout(closeToast, 4500);
  }

  document.addEventListener("click", function (e) {
    var btn = e.target.closest("button");
    if (!btn || btn.classList.contains("toast-close")) return;
    if (!btn.textContent.trim().toLowerCase().includes("send message")) return;

    e.preventDefault();
    if (btn.disabled) return;

    var form = btn.closest("form");
    if (form) form.reset();
    btn.setAttribute("disabled", "");

    showToast("Pesan Terkirim!", "Terima kasih, pesan Anda sudah diterima.");
  });
})();

document.addEventListener("submit", function (e) {
  e.preventDefault(); // cegah reload, tetap di Contact
});

