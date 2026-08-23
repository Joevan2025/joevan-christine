/* media.js — gallery/lightbox, film, music, map. No network until a tap. */
(function () {
'use strict';

var W = window.WEDDING || {};
var $ = function (id) { return document.getElementById(id); };

/* ---------- 1. Gallery + lightbox ---------- */
(function gallery() {
  var root = $('frames');
  var lb = $('lightbox');
  if (!root) return;
  var frames = Array.prototype.slice.call(root.querySelectorAll('.frame'));
  var count = +W.GALLERY_COUNT || frames.length;

  frames.forEach(function (f) {
    var btn = f.querySelector('.frame-open');
    var img = f.querySelector('img');
    if (+f.dataset.slot > count) f.hidden = true;
    if (!img) return;
    var sync = function () { if (btn) btn.disabled = f.dataset.empty === '1'; };
    // inline onerror may have fired before this script ran
    if (img.complete && img.naturalWidth === 0) f.dataset.empty = '1';
    img.addEventListener('load', function () { delete f.dataset.empty; sync(); });
    img.addEventListener('error', sync);
    sync();
  });

  var photos = function () {
    return frames.filter(function (f) { return !f.hidden && f.dataset.empty !== '1'; });
  };

  if (!lb || typeof lb.showModal !== 'function') return;
  var lbImg = $('lb-img'), lbCount = $('lb-count'), prev = $('lb-prev'), next = $('lb-next');
  var list = [], idx = 0, opener = null;

  var show = function (i) {
    var n = list.length;
    idx = (i + n) % n;
    var img = list[idx].querySelector('img');
    lbImg.src = img.currentSrc || img.src;
    lbImg.alt = img.alt || '';
    lbCount.textContent = (idx + 1) + ' of ' + n;
    prev.hidden = next.hidden = n < 2;
  };

  root.addEventListener('click', function (e) {
    var btn = e.target.closest('.frame-open');
    if (!btn) return;
    var f = btn.closest('.frame');
    if (!f || f.dataset.empty === '1') return;
    list = photos();
    var i = list.indexOf(f);
    if (i < 0) return;
    opener = btn;
    show(i);
    try { lb.showModal(); } catch (err) { return; }
  });

  prev.addEventListener('click', function () { show(idx - 1); });
  next.addEventListener('click', function () { show(idx + 1); });
  $('lb-close').addEventListener('click', function () { lb.close(); });
  lb.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') { show(idx - 1); e.preventDefault(); }
    else if (e.key === 'ArrowRight') { show(idx + 1); e.preventDefault(); }
  });
  lb.addEventListener('click', function (e) { if (e.target === lb) lb.close(); });
  lb.addEventListener('close', function () {
    lbImg.removeAttribute('src');
    if (opener && opener.isConnected) opener.focus();
  });
})();

/* ---------- 2. Film ---------- */
(function film() {
  var wrap = $('film'), play = $('film-play'), frame = $('film-frame'), sound = $('film-sound');
  if (!wrap || !play || !frame) return;
  // Accept a bare 11-char video ID or any pasted YouTube link form.
  // (A full URL in the ID slot is exactly the bug that broke the old page.)
  function ytId(v) {
    v = String(v || '').trim();
    if (/^[A-Za-z0-9_-]{11}$/.test(v)) return v;
    try {
      var u = new URL(v), id = '';
      if (/(^|\.)youtu\.be$/.test(u.hostname)) id = u.pathname.split('/')[1] || '';
      else if (/youtube\./.test(u.hostname)) {
        id = u.searchParams.get('v') || '';
        if (!id) {
          var seg = u.pathname.match(/\/(shorts|embed|live)\/([A-Za-z0-9_-]{11})/);
          if (seg) id = seg[2];
        }
      }
      if (/^[A-Za-z0-9_-]{11}$/.test(id)) return id;
    } catch (e) {}
    return v; // let YouTube report an unrecognizable value
  }
  // Browsers refuse to autoplay video WITH sound until the guest has
  // interacted with the page, so the film starts silently by itself and one
  // tap re-loads it unmuted — that tap is the gesture the sound needs.
  function start(muted) {
    if (!W.YOUTUBE_ID) return null;
    var ifr = document.createElement('iframe');
    ifr.src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(ytId(W.YOUTUBE_ID)) +
      '?autoplay=1&rel=0&modestbranding=1&playsinline=1&mute=' + (muted ? '1' : '0');
    ifr.title = 'Save the date film';
    ifr.setAttribute('allow', 'autoplay; encrypted-media; picture-in-picture; fullscreen');
    ifr.setAttribute('allowfullscreen', '');
    frame.textContent = '';
    frame.appendChild(ifr);
    frame.hidden = false;
    wrap.dataset.playing = '1';
    wrap.dataset.muted = muted ? '1' : '';
    return ifr;
  }

  function playWithSound() { var f = start(false); if (f) f.focus(); }
  play.addEventListener('click', playWithSound);
  if (sound) sound.addEventListener('click', playWithSound);

  // Starts on its own once the film reaches the screen. Guests who asked for
  // reduced motion, or who are on Save-Data, keep the tap-to-play poster.
  var reduce = (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) ||
    document.documentElement.getAttribute('data-lite') === '1';
  if (!reduce && typeof IntersectionObserver === 'function') {
    var io = new IntersectionObserver(function (entries) {
      if (entries[entries.length - 1].isIntersecting) { io.disconnect(); start(true); }
    }, { threshold: 0.35 });
    io.observe(wrap);
  }
})();

/* ---------- 3. Music ---------- */
(function music() {
  var list = $('tracks'), player = $('player');
  var tracks = Array.isArray(W.TRACKS) ? W.TRACKS : [];
  if (!list || !player || !tracks.length) return;

  var el = function (tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  };
  var icon = function (name) {
    var ns = 'http://www.w3.org/2000/svg';
    var s = document.createElementNS(ns, 'svg');
    s.setAttribute('class', 'ico ico-' + name);
    s.setAttribute('aria-hidden', 'true');
    s.setAttribute('focusable', 'false');
    var u = document.createElementNS(ns, 'use');
    u.setAttribute('href', '#ico-' + name);
    s.appendChild(u);
    return s;
  };
  var fmt = function (s) {
    if (!isFinite(s) || s < 0) return '0:00';
    s = Math.floor(s);
    var m = Math.floor(s / 60), r = s % 60;
    return m + ':' + (r < 10 ? '0' : '') + r;
  };

  var rows = tracks.map(function (t, i) {
    var li = el('li', 'track');
    li.dataset.index = i;
    li.dataset.state = 'idle';
    var btn = el('button', 'track-play');
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Play ' + t.moment);
    btn.appendChild(icon('play'));
    btn.appendChild(icon('pause'));
    li.appendChild(btn);
    li.appendChild(el('span', 'track-moment', t.moment));
    li.appendChild(el('span', 'track-title', t.title || 'Song to be announced'));
    li.appendChild(el('span', 'track-artist', t.artist || ''));
    li.appendChild(el('span', 'track-dur', '–:––'));
    var prog = el('div', 'track-progress');
    var range = el('input', 'track-range');
    range.type = 'range'; range.min = 0; range.max = 1000; range.value = 0;
    range.setAttribute('aria-label', 'Seek, ' + t.moment);
    prog.appendChild(range);
    prog.appendChild(el('span', 'track-time', '0:00'));
    li.appendChild(prog);
    list.appendChild(li);
    return { li: li, btn: btn, range: range, time: prog.lastChild, dur: li.children[4], title: li.children[2], t: t };
  });

  var active = -1; // row index the <audio> is loaded with
  var setState = function (r, state) {
    r.li.dataset.state = state;
    r.li.classList.toggle('is-active', state !== 'idle' && state !== 'missing');
    if (state !== 'missing') {
      r.btn.setAttribute('aria-label', (state === 'playing' ? 'Pause ' : 'Play ') + r.t.moment);
    }
  };
  var reset = function (r) {
    setState(r, 'idle');
    r.range.value = 0;
    r.time.textContent = '0:00';
  };

  list.addEventListener('click', function (e) {
    var btn = e.target.closest('.track-play');
    if (!btn || btn.disabled) return;
    var i = +btn.closest('.track').dataset.index;
    var r = rows[i];
    if (i === active) {
      if (!player.paused) { player.pause(); return; }
    } else {
      if (active >= 0) reset(rows[active]);
      active = i;
      player.src = r.t.file;
      player.load();
    }
    setState(r, 'playing'); // 'error'/'pause' events correct this
    var p = player.play();
    if (p && p.catch) p.catch(function () { if (active === i) setState(r, 'paused'); });
  });

  list.addEventListener('input', function (e) {
    if (!e.target.classList.contains('track-range')) return;
    var i = +e.target.closest('.track').dataset.index;
    if (i !== active || !isFinite(player.duration)) return;
    player.currentTime = (e.target.value / 1000) * player.duration;
  });

  player.addEventListener('play', function () { if (active >= 0) setState(rows[active], 'playing'); });
  player.addEventListener('pause', function () {
    if (active >= 0 && !player.ended) setState(rows[active], 'paused');
  });
  player.addEventListener('ended', function () { if (active >= 0) reset(rows[active]); });
  player.addEventListener('loadedmetadata', function () {
    if (active >= 0) rows[active].dur.textContent = fmt(player.duration);
  });
  player.addEventListener('timeupdate', function () {
    if (active < 0) return;
    var r = rows[active];
    r.time.textContent = fmt(player.currentTime);
    if (isFinite(player.duration) && player.duration > 0) {
      r.range.value = Math.round((player.currentTime / player.duration) * 1000);
    }
  });
  // missing MP3 (404) lands here
  player.addEventListener('error', function () {
    if (active < 0) return;
    var r = rows[active];
    active = -1;
    reset(r);
    setState(r, 'missing');
    if (r.t.title) r.dur.textContent = 'coming soon';
    else r.title.textContent = 'coming soon';
    r.btn.disabled = true;
    r.btn.setAttribute('aria-label', 'Coming soon');
    r.range.disabled = true;
  });

  document.addEventListener('visibilitychange', function () {
    if (document.hidden && !player.paused) player.pause();
  });
})();

/* ---------- 4. Per-stop venue maps (exact named pin, loaded on tap) ---------- */
(function venueMaps() {
  var stops = document.querySelectorAll('.stop[data-venue]');
  [].forEach.call(stops, function (li) {
    var btn = li.querySelector('.show-stop-map');
    var slot = li.querySelector('.stop-map');
    if (!btn || !slot) return;
    var venue = ((W.VENUES || []).filter(function (v) { return v.id === li.getAttribute('data-venue'); }))[0];
    // Official maps/embed?pb= URL with the venue's own place token: a named
    // pin on the exact spot, in the only Google embed format that real
    // browsers allow inside an iframe (legacy output=embed URLs are refused).
    function pbEmbed(v) {
      return 'https://www.google.com/maps/embed?pb=' +
        '!1m18!1m12!1m3!1d3950' +
        '!2d' + (v.mapLon || v.lon) +
        '!3d' + (v.mapLat || v.lat) +
        '!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2' +
        '!1s' + encodeURIComponent(v.ftid) +
        '!2s' + encodeURIComponent(v.name) +
        '!5e0!3m2!1sen!2sph!4v1700000000000!5m2!1sen!2sph';
    }
    btn.addEventListener('click', function () {
      if (!venue) return;
      var ifr = document.createElement('iframe');
      ifr.src = venue.ftid ? pbEmbed(venue)
        : 'https://www.google.com/maps?q=' + encodeURIComponent(venue.name + ' ' + venue.city) + '&output=embed';
      ifr.title = 'Map of ' + (venue ? venue.name : 'the venue');
      ifr.setAttribute('loading', 'lazy');
      ifr.setAttribute('referrerpolicy', 'no-referrer-when-downgrade');
      ifr.setAttribute('allowfullscreen', '');
      slot.textContent = '';
      slot.appendChild(ifr);
      slot.hidden = false;
      btn.hidden = true;
      slot.tabIndex = -1;
      try { slot.focus({ preventScroll: true }); } catch (e) { slot.focus(); }
    }, { once: true });
  });
})();

/* 5. Calendar pills are static Google Calendar links (work on iOS too): nothing to do. */
})();
