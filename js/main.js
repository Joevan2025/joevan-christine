/* main.js: countdown, nav, spine, reveals, hashtag, chips */
(() => {
'use strict';
var W = window.WEDDING || {};
var $ = (s, r) => (r || document).querySelector(s), $$ = (s, r) => [].slice.call((r || document).querySelectorAll(s));
var on = (el, ev, fn, o) => { if (el) el.addEventListener(ev, fn, o); };
var tick = (fn) => { var q = false; return () => { if (q) return; q = true; requestAnimationFrame(() => { q = false; fn(); }); }; };
/* 1. data-lite + reduce */
var lite = !!(navigator.connection && navigator.connection.saveData);
if (lite) document.documentElement.dataset.lite = '1';
var reduce = lite || matchMedia('(prefers-reduced-motion: reduce)').matches;
/* 2. Countdown: epoch-ms on +08:00 stamps (zone-safe) */
var DAY = 864e5, H = 36e5, MIN = 6e4, pad = (n) => (n < 10 ? '0' : '') + n;
var wed = Date.parse(W.WEDDING_DATE || ''), due = Date.parse(W.RSVP_DEADLINE || '');
var cd = $('#countdown'), ctx = $('#countdown-context'), timer = null;
var cdN = ['#cd-days', '#cd-hours', '#cd-mins'].map((i) => $(i));
function countdown() {
  var now = Date.now(), left = wed - now;
  if (left <= 0) {
    cd.innerHTML = '<span class="cd-done">Married, 21 November 2026</span>';
    if (ctx) ctx.textContent = '';
    clearInterval(timer);
    return;
  }
  cdN[0].textContent = Math.floor(left / DAY);
  cdN[1].textContent = pad(Math.floor(left % DAY / H));
  cdN[2].textContent = pad(Math.floor(left % H / MIN));
  if (!ctx) return;
  var t;
  if (now >= wed - 14 * H) t = 'today, 2:00 PM, Queen of Peace';
  else if (isNaN(due) || now > due) t = 'replies are closed, see you in Bacolod';
  else {
    // due is 23:59:59 PH: floor = whole days left
    var n = Math.floor((due - now) / DAY);
    t = n === 0 ? 'and today is the last day to reply' : n === 1 ? 'and one day left to reply' : 'and ' + n + ' days left to reply';
  }
  ctx.textContent = t;
}
if (cd && cdN.every(Boolean) && !isNaN(wed)) {
  countdown();
  setTimeout(() => { countdown(); timer = setInterval(countdown, MIN); }, MIN - Date.now() % MIN);
}
/* 3. Masthead */
var head = $('#masthead');
var onHead = tick(() => { head.classList.toggle('is-scrolled', scrollY > 40); });
if (head) { on(window, 'scroll', onHead, { passive: true }); onHead(); }
/* 4. Thumb bar */
var bar = $('#thumb-bar'), rsvp = $('#rsvp-card') || $('#rsvp'), thumb = $('#thumb-rsvp');
var menu = $('#menu'), menuOpen = $('#menu-open'), IO = self.IntersectionObserver, nearRsvp = false;
function barState() { if (bar) bar.classList.toggle('is-hidden', nearRsvp || !!(menu && menu.open)); }
if (bar && rsvp && IO) {
  // Hide the bar while any part of the reply card is on screen (a tall card never reaches 50% on a phone).
  new IO((es) => { nearRsvp = es[es.length - 1].isIntersecting; barState(); }, { threshold: 0 }).observe(rsvp);
}
function replied() {
  if (!thumb) return;
  thumb.classList.add('is-replied');
  var l = $('.thumb-rsvp-label', thumb);
  if (l) l.textContent = 'Replied';
}
// localStorage can throw in in-app browsers
try { if (localStorage.getItem('jc-rsvp-sent')) replied(); } catch (e) {}
on(window, 'rsvp:sent', replied);
/* 5. Menu dialog */
if (menu && menuOpen) {
  var closeMenu = () => {
    if (menu.close) menu.close(); else { menu.removeAttribute('open'); menu.dispatchEvent(new Event('close')); }
  };
  on(menuOpen, 'click', () => {
    if (menu.showModal) menu.showModal(); else menu.setAttribute('open', '');
    menuOpen.setAttribute('aria-expanded', 'true');
    barState();
  });
  on($('#menu-close'), 'click', closeMenu);
  $$('a', menu).forEach((a) => { on(a, 'click', closeMenu); });
  on(menu, 'click', (e) => { if (e.target === menu) closeMenu(); });
  on(menu, 'close', () => { menuOpen.setAttribute('aria-expanded', 'false'); barState(); menuOpen.focus(); });
}
/* 6. Spine draw: --p (0..1) per host */
var hosts = [];
try { hosts = $$('section:has(> .spine), footer:has(> .spine)'); } catch (e) {}
if (!hosts.length) hosts = $$('.spine').map((s) => s.parentElement);
if (reduce) {
  hosts.forEach((h) => { h.style.setProperty('--p', '1'); });
} else if (hosts.length) {
  var last = hosts.map(() => -1);
  var spine = tick(() => {
    var line = innerHeight * 0.8;
    hosts.forEach((h, i) => {
      var r = h.getBoundingClientRect();
      var p = r.height ? Math.min(1, Math.max(0, (line - r.top) / r.height)) : 0;
      if (Math.abs(p - last[i]) > 0.004) { last[i] = p; h.style.setProperty('--p', p.toFixed(3)); }
    });
  });
  on(window, 'scroll', spine, { passive: true });
  on(window, 'resize', spine, { passive: true });
  spine();
}
/* 7. Reveals */
var grow = $$('.section-head, .hero-body, .programme-item'), ro = null;
var grown = (el) => { el.classList.add('is-grown'); if (ro) ro.unobserve(el); };
if (reduce || !IO) grow.forEach(grown);
else {
  ro = new IO((es) => { es.forEach((e) => { if (e.isIntersecting) grown(e.target); }); }, { threshold: 0.35 });
  grow.forEach((el) => { ro.observe(el); });
}
/* 8. Hashtag */
var TAG = W.HASHTAG || '#DisTINedtobewithJOE', HOLD = 'Press and hold to copy';
var disp = $('#hashtag-display'), ftag = $('#footer-hashtag'), hstat = $('#hashtag-status'), timers = {};
if (ftag) ftag.textContent = TAG;
function status(el, msg) {
  if (!el) return;
  el.textContent = msg;
  clearTimeout(timers[el.id]);
  timers[el.id] = setTimeout(() => { el.textContent = ''; }, 2500);
}
// resolves boolean, never rejects
function copyText(text) {
  var legacy = () => {
    try {
      var ta = document.createElement('textarea');
      ta.value = text; ta.style.cssText = 'position:fixed;opacity:0';
      document.body.appendChild(ta); ta.select();
      var ok = document.execCommand('copy');
      ta.remove(); return ok;
    } catch (e) { return false; }
  };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text).then(() => true, legacy);
  }
  return Promise.resolve(legacy());
}
on($('#copy-hashtag'), 'click', () => {
  copyText(TAG).then((ok) => { status(hstat, ok ? 'Copied' : HOLD); });
});
on($('#share-hashtag'), 'click', () => {
  if (navigator.share) {
    navigator.share({ text: TAG + ' Joevan & Christine, 21 Nov 2026', url: location.href })
      .catch((e) => { if (!e || e.name !== 'AbortError') status(hstat, HOLD); });
    return;
  }
  copyText(location.href).then((ok) => { status(hstat, ok ? 'Link copied, paste in Messenger' : HOLD); });
  if (/Android|iPhone|iPad/i.test(navigator.userAgent)) try { location.href = 'fb-messenger://share?link=' + encodeURIComponent(location.href); } catch (e) {}
});
/* 9. Colour chips */
var cstat = $('#chip-status');
$$('.chip[data-hex]').forEach((c) => {
  on(c, 'click', () => {
    var hex = c.dataset.hex;
    copyText(hex).then((ok) => { status(cstat, ok ? 'Copied ' + hex : 'Press and hold the code to copy it'); });
  });
});
/* 10. Drive minutes */
var dm = W.DRIVE_MINUTES || {};
[['#drive-1', dm.ceremonyToReception], ['#drive-2', dm.receptionToAfterparty]].forEach((d) => {
  var el = $(d[0]);
  if (!el) return;
  if (d[1] == null) { var l = el.closest('.route-leg'); if (l) l.hidden = true; } else el.textContent = d[1];
});
})();
