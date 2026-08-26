/* bgm.js: the invitation's cover screen and the background music behind it.
   The cover's one tap is the user gesture browsers require before sound may
   start; the music player (the film's audio, hidden from view) is created
   inside that tap. Everything else on the page that makes sound coordinates
   through window.BGM.holdFor / releaseFor so two things never play at once. */
(function () {
  'use strict';
  var W = window.WEDDING || {};

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
  window.ytId = ytId;

  /* ---- YouTube IFrame API, loaded only when something first needs it ---- */
  var apiQueue = [], apiLoading = false;
  function loadApi(cb) {
    if (window.YT && window.YT.Player) { cb(); return; }
    apiQueue.push(cb);
    if (apiLoading) return;
    apiLoading = true;
    window.onYouTubeIframeAPIReady = function () {
      var fns = apiQueue.splice(0);
      fns.forEach(function (f) { try { f(); } catch (e) {} });
    };
    var s = document.createElement('script');
    s.src = 'https://www.youtube.com/iframe_api';
    s.async = true;
    document.head.appendChild(s);
  }

  /* ---- the background player ---- */
  var mount = document.getElementById('bgm');
  var toggles = [].slice.call(document.querySelectorAll('[data-music-toggle]'));
  var player = null, ready = false;
  var wantPlaying = false;   // the guest opened with music
  var guestOff = false;      // the guest switched it off (always wins over auto-resume)
  var holds = {};            // things currently playing that must not be talked over

  function videoId() { return ytId(W.MUSIC_VIDEO || W.YOUTUBE_ID || ''); }
  function held() { return Object.keys(holds).length > 0; }
  function shouldPlay() { return wantPlaying && !guestOff && !held(); }

  function reflect() {
    var on = shouldPlay();
    toggles.forEach(function (t) {
      t.setAttribute('aria-pressed', on ? 'true' : 'false');
      t.setAttribute('aria-label', on ? 'Music on' : 'Music off');
      t.dataset.state = guestOff || !wantPlaying ? 'off' : (held() ? 'held' : 'on');
    });
  }

  // Hold/release can arrive in quick bursts (a song that ends at once, a fast
  // tap-tap); sending pause-then-play to YouTube milliseconds apart makes it
  // drop one. Settle for a beat and send only the final decision.
  var applyTimer = null;
  function applyNow() {
    applyTimer = null;
    if (player && ready) {
      try { if (shouldPlay()) player.playVideo(); else player.pauseVideo(); } catch (e) {}
    }
    reflect();
  }
  function apply() {
    reflect();
    clearTimeout(applyTimer);
    applyTimer = setTimeout(applyNow, 150);
  }

  function create() {
    if (player || !mount) return;
    var id = videoId();
    if (!id) return;
    loadApi(function () {
      if (player) return;
      player = new YT.Player(mount, {
        width: 300, height: 200, videoId: id,   // YouTube refuses players under 200x200
        host: 'https://www.youtube-nocookie.com',
        playerVars: { autoplay: 1, playsinline: 1, loop: 1, playlist: id, controls: 0,
                      rel: 0, modestbranding: 1, disablekb: 1, fs: 0, origin: location.origin },
        events: {
          onReady: function (e) {
            ready = true;
            try { e.target.unMute(); e.target.setVolume(100); } catch (err) {}
            apply();
          },
          onStateChange: function (e) {
            // loop=1 normally restarts on its own; belt and braces.
            if (e.data === 0 && shouldPlay()) { try { e.target.playVideo(); } catch (err) {} }
            reflect();
          }
        }
      });
    });
  }

  window.BGM = {
    loadApi: loadApi,
    open: function (withMusic) {
      if (withMusic) { guestOff = false; wantPlaying = true; create(); }
      else { guestOff = true; wantPlaying = false; }
      reflect();
    },
    toggle: function () {
      if (!player) { guestOff = false; wantPlaying = true; create(); reflect(); return; }
      guestOff = !guestOff;
      wantPlaying = true;
      apply();
    },
    holdFor: function (src) { holds[src] = true; apply(); },
    releaseFor: function (src) { delete holds[src]; apply(); },
    state: function () {
      var ps = null, muted = null;
      if (player && ready) { try { ps = player.getPlayerState(); muted = player.isMuted(); } catch (e) {} }
      return { player: !!player, ready: ready, wantPlaying: wantPlaying, guestOff: guestOff,
               holds: Object.keys(holds), playerState: ps, muted: muted };
    }
  };
  toggles.forEach(function (t) { t.addEventListener('click', window.BGM.toggle); });

  /* ---- the cover ---- */
  var cover = document.getElementById('cover');
  if (!cover) { reflect(); return; }
  var openBtn = document.getElementById('cover-open');
  var quiet = document.getElementById('cover-quiet');
  var behind = ['masthead', 'main', 'thumb-bar'].map(function (id) { return document.getElementById(id); })
    .concat([document.querySelector('.footer')]).filter(Boolean);
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  behind.forEach(function (el) { try { el.inert = true; } catch (e) {} el.setAttribute('aria-hidden', 'true'); });
  document.documentElement.dataset.cover = 'open';
  requestAnimationFrame(function () { cover.dataset.drawn = '1'; }); // the arch draws itself in

  function close(withMusic) {
    if (cover.dataset.closing) return;
    window.BGM.open(withMusic);
    behind.forEach(function (el) { try { el.inert = false; } catch (e) {} el.removeAttribute('aria-hidden'); });
    cover.dataset.closing = '1';
    document.documentElement.dataset.cover = 'closed';
    try { window.dispatchEvent(new CustomEvent('cover:closed')); } catch (e) {}
    var done = function () { if (cover.parentNode) cover.parentNode.removeChild(cover); };
    if (reduce) done(); else setTimeout(done, 700);
    var h = document.getElementById('hero-title');
    if (h) { h.tabIndex = -1; try { h.focus({ preventScroll: true }); } catch (e) {} }
  }
  if (openBtn) openBtn.addEventListener('click', function () { close(true); });
  if (quiet) quiet.addEventListener('click', function (e) { e.preventDefault(); close(false); });
  setTimeout(function () { try { openBtn && openBtn.focus(); } catch (e) {} }, 50);
})();
