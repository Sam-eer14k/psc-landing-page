    (function () {
      'use strict';

      var doc = document, root = doc.documentElement;
      var RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      var FINE = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
      var $ = function (s, c) { return (c || doc).querySelector(s); };
      var $$ = function (s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); };
      var clamp = function (v, a, b) { return Math.min(Math.max(v, a), b); };
      var easeOut = function (k) { return 1 - Math.pow(1 - k, 3); };

      /* [CONFIRM] Savings calculator assumptions. Edit these numbers once PSC confirms them. */
      var calcConfig = {
        phonesPerTrunk: 3,      /* [CONFIRM: 1 SIP trunk per 3 phones] */
        minTrunks: 2,           /* [CONFIRM: minimum trunks] */
        trunkMonthly: 85 / 6    /* [CONFIRM: ~$14.17 per trunk per month, from Pacific Sailing's $85 for 6 trunks] */
      };

      /* Tween a number inside an element. */
      function tween(el, to, render, dur) {
        var from = parseFloat(el.dataset.v || '0');
        el.dataset.v = to;
        if (RM || from === to) { el.innerHTML = render(to); return; }
        var t0 = null; dur = dur || 600;
        cancelAnimationFrame(el._raf);
        function step(t) {
          if (!t0) t0 = t;
          var k = Math.min((t - t0) / dur, 1);
          el.innerHTML = render(from + (to - from) * easeOut(k));
          if (k < 1) el._raf = requestAnimationFrame(step);
        }
        el._raf = requestAnimationFrame(step);
      }
      function money(n, dec) { return '$' + n.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec }); }

      /* ==========================================================
         HEADER, PROGRESS, BACK TO TOP, HERO PARALLAX, TIMELINE
         ========================================================== */
      var header = $('#site-header'), bar = $('.progress-bar'), toTop = $('#to-top'), hero = $('#top');
      var heroMedia = $('.hero-media');
      var ring = $('.to-top .fill'), RING = 2 * Math.PI * 25;
      ring.style.strokeDasharray = RING; ring.style.strokeDashoffset = RING;
      var timeline = $('#timeline'), tlFill = timeline ? $('.tl-fill', timeline) : null, tlSteps = timeline ? $$('.tl-step', timeline) : [];
      var lastY = window.scrollY, ticking = false;

      function updateTimeline() {
        if (!timeline) return;
        var r = timeline.getBoundingClientRect();
        var p = clamp((window.innerHeight * 0.62 - r.top) / r.height, 0, 1);
        tlFill.style.setProperty('--p', p);
        var reach = p * r.height + 20;
        tlSteps.forEach(function (s) { s.classList.toggle('is-active', s.offsetTop <= reach); });
      }

      function onScroll() {
        var y = window.scrollY;
        var max = root.scrollHeight - window.innerHeight;
        var p = max > 0 ? Math.min(y / max, 1) : 0;
        header.classList.toggle('is-scrolled', y > 40);
        if (!doc.body.classList.contains('is-locked') && !header.contains(doc.activeElement)) {
          if (y > lastY + 6 && y > 320) header.classList.add('is-hidden');
          else if (y < lastY - 6 || y < 320) header.classList.remove('is-hidden');
        }
        lastY = y;
        bar.style.transform = 'scaleX(' + p + ')';
        toTop.classList.toggle('is-visible', y > hero.offsetHeight * 0.8);
        ring.style.strokeDashoffset = RING * (1 - p);
        if (!RM && y < window.innerHeight * 1.3) heroMedia.style.setProperty('--py', (y * 0.28).toFixed(1) + 'px');
        updateTimeline();
        ticking = false;
      }
      window.addEventListener('scroll', function () { if (!ticking) { requestAnimationFrame(onScroll); ticking = true; } }, { passive: true });
      window.addEventListener('resize', updateTimeline);
      header.addEventListener('focusin', function () { header.classList.remove('is-hidden'); });
      onScroll();
      toTop.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: RM ? 'auto' : 'smooth' });
        $('#hero-title').setAttribute('tabindex', '-1');
        setTimeout(function () { $('#hero-title').focus({ preventScroll: true }); }, RM ? 0 : 700);
      });

      /* ==========================================================
         PANELS: quick contact + full-screen menu
         ========================================================== */
      var overlay = $('.overlay'), lastTrigger = null, openEl = null;
      function openPanel(id, trigger) {
        var el = doc.getElementById(id);
        closeAll(true);
        lastTrigger = trigger; openEl = el;
        el.classList.add('is-open'); el.setAttribute('aria-hidden', 'false');
        if (id === 'quick') overlay.classList.add('is-open');
        doc.body.classList.add('is-locked');
        header.classList.remove('is-hidden');
        $$('[data-open="' + id + '"]').forEach(function (b) { b.setAttribute('aria-expanded', 'true'); });
        setTimeout(function () { var f = el.querySelector('button, a'); if (f) f.focus(); }, 90);
      }
      function closeAll(silent) {
        $$('.quick.is-open, .menu-screen.is-open').forEach(function (p) { p.classList.remove('is-open'); p.setAttribute('aria-hidden', 'true'); });
        overlay.classList.remove('is-open');
        doc.body.classList.remove('is-locked');
        $$('[data-open]').forEach(function (b) { b.setAttribute('aria-expanded', 'false'); });
        if (!silent && lastTrigger) lastTrigger.focus();
        lastTrigger = null; openEl = null;
      }
      $$('[data-open]').forEach(function (b) { b.addEventListener('click', function () { openPanel(b.getAttribute('data-open'), b); }); });
      $$('[data-close]').forEach(function (b) { b.addEventListener('click', function () { closeAll(); }); });
      $$('.quick a[href^="#"], .menu-screen a[href^="#"]').forEach(function (a) { a.addEventListener('click', function () { closeAll(true); }); });
      doc.addEventListener('keydown', function (e) {
        if (!openEl) return;
        if (e.key === 'Escape') { closeAll(); return; }
        if (e.key !== 'Tab') return;
        var f = $$('a[href], button:not([disabled])', openEl);
        if (!f.length) return;
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && doc.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && doc.activeElement === last) { e.preventDefault(); first.focus(); }
      });

      /* ==========================================================
         HERO: video control, bill tilt + countdown, ticker
         ========================================================== */
      var video = $('#hero-video'), vt = $('#hero-video-toggle');
      function setVideo(paused) { vt.classList.toggle('is-paused', paused); vt.setAttribute('aria-label', paused ? 'Play background video' : 'Pause background video'); }
      if (video) {
        video.muted = true;
        if (RM) { video.removeAttribute('autoplay'); video.pause(); setVideo(true); }
        else { var pp = video.play(); if (pp && pp.catch) pp.catch(function () { setVideo(true); }); }
        vt.addEventListener('click', function () { if (video.paused) { video.play(); setVideo(false); } else { video.pause(); setVideo(true); } });
      }

      var bill = $('#bill'), amount = $('#bill-amount'), billLabel = $('#bill-label');
      function finishBill() {
        bill.classList.add('is-struck-1', 'is-struck-2', 'is-done');
        amount.textContent = '$85.00';
        billLabel.textContent = 'After: 3CX + 6 SIP trunks';
      }
      if (RM) finishBill();
      else {
        setTimeout(function () { bill.classList.add('is-struck-1'); }, 1100);
        setTimeout(function () { bill.classList.add('is-struck-2'); }, 1650);
        setTimeout(function () {
          billLabel.textContent = 'After: 3CX + 6 SIP trunks';
          var t0 = null;
          (function step(t) {
            if (!t0) t0 = t;
            var k = clamp((t - t0) / 1700, 0, 1);
            amount.textContent = money(360 - 275 * easeOut(k), 2);
            if (k < 1) requestAnimationFrame(step); else bill.classList.add('is-done');
          })(performance.now());
          requestAnimationFrame(function s(t) { });
        }, 2300);
      }
      if (FINE && !RM) {
        var hv = $('.hero-visual');
        hv.addEventListener('pointermove', function (e) {
          var r = bill.getBoundingClientRect();
          var x = (e.clientX - (r.left + r.width / 2)) / r.width;
          var y = (e.clientY - (r.top + r.height / 2)) / r.height;
          bill.classList.add('is-tracking');
          bill.style.setProperty('--ry', clamp(x * 18, -16, 16).toFixed(2) + 'deg');
          bill.style.setProperty('--rx', clamp(-y * 14, -12, 12).toFixed(2) + 'deg');
          bill.style.setProperty('--gx', (50 + x * 100).toFixed(0) + '%');
          bill.style.setProperty('--gy', (50 + y * 100).toFixed(0) + '%');
        });
        hv.addEventListener('pointerleave', function () {
          bill.classList.remove('is-tracking');
          ['--rx', '--ry', '--gx', '--gy'].forEach(function (p) { bill.style.removeProperty(p); });
        });
      }

      var tickItems = $$('#ticker .ticker-item'), tickTime = $('#ticker-time'), tickIdx = 0, secs = 0, heroVisible = true;
      if ('IntersectionObserver' in window) new IntersectionObserver(function (en) { heroVisible = en[0].isIntersecting; }).observe(hero);
      setInterval(function () {
        if (!heroVisible || doc.hidden) return;
        secs++;
        tickTime.textContent = '00:' + String(secs).padStart(2, '0');
        if (secs % 4 === 0) {
          var cur = tickItems[tickIdx];
          tickIdx = (tickIdx + 1) % tickItems.length;
          var nxt = tickItems[tickIdx];
          cur.classList.remove('is-on'); cur.classList.add('is-off');
          nxt.classList.remove('is-off'); nxt.classList.add('is-on');
          setTimeout(function () { cur.classList.remove('is-off'); }, 600);
          secs = 0;
        }
      }, 1000);

      /* ==========================================================
         REVEALS, COUNTERS, ODOMETER, ACTIVE NAV
         ========================================================== */
      function countUp(el) {
        if (el.dataset.done) return;
        el.dataset.done = '1';
        var end = parseFloat(el.getAttribute('data-count'));
        if (RM || end === 0) { el.textContent = end; return; }
        var t0 = null;
        (function step(t) {
          if (!t0) t0 = t;
          var k = clamp((t - t0) / 1500, 0, 1);
          el.textContent = Math.round(end * easeOut(k));
          if (k < 1) requestAnimationFrame(step);
        })(performance.now());
      }
      function spinOdo() { $$('.odo-col').forEach(function (c) { $('span', c).style.transform = 'translateY(-' + c.getAttribute('data-digit') + 'em)'; }); }

      if ('IntersectionObserver' in window && !RM) {
        /* clip/wipe reveals start with zero visible area, which the observer reports as hidden, so watch their parent instead */
        var rio = new IntersectionObserver(function (entries) {
          entries.forEach(function (en) { if (en.isIntersecting) { en.target._rv.forEach(function (x) { x.classList.add('is-in'); $$('[data-count]', x).forEach(countUp); }); rio.unobserve(en.target); } });
        }, { threshold: 0.14, rootMargin: '0px 0px -6% 0px' });
        $$('[data-reveal]').forEach(function (el) {
          var t = /^(clip|wipe)$/.test(el.getAttribute('data-reveal')) ? el.parentElement : el;
          (t._rv = t._rv || []).push(el);
          rio.observe(t);
        });

        $$('[data-count]').forEach(function (el) { el.textContent = '0'; });
        var cio = new IntersectionObserver(function (entries) {
          entries.forEach(function (en) { if (en.isIntersecting) { countUp(en.target); cio.unobserve(en.target); } });
        }, { threshold: 0.6 });
        $$('[data-count]').forEach(function (el) { cio.observe(el); });

        var oio = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { spinOdo(); oio.disconnect(); } }, { threshold: 0.5 });
        oio.observe($('.odo'));
      } else {
        $$('[data-reveal]').forEach(function (el) { el.classList.add('is-in'); });
        spinOdo();
      }

      var navLinks = $$('.main-nav a');
      if ('IntersectionObserver' in window) {
        var nio = new IntersectionObserver(function (entries) {
          entries.forEach(function (en) {
            if (!en.isIntersecting) return;
            navLinks.forEach(function (a) {
              var on = a.getAttribute('href') === '#' + en.target.id;
              a.classList.toggle('is-active', on);
              if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
            });
          });
        }, { rootMargin: '-45% 0px -50% 0px' });
        navLinks.forEach(function (a) { var s = $(a.getAttribute('href')); if (s) nio.observe(s); });
      }

      /* ==========================================================
         ABOUT: system diagram
         ========================================================== */
      var sysInfo = $('#sys-info'), sysNodes = $$('.sys-node'), wires = $$('.sys .wire');
      function pickNode(n) {
        if (n.classList.contains('is-on')) return;
        sysNodes.forEach(function (x) { x.classList.toggle('is-on', x === n); if (x._chip) x._chip.setAttribute('aria-pressed', x === n ? 'true' : 'false'); });
        var w = n.getAttribute('data-w');
        wires.forEach(function (x) { x.classList.toggle('on', x.getAttribute('data-w') === w); });
        sysInfo.innerHTML = '<strong>' + n.getAttribute('data-title') + '</strong><p>' + n.getAttribute('data-text') + '</p>';
        sysInfo.classList.remove('swap'); void sysInfo.offsetWidth; sysInfo.classList.add('swap');
      }
      var chipBox = $('#sys-chips');
      sysNodes.forEach(function (n) {
        var c = doc.createElement('button');
        c.type = 'button'; c.textContent = n.getAttribute('aria-label');
        c.setAttribute('aria-pressed', n.classList.contains('is-on') ? 'true' : 'false');
        c.addEventListener('click', function () { pickNode(n); });
        n._chip = c; chipBox.appendChild(c);
      });
      sysNodes.forEach(function (n) {
        n.addEventListener('mouseenter', function () { pickNode(n); });
        n.addEventListener('focus', function () { pickNode(n); });
        n.addEventListener('click', function () { pickNode(n); });
        n.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pickNode(n); } });
      });
      if (RM) $$('svg').forEach(function (s) { if (s.pauseAnimations) s.pauseAnimations(); });

      /* ==========================================================
         TABS (services + case studies)
         ========================================================== */
      $$('[data-tabs]').forEach(function (box) {
        var tabs = $$('[role="tab"]', box).filter(function (t) { return t.closest('[data-tabs]') === box; });
        function activate(i, focus) {
          tabs.forEach(function (t, j) {
            var on = j === i, panel = doc.getElementById(t.getAttribute('aria-controls'));
            t.setAttribute('aria-selected', on ? 'true' : 'false');
            t.tabIndex = on ? 0 : -1;
            panel.hidden = !on;
            if (on) { panel.classList.remove('is-in'); void panel.offsetWidth; panel.classList.add('is-in'); }
          });
          if (focus) tabs[i].focus();
        }
        tabs.forEach(function (t, i) {
          t.addEventListener('click', function () { activate(i); });
          t.addEventListener('keydown', function (e) {
            var k = e.key, n = null;
            if (k === 'ArrowRight' || k === 'ArrowDown') n = (i + 1) % tabs.length;
            else if (k === 'ArrowLeft' || k === 'ArrowUp') n = (i - 1 + tabs.length) % tabs.length;
            else if (k === 'Home') n = 0; else if (k === 'End') n = tabs.length - 1;
            if (n !== null) { e.preventDefault(); activate(n, true); }
          });
        });
      });

      /* ==========================================================
         SAVINGS CALCULATOR
         ========================================================== */
      var cPhones = $('#c-phones'), cBill = $('#c-bill'), cOff = $('#c-offices');
      var rNew = $('#r-new'), rSave = $('#r-save'), calcOut = $('#calc-out');
      function fill(r) { r.style.setProperty('--fill', ((r.value - r.min) / (r.max - r.min) * 100) + '%'); }
      function calc() {
        var phones = +cPhones.value, billV = +cBill.value, offices = +cOff.value;
        [cPhones, cBill, cOff].forEach(fill);
        $('#o-phones').textContent = phones;
        $('#o-bill').textContent = money(billV, 0);
        $('#o-offices').textContent = offices;
        var trunks = Math.max(calcConfig.minTrunks, Math.ceil(phones / calcConfig.phonesPerTrunk));
        var monthly = Math.round(trunks * calcConfig.trunkMonthly);
        var yearly = Math.max(0, (billV - monthly) * 12);
        $('#r-trunks').textContent = trunks;
        $('#r-off').textContent = offices;
        tween(rNew, monthly, function (v) { return money(Math.round(v), 0) + '<small> / mo</small>'; }, 500);
        tween(rSave, yearly, function (v) { return money(Math.round(v), 0); }, 500);
        calcOut.classList.toggle('is-low', billV - monthly <= 0);
      }
      [cPhones, cBill, cOff].forEach(function (r) { r.addEventListener('input', calc); });
      rNew.dataset.v = 0; rSave.dataset.v = 0;
      calc();

      /* ==========================================================
         PHONES: selector, SVG drawings, provisioning checklist
         ========================================================== */
      var models = [
        { lines: '4 lines', keys: '7 programmable BLF keys, 3 soft keys', power: 'PoE, dual network ports', best: 'Everyday office desks', chips: ['4 lines', 'PoE', 'Everyday desks'], art: { sw: 70, sh: 40, right: 4, left: 0, side: false, soft: 3 } },
        { lines: '4 lines', keys: 'Port for up to 2 expansion modules', power: 'Built-in network switch', best: 'Small offices', chips: ['4 lines', '3" backlit LCD', 'Small offices'], art: { sw: 92, sh: 46, right: 4, left: 0, side: false, soft: 4 } },
        { lines: '6 lines', keys: '7 BLF keys, plus 112 more with add-on modules', power: 'PoE, dual network ports', best: 'Receptionists and call centers', chips: ['6 lines', '+112 keys', 'Reception'], art: { sw: 96, sh: 52, right: 6, left: 0, side: true, soft: 4 } },
        { lines: '[CONFIRM: line count]', keys: 'Programmable keys with LEDs [CONFIRM: key count]', power: 'PoE (802.3af)', best: 'Front desks and hotels, as at The Padre', chips: ['HAC handset', 'PoE', 'Front desks'], art: { sw: 64, sh: 58, right: 5, left: 5, side: false, soft: 0 } }
      ];
      function phoneSVG(a) {
        var W = a.side ? 320 : 260, s = [];
        var cx = a.left ? 162 : 158, sx = cx - a.sw / 2, sy = 64;
        s.push('<svg class="phone-svg swap" viewBox="0 0 ' + W + ' 232" aria-hidden="true"><defs><linearGradient id="scr" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#C9F3F4"/><stop offset="1" stop-color="#08BDC3"/></linearGradient></defs>');
        s.push('<ellipse cx="' + (W / 2) + '" cy="218" rx="' + (W / 2 - 14) + '" ry="9" fill="#061826" opacity=".14"/>');
        if (a.side) {
          s.push('<rect x="250" y="54" width="58" height="152" rx="8" fill="#fff" stroke="#9DBBC2" stroke-width="2"/>');
          for (var r = 0; r < 7; r++) for (var c = 0; c < 2; c++) {
            s.push('<rect x="' + (262 + c * 24) + '" y="' + (66 + r * 19) + '" width="16" height="9" rx="2" fill="#DCEEF0"/><circle cx="' + (259 + c * 24) + '" cy="' + (70.5 + r * 19) + '" r="1.8" fill="' + ((r + c) % 3 ? '#08BDC3' : '#F4B23E') + '"/>');
          }
        }
        s.push('<path d="M18 76q0-16 16-17l190-12q16-1 16 15v136q0 16-16 16H34q-16 0-16-16Z" fill="#fff" stroke="#9DBBC2" stroke-width="2"/>');
        s.push('<path d="M19 168h220v30q0 15-15 15H34q-15 0-15-15Z" fill="#EAF5F6"/>');
        s.push('<rect x="30" y="64" width="46" height="140" rx="22" fill="#EEF7F8" stroke="#9DBBC2" stroke-width="2"/><rect x="41" y="78" width="24" height="10" rx="5" fill="#C9E0E4"/><rect x="41" y="180" width="24" height="10" rx="5" fill="#C9E0E4"/>');
        s.push('<rect x="' + sx + '" y="' + sy + '" width="' + a.sw + '" height="' + a.sh + '" rx="4" fill="url(#scr)"/>');
        s.push('<rect x="' + (sx + 7) + '" y="' + (sy + 8) + '" width="' + (a.sw * 0.55) + '" height="5" rx="2" fill="#061826" opacity=".55"/>');
        s.push('<rect x="' + (sx + 7) + '" y="' + (sy + 19) + '" width="' + (a.sw * 0.75) + '" height="3.5" rx="1.5" fill="#061826" opacity=".3"/>');
        s.push('<rect x="' + (sx + 7) + '" y="' + (sy + 28) + '" width="' + (a.sw * 0.4) + '" height="3.5" rx="1.5" fill="#061826" opacity=".3"/>');
        var kx = sx + a.sw + 9;
        for (var i = 0; i < a.right; i++) s.push('<rect x="' + kx + '" y="' + (sy + i * 12) + '" width="15" height="8" rx="2" fill="#DCEEF0" stroke="#B8D3D8"/><circle cx="' + (kx - 4) + '" cy="' + (sy + 4 + i * 12) + '" r="1.8" fill="' + (i % 2 ? '#F4B23E' : '#08BDC3') + '"/>');
        for (var j = 0; j < a.left; j++) s.push('<rect x="' + (sx - 24) + '" y="' + (sy + j * 12) + '" width="15" height="8" rx="2" fill="#DCEEF0" stroke="#B8D3D8"/>');
        if (a.soft) { var sw = (a.sw - (a.soft - 1) * 4) / a.soft; for (var k = 0; k < a.soft; k++) s.push('<rect x="' + (sx + k * (sw + 4)) + '" y="' + (sy + a.sh + 6) + '" width="' + sw + '" height="7" rx="2" fill="#B8D3D8"/>'); }
        for (var rr = 0; rr < 4; rr++) for (var cc = 0; cc < 3; cc++) s.push('<rect x="' + (112 + cc * 24) + '" y="' + (140 + rr * 15) + '" width="18" height="10" rx="3" fill="#fff" stroke="#9DBBC2"/>');
        s.push('<circle cx="210" cy="164" r="14" fill="#fff" stroke="#9DBBC2" stroke-width="2"/><circle cx="210" cy="164" r="5" fill="#DCEEF0"/>');
        s.push('<text x="96" y="208" font-family="IBM Plex Mono, monospace" font-size="8" fill="#6B7F87">PROVISIONED BY PSC</text></svg>');
        return s.join('');
      }
      var picks = $$('#phone-picker .pick'), stage = $('#phone-stage'), art = $('#phone-art'), detail = $('#phone-detail');
      var provItems = $$('#prov-list li'), provTimers = [];
      function selectPhone(i, focus) {
        var m = models[i];
        picks.forEach(function (p, j) { p.setAttribute('aria-selected', j === i ? 'true' : 'false'); p.tabIndex = j === i ? 0 : -1; });
        if (focus) picks[i].focus();
        art.innerHTML = phoneSVG(m.art);
        $('#chip1').textContent = m.chips[0]; $('#chip2').textContent = m.chips[1]; $('#chip3').textContent = m.chips[2];
        stage.classList.remove('is-in'); void stage.offsetWidth; stage.classList.add('is-in');
        $('#sp-lines').textContent = m.lines; $('#sp-keys').textContent = m.keys; $('#sp-power').textContent = m.power; $('#sp-best').textContent = m.best;
        detail.classList.remove('swap'); void detail.offsetWidth; detail.classList.add('swap');
        provTimers.forEach(clearTimeout); provTimers = [];
        provItems.forEach(function (li) { li.classList.remove('done'); });
        provItems.forEach(function (li, k) { provTimers.push(setTimeout(function () { li.classList.add('done'); }, RM ? 0 : 250 + k * 260)); });
      }
      picks.forEach(function (p, i) {
        p.addEventListener('click', function () { if (!picker.dataset.dragged) selectPhone(i); });
        p.addEventListener('keydown', function (e) {
          var n = null;
          if (e.key === 'ArrowRight' || e.key === 'ArrowDown') n = (i + 1) % picks.length;
          else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') n = (i - 1 + picks.length) % picks.length;
          if (n !== null) { e.preventDefault(); selectPhone(n, true); }
        });
      });
      art.innerHTML = phoneSVG(models[0].art);

      /* drag-to-scroll for the model row on narrow screens */
      var picker = $('#phone-picker');
      (function () {
        var down = false, startX = 0, startL = 0;
        picker.addEventListener('pointerdown', function (e) {
          if (e.pointerType !== 'mouse' || picker.scrollWidth <= picker.clientWidth) return;
          down = true; startX = e.clientX; startL = picker.scrollLeft; picker.dataset.dragged = '';
        });
        window.addEventListener('pointermove', function (e) {
          if (!down) return;
          var dx = e.clientX - startX;
          if (Math.abs(dx) > 6) { picker.dataset.dragged = '1'; picker.classList.add('is-dragging'); }
          picker.scrollLeft = startL - dx;
        });
        window.addEventListener('pointerup', function () {
          if (!down) return; down = false; picker.classList.remove('is-dragging');
          setTimeout(function () { picker.dataset.dragged = ''; }, 0);
        });
      })();

      if (FINE && !RM) {
        stage.addEventListener('pointermove', function (e) {
          var r = stage.getBoundingClientRect(), svg = $('.phone-svg', stage);
          if (!svg) return;
          svg.style.setProperty('--ry', (((e.clientX - r.left) / r.width - 0.5) * 16).toFixed(2) + 'deg');
          svg.style.setProperty('--rx', (-((e.clientY - r.top) / r.height - 0.5) * 12).toFixed(2) + 'deg');
        });
        stage.addEventListener('pointerleave', function () { var svg = $('.phone-svg', stage); if (svg) { svg.style.removeProperty('--rx'); svg.style.removeProperty('--ry'); } });
      }

      /* ==========================================================
         INTEGRATIONS ORBIT
         ========================================================== */
      var orbit = $('#orbit'), orbBtns = $$('.orb-node button'), orbLines = $$('.orbit-svg line'), integrInfo = $('#integr-info');
      function pickOrb(b) {
        if (b.classList.contains('is-on')) return;
        orbBtns.forEach(function (x) { x.classList.toggle('is-on', x === b); });
        var n = b.getAttribute('data-n');
        orbLines.forEach(function (l) { l.classList.toggle('on', l.getAttribute('data-l') === n); });
        integrInfo.innerHTML = '<strong>' + b.getAttribute('data-title') + '</strong><p>' + b.getAttribute('data-text') + '</p>';
        integrInfo.classList.remove('swap'); void integrInfo.offsetWidth; integrInfo.classList.add('swap');
      }
      orbBtns.forEach(function (b) {
        b.addEventListener('mouseenter', function () { pickOrb(b); });
        b.addEventListener('focus', function () { pickOrb(b); });
        b.addEventListener('click', function () { pickOrb(b); });
      });
      orbit.addEventListener('mouseenter', function () { orbit.classList.add('is-paused'); });
      orbit.addEventListener('mouseleave', function () { orbit.classList.remove('is-paused'); });
      orbit.addEventListener('focusin', function () { orbit.classList.add('is-paused'); });
      orbit.addEventListener('focusout', function () { orbit.classList.remove('is-paused'); });

      /* ==========================================================
         INDUSTRIES
         ========================================================== */
      var inds = $$('#inds .ind'), wide = window.matchMedia('(min-width: 992px)');
      function openInd(li) {
        inds.forEach(function (x) { var on = x === li; x.classList.toggle('is-open', on); $('.ind-btn', x).setAttribute('aria-expanded', on ? 'true' : 'false'); });
      }
      inds.forEach(function (li) {
        $('.ind-btn', li).addEventListener('click', function () { openInd(li); });
        li.addEventListener('mouseenter', function () { if (wide.matches && FINE) openInd(li); });
      });

      /* ==========================================================
         BEFORE / AFTER COMPARE
         ========================================================== */
      $$('[data-compare]').forEach(function (box) {
        var handle = $('.compare-handle', box), pos = 50, dragging = false;
        function set(v) {
          pos = clamp(v, 0, 100);
          box.style.setProperty('--pos', pos + '%');
          handle.setAttribute('aria-valuenow', Math.round(pos));
          handle.setAttribute('aria-valuetext', Math.round(pos) + '% showing the old setup');
        }
        function fromX(x) { var r = box.getBoundingClientRect(); set((x - r.left) / r.width * 100); }
        box.addEventListener('pointerdown', function (e) {
          dragging = true; box.classList.add('is-dragging'); fromX(e.clientX);
          box.setPointerCapture(e.pointerId);
        });
        box.addEventListener('pointermove', function (e) { if (dragging) fromX(e.clientX); });
        box.addEventListener('pointerup', function () { dragging = false; box.classList.remove('is-dragging'); });
        box.addEventListener('pointercancel', function () { dragging = false; box.classList.remove('is-dragging'); });
        handle.addEventListener('keydown', function (e) {
          var step = e.shiftKey ? 20 : 5;
          if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { e.preventDefault(); set(pos - step); }
          else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { e.preventDefault(); set(pos + step); }
          else if (e.key === 'Home') { e.preventDefault(); set(0); }
          else if (e.key === 'End') { e.preventDefault(); set(100); }
        });
        set(50);
        /* one-time nudge so people see it moves */
        if (!RM && 'IntersectionObserver' in window) {
          var io = new IntersectionObserver(function (en) {
            if (!en[0].isIntersecting) return;
            io.disconnect();
            var t0 = null;
            (function step(t) {
              if (!t0) t0 = t;
              var k = clamp((t - t0) / 1400, 0, 1);
              if (!dragging) set(50 + Math.sin(k * Math.PI * 2) * 14);
              if (k < 1) requestAnimationFrame(step);
            })(performance.now());
          }, { threshold: 0.6 });
          io.observe(box);
        }
      });

      /* ==========================================================
         PRICING SWITCH + SPOTLIGHT
         ========================================================== */
      var seg = $('#seg'), segBtns = $$('#seg button');
      function setPlan(btn, focus) {
        var v = btn.getAttribute('data-plan');
        seg.setAttribute('data-value', v);
        segBtns.forEach(function (b) { var on = b === btn; b.setAttribute('aria-checked', on ? 'true' : 'false'); b.tabIndex = on ? 0 : -1; });
        if (focus) btn.focus();
        $$('.plan-price[data-p1]').forEach(function (el) {
          if (!el.dataset.v) el.dataset.v = el.getAttribute('data-p1');
          tween(el, parseFloat(el.getAttribute('data-p' + v)), function (n) { return money(n, 2); }, 520);
          el.classList.remove('tween'); void el.offsetWidth; el.classList.add('tween');
        });
        $$('.plan-unit[data-u1]').forEach(function (el) { el.textContent = el.getAttribute('data-u' + v); });
      }
      segBtns.forEach(function (b, i) {
        b.addEventListener('click', function () { setPlan(b); });
        b.addEventListener('keydown', function (e) {
          if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].indexOf(e.key) > -1) { e.preventDefault(); setPlan(segBtns[1 - i], true); }
        });
      });
      $$('.spot').forEach(function (el) {
        el.addEventListener('pointermove', function (e) {
          var r = el.getBoundingClientRect();
          el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
          el.style.setProperty('--my', (e.clientY - r.top) + 'px');
        });
      });

      /* ==========================================================
         FAQ: accordion + search
         ========================================================== */
      var accItems = $$('#acc .acc-item');
      accItems.forEach(function (item) {
        var btn = $('.acc-btn', item);
        btn.addEventListener('click', function () {
          var open = item.classList.contains('is-open');
          accItems.forEach(function (x) { x.classList.remove('is-open'); $('.acc-btn', x).setAttribute('aria-expanded', 'false'); });
          if (!open) { item.classList.add('is-open'); btn.setAttribute('aria-expanded', 'true'); }
        });
      });
      var faqQ = $('#faq-q'), faqCount = $('#faq-count'), faqEmpty = $('#faq-empty');
      faqQ.addEventListener('input', function () {
        var q = faqQ.value.trim().toLowerCase(), shown = 0;
        accItems.forEach(function (item) {
          var hit = !q || item.textContent.toLowerCase().indexOf(q) > -1;
          item.hidden = !hit;
          if (hit) shown++;
        });
        faqCount.textContent = q ? shown + (shown === 1 ? ' question matches' : ' questions match') : accItems.length + ' questions';
        faqEmpty.classList.toggle('is-on', shown === 0);
      });

      /* ==========================================================
         FORMS
         ========================================================== */
      var serviceSelect = $('#f-service');
      $$('[data-service]').forEach(function (a) {
        a.addEventListener('click', function () {
          var v = a.getAttribute('data-service');
          $$('option', serviceSelect).forEach(function (o) { if (o.textContent === v) serviceSelect.value = v; });
          if (a.hasAttribute('data-close-dialog')) return;
          setTimeout(function () { var n = $('#f-name'); if (n) n.focus({ preventScroll: true }); }, RM ? 0 : 800);
        });
      });

      function digits(s) { return (s || '').replace(/\D/g, ''); }
      var rules = {
        name: function (v) { return v.trim().length > 1; },
        email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()); },
        phone: function (v) { return digits(v).length >= 10; }
      };
      var form = $('#appt-form'), statusEl = $('#form-status'), success = $('#success');
      var MAXFILE = 10 * 1024 * 1024;
      function check(input, quiet) {
        var wrap = input.closest('.fl'), ok = rules[input.name](input.value);
        wrap.classList.toggle('ok', ok);
        if (!quiet || !ok) wrap.classList.toggle('err', !ok);
        if (ok) wrap.classList.remove('err');
        input.setAttribute('aria-invalid', ok ? 'false' : 'true');
        return ok;
      }
      Object.keys(rules).forEach(function (n) {
        var input = form.elements[n];
        input.addEventListener('blur', function () { if (input.value) check(input); });
        input.addEventListener('input', function () {
          var wrap = input.closest('.fl');
          if (wrap.classList.contains('err') || wrap.classList.contains('ok')) check(input, true);
        });
      });

      var drop = $('#drop'), fileIn = $('#f-bill'), fileName = $('#file-name'), fileErr = $('#f-bill-err');
      function fileOk() {
        var f = fileIn.files && fileIn.files[0];
        if (!f) { drop.classList.remove('has-file'); fileErr.style.display = 'none'; return true; }
        var big = f.size > MAXFILE;
        fileErr.style.display = big ? 'block' : 'none';
        drop.classList.toggle('has-file', !big);
        fileName.textContent = big ? '' : f.name + ' (' + Math.max(1, Math.round(f.size / 1024)) + ' KB)';
        return !big;
      }
      fileIn.addEventListener('change', fileOk);
      ['dragenter', 'dragover'].forEach(function (ev) { drop.addEventListener(ev, function () { drop.classList.add('is-over'); }); });
      ['dragleave', 'drop'].forEach(function (ev) { drop.addEventListener(ev, function () { drop.classList.remove('is-over'); }); });

      function showSuccess() {
        success.classList.add('is-on');
        var t = $('#success-title'); t.setAttribute('tabindex', '-1'); setTimeout(function () { t.focus(); }, 60);
      }
      if (form.getAttribute('data-status') === 'sent') showSuccess();

      form.addEventListener('submit', function (e) {
        var bad = null;
        Object.keys(rules).forEach(function (n) { var i = form.elements[n]; if (!check(i) && !bad) bad = i; });
        if (!fileOk() && !bad) bad = fileIn;
        if (bad) {
          e.preventDefault();
          statusEl.className = 'form-status is-err';
          statusEl.textContent = 'Check the highlighted fields, then send again.';
          bad.focus();
          return;
        }
        statusEl.className = 'form-status'; statusEl.textContent = '';
        if (form.elements.website.value) { e.preventDefault(); return; }
        if (form.getAttribute('data-mode') !== 'mailto') {
          var sb = $('button[type="submit"]', form);
          setTimeout(function () { sb.disabled = true; sb.firstChild.textContent = 'Sending...'; }, 0);
          return;
        }
        e.preventDefault();
        var f = form.elements;
        var body = [
          'Name: ' + f.name.value, 'Company: ' + f.company.value, 'Email: ' + f.email.value, 'Phone: ' + f.phone.value,
          'Request: ' + f.service.value, 'Phones on system: ' + f.size.value,
          fileIn.files && fileIn.files[0] ? 'Bill: ' + fileIn.files[0].name + ' (attaching to this email)' : 'Bill: not attached',
          '', f.message.value
        ].join('\n');
        window.location.href = 'mailto:PSC@Pacificsoftcom.com?subject=' + encodeURIComponent(f.service.value + ' request from ' + f.name.value) + '&body=' + encodeURIComponent(body);
        showSuccess();
      });
      $('#success-reset').addEventListener('click', function () {
        form.reset();
        $$('.fl', form).forEach(function (w) { w.classList.remove('ok', 'err'); });
        fileOk();
        success.classList.remove('is-on');
        $('#f-name').focus();
      });

      var cb = $('#callback-form'), cbMsg = $('#cb-msg');
      cb.addEventListener('submit', function (e) {
        var ph = cb.elements.phone;
        if (digits(ph.value).length < 10) {
          e.preventDefault();
          cbMsg.className = 'cb-msg err';
          cbMsg.textContent = 'Enter a phone number with at least 10 digits.';
          ph.setAttribute('aria-invalid', 'true');
          ph.focus();
          return;
        }
        ph.setAttribute('aria-invalid', 'false');
        cbMsg.className = 'cb-msg';
        if (cb.getAttribute('data-mode') !== 'mailto') return;
        e.preventDefault();
        window.location.href = 'mailto:PSC@Pacificsoftcom.com?subject=' + encodeURIComponent('Call-back request') + '&body=' + encodeURIComponent('Please call me back at ' + ph.value);
        cbMsg.textContent = 'Your email app should open with the request. Press send there, or call 562-489-7760.';
      });

      /* ==========================================================
         MAGNETIC BUTTONS + CUSTOM CURSOR (fine pointers, motion OK)
         ========================================================== */
      if (FINE && !RM) {
        $$('.magnetic').forEach(function (el) {
          el.addEventListener('pointermove', function (e) {
            var r = el.getBoundingClientRect();
            var x = e.clientX - (r.left + r.width / 2), y = e.clientY - (r.top + r.height / 2);
            el.style.transition = 'transform 120ms linear';
            el.style.transform = 'translate(' + (x * 0.22).toFixed(1) + 'px,' + (y * 0.32).toFixed(1) + 'px)';
          });
          el.addEventListener('pointerleave', function () {
            el.style.transition = 'transform 500ms cubic-bezier(.22,.9,.3,1)';
            el.style.transform = '';
          });
        });

        root.classList.add('has-cursor');
        var cur = $('.cursor'), dot = $('.cursor-dot'), lab = $('.cursor-label');
        var mx = -100, my = -100, cx = -100, cy = -100;
        window.addEventListener('pointermove', function (e) {
          mx = e.clientX; my = e.clientY;
          dot.style.transform = 'translate3d(' + mx + 'px,' + my + 'px,0)';
          cur.classList.remove('is-hidden');
        }, { passive: true });
        doc.addEventListener('pointerleave', function () { cur.classList.add('is-hidden'); });
        (function loop() {
          cx += (mx - cx) * 0.18; cy += (my - cy) * 0.18;
          cur.style.transform = 'translate3d(' + cx.toFixed(1) + 'px,' + cy.toFixed(1) + 'px,0)';
          requestAnimationFrame(loop);
        })();
        var HOVER = 'a, button, [role="tab"], [role="slider"], summary, .rtile, .note, .plan, .sys-node, .tile, .ind, .marquee-item, .vs tbody tr, [data-cursor]';
        doc.addEventListener('pointerover', function (e) {
          var t = e.target;
          if (t.closest('input:not([type="range"]):not([type="file"]), textarea, select')) {
            cur.className = 'cursor is-text'; return;
          }
          var lbl = t.closest('[data-cursor]');
          var txt = lbl ? lbl.getAttribute('data-cursor') : (t.closest('a[href^="tel:"]') ? 'Call' : '');
          if (txt) { lab.textContent = txt; cur.className = 'cursor is-label'; return; }
          cur.className = t.closest(HOVER) ? 'cursor is-hover' : 'cursor';
        });
      }

      $('#year').textContent = new Date().getFullYear();
    })();
