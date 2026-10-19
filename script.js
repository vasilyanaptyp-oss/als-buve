(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var L = document.documentElement.lang === 'ru' ? {
    menu: 'Меню', close: 'Закрыть', name: 'Пожалуйста, напишите своё имя.', contact: 'Укажите телефон или e-mail.',
    badContact: 'Проверьте номер телефона или адрес e-mail.', msg: 'Напишите короткое сообщение.', fill: 'Пожалуйста, заполните все поля.',
    subject: 'Вопрос с сайта', fName: 'Имя: ', fContact: 'Телефон или e-mail: ',
    opening: 'Открываем вашу почтовую программу. Если ничего не открылось, напишите на <a href="mailto:ad@alsbuve.lv">ad@alsbuve.lv</a>.',
    photos: 'фото'
  } : {
    menu: 'Izvēlne', close: 'Aizvērt', name: 'Lūdzu, ierakstiet savu vārdu.', contact: 'Lūdzu, norādiet tālruni vai e-pastu.',
    badContact: 'Pārbaudiet tālruņa numuru vai e-pasta adresi.', msg: 'Lūdzu, uzrakstiet īsu ziņu.', fill: 'Lūdzu, aizpildiet visus laukus.',
    subject: 'Jautājums no mājaslapas', fName: 'Vārds: ', fContact: 'Tālrunis vai e-pasts: ',
    opening: 'Atveram jūsu e-pasta programmu. Ja nekas neatveras, rakstiet uz <a href="mailto:ad@alsbuve.lv">ad@alsbuve.lv</a>.',
    photos: 'foto'
  };

  /* galva: ēna pēc ritināšanas */
  var top = $('#top');
  function stuck() { top.classList.toggle('is-stuck', window.scrollY > 8); }
  stuck(); window.addEventListener('scroll', stuck, { passive: true });

  /* mīksta ritināšana uz enkuriem */
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function headH() { return top.getBoundingClientRect().height + 8; }
  function glide(y) {
    if (reduce) { window.scrollTo(0, y); return; }
    var y0 = window.scrollY, d = y - y0, t0 = null, dur = Math.min(520, 220 + Math.abs(d) / 12);
    function step(t) {
      if (t0 === null) t0 = t;
      var k = Math.min(1, (t - t0) / dur), e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      window.scrollTo(0, y0 + d * e);
      if (k < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a || a.hasAttribute('data-lb')) return;
    var id = a.getAttribute('href').slice(1), el = id && document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    glide(Math.max(0, el.getBoundingClientRect().top + window.scrollY - headH() + 1));
    if (history.pushState) history.pushState(null, '', '#' + id);
  });

  /* mobilā izvēlne */
  var btn = $('.menu-btn'), nav = $('#mobile-nav'), lbl = $('.mb-label');
  function setMenu(open) {
    nav.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (lbl) lbl.textContent = open ? L.close : L.menu;
  }
  btn.addEventListener('click', function () { setMenu(btn.getAttribute('aria-expanded') !== 'true'); });
  $$('a', nav).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && nav.classList.contains('open')) { setMenu(false); btn.focus(); } });
  document.addEventListener('click', function (e) { if (nav.classList.contains('open') && !nav.contains(e.target) && !btn.contains(e.target)) setMenu(false); });
  window.addEventListener('resize', function () { if (window.innerWidth >= 900) setMenu(false); });

  /* apakšējā josla telefonā: parādās pēc lapas sākuma, pazūd pie kontaktiem */
  var dock = $('#dock'), heroEnd = $('#hero-write') || $('.phero'), contact = $('#kontakti') || $('.contact');
  if (dock && 'IntersectionObserver' in window) {
    var heroSeen = true, contactSeen = false;
    function upd() { dock.classList.toggle('show', !heroSeen && !contactSeen); }
    if (heroEnd) new IntersectionObserver(function (en) { heroSeen = en[0].isIntersecting; upd(); }).observe(heroEnd); else heroSeen = false;
    if (contact) new IntersectionObserver(function (en) { contactSeen = en[0].isIntersecting; upd(); }, { threshold: 0.15 }).observe(contact);
    upd();
  }

  /* atklāšanās ritinot */
  var rv = $$('.rv');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    rv.forEach(function (el) { io.observe(el); });
    setTimeout(function () { rv.forEach(function (el) { el.classList.add('in'); }); }, 4000);
  } else { rv.forEach(function (el) { el.classList.add('in'); }); }

  /* filtrs: sākumlapā atsevišķi foto, darbu lapā veseli projekti */
  var gal = $('#gallery'), chips = $$('.chip[data-filter]'), more = $('#more');
  var items = gal ? $$('[data-cat]', gal) : [];
  var filter = 'all', expanded = false, LIMIT = 12;
  var isProjects = gal && gal.hasAttribute('data-projects');
  var empty = $('#works-empty');
  function applyGallery() {
    var shown = 0, total = 0;
    items.forEach(function (t) {
      var match = filter === 'all' || t.dataset.cat === filter;
      if (!match) { t.hidden = true; return; }
      total++;
      var show = isProjects || expanded || shown < LIMIT;
      t.hidden = !show;
      if (show) shown++;
    });
    if (more) more.parentNode.hidden = (shown >= total);
    if (empty) empty.hidden = total > 0;
    chips.forEach(function (c) { c.setAttribute('aria-pressed', c.dataset.filter === filter ? 'true' : 'false'); });
  }
  if (gal) {
    chips.forEach(function (c) { c.addEventListener('click', function () { filter = c.dataset.filter; expanded = false; applyGallery(); }); });
    if (more) more.addEventListener('click', function () { expanded = true; applyGallery(); });
    $$('.card-link[data-filter]').forEach(function (a) {
      a.addEventListener('click', function () { filter = a.dataset.filter; expanded = false; applyGallery(); });
    });
    var h = (location.hash || '').slice(1);
    if (h && chips.some(function (c) { return c.dataset.filter === h; })) filter = h;
    applyGallery();
    if (h && filter === h && isProjects) { setTimeout(function () { glide(Math.max(0, gal.getBoundingClientRect().top + window.scrollY - headH() - 64)); }, 60); }
    window.addEventListener('hashchange', function () {
      var k = (location.hash || '').slice(1);
      if (k && chips.some(function (c) { return c.dataset.filter === k; })) { filter = k; expanded = false; applyGallery(); }
    });
  }
  /* projekta "rādīt visus foto": telefonā sākumā 3 foto, lielākā ekrānā 7 */
  if (isProjects) {
    var vis = window.innerWidth < 600 ? 3 : 7;
    $$('.proj', gal).forEach(function (p) {
      var ts = $$('.tile', p), m = $('.proj-more', p);
      ts.forEach(function (t, i) { t.hidden = i >= vis; });
      if (m) m.hidden = ts.length <= vis + (vis > 3 ? 1 : 0);
      if (m && m.hidden) ts.forEach(function (t) { t.hidden = false; });
    });
  }
  $$('[data-more]').forEach(function (b) {
    b.addEventListener('click', function () {
      var p = document.getElementById(b.dataset.more);
      if (!p) return;
      $$('.tile[hidden]', p).forEach(function (t) { t.hidden = false; });
      b.parentNode.hidden = true;
    });
  });

  /* lightbox */
  var lb = $('#lb'), lbImg = $('#lb-img'), lbCap = $('#lb-cap'), lbStage = $('#lb-stage');
  var list = [], idx = 0, lastFocus = null;
  function collect(group, from) {
    var all = from && from.closest('[data-lb-all]');
    return $$('[data-lb][data-group="' + group + '"]').filter(function (a) { return all || !a.hidden; });
  }
  function show(i) {
    if (!list.length) return;
    idx = (i + list.length) % list.length;
    var a = list[idx], im = a.querySelector('img');
    lbImg.src = a.getAttribute('href');
    lbImg.alt = im ? im.alt : '';
    lbCap.innerHTML = '';
    lbCap.appendChild(document.createTextNode(a.dataset.cap || ''));
    var c = document.createElement('span');
    c.textContent = (idx + 1) + ' / ' + list.length;
    lbCap.appendChild(c);
    [idx + 1, idx - 1].forEach(function (k) {
      var n = list[(k + list.length) % list.length];
      if (n) { var p = new Image(); p.src = n.getAttribute('href'); }
    });
  }
  function open(a) {
    list = collect(a.dataset.group, a);
    var i = list.indexOf(a);
    lastFocus = a;
    if (typeof lb.showModal === 'function') { if (!lb.open) lb.showModal(); } else { lb.setAttribute('open', ''); }
    document.documentElement.style.overflow = 'hidden';
    show(i < 0 ? 0 : i);
    $('#lb-x').focus({ preventScroll: true });
  }
  function close() {
    if (lb.open) { if (typeof lb.close === 'function') lb.close(); else lb.removeAttribute('open'); }
  }
  if (lb) {
    lb.addEventListener('close', function () {
      document.documentElement.style.overflow = '';
      lbImg.removeAttribute('src');
      if (lastFocus) lastFocus.focus({ preventScroll: true });
    });
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('[data-lb]');
      if (!a) return;
      e.preventDefault();
      open(a);
    });
    $('#lb-x').addEventListener('click', close);
    $('#lb-prev').addEventListener('click', function (e) { e.stopPropagation(); show(idx - 1); });
    $('#lb-next').addEventListener('click', function (e) { e.stopPropagation(); show(idx + 1); });
    lbStage.addEventListener('click', function (e) {
      if (e.target === lbImg || e.target.closest('.lb-cap')) return;
      close();
    });
    lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
    lb.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); show(idx + 1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); show(idx - 1); }
    });
    var sx = null, sy = 0;
    lbImg.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
    lbImg.addEventListener('touchend', function (e) {
      if (sx === null) return;
      var dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
      sx = null;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.3) show(dx < 0 ? idx + 1 : idx - 1);
    });
  }

  /* e-pasta forma (mailto) */
  var form = $('#form'), msg = $('#form-msg');
  if (form) {
    var rules = {
      name: function (v) { return v.trim().length < 2 ? L.name : ''; },
      contact: function (v) {
        v = v.trim();
        if (!v) return L.contact;
        var mail = /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(v), tel = /^\+?[\d\s()-]{7,}$/.test(v);
        return (mail || tel) ? '' : L.badContact;
      },
      msg: function (v) { return v.trim().length < 5 ? L.msg : ''; }
    };
    function check(name) {
      var el = form.elements[name], err = $('#e-' + name), m = rules[name](el.value);
      err.textContent = m;
      if (m) el.setAttribute('aria-invalid', 'true'); else el.removeAttribute('aria-invalid');
      el.setAttribute('aria-describedby', 'e-' + name);
      return !m;
    }
    Object.keys(rules).forEach(function (n) {
      form.elements[n].addEventListener('input', function () { if (form.elements[n].getAttribute('aria-invalid')) check(n); });
      form.elements[n].addEventListener('blur', function () { if (form.elements[n].value) check(n); });
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = Object.keys(rules).map(check).every(Boolean);
      msg.className = 'form-msg';
      if (!ok) {
        msg.textContent = L.fill;
        msg.classList.add('bad');
        var first = form.querySelector('[aria-invalid="true"]');
        if (first) first.focus();
        return;
      }
      var f = form.elements;
      var body = L.fName + f.name.value.trim() + '\n' + L.fContact + f.contact.value.trim() + '\n\n' + f.msg.value.trim();
      var href = 'mailto:ad@alsbuve.lv?subject=' + encodeURIComponent(L.subject) + '&body=' + encodeURIComponent(body);
      msg.classList.add('ok');
      msg.innerHTML = L.opening;
      var go = document.createElement('a');
      go.href = href; go.style.display = 'none';
      document.body.appendChild(go); go.click(); document.body.removeChild(go);
    });
  }
})();
