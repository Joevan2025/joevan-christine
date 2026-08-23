/* RSVP card. buildPayload() is the single source of the JSON shape
   sent to the backend; phase 2 reuses it via window.buildPayload. */
(function () {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };
  var card = $('rsvp-card'), form = $('rsvp-form');
  if (!card || !form) return;

  var yes = $('att-yes'), no = $('att-no'), guestsField = $('guests-field');
  var guests = $('guests'), minus = $('guests-minus'), plus = $('guests-plus');
  var companions = $('companions');
  var fname = $('fname'), lname = $('lname'), email = $('email'), phone = $('phone');
  var message = $('message'), website = $('website');
  var errors = $('rsvp-errors'), submitBtn = $('rsvp-submit');
  var success = $('rsvp-success');
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var val = function (el) { return el && el.value ? el.value.trim() : ''; };

  // attending
  function attending() {
    if (yes && yes.checked) return true;
    if (no && no.checked) return false;
    return null; // nothing chosen
  }
  function syncGuests() {
    if (guestsField) guestsField.hidden = attending() === false;
    renderCompanions();
  }
  [yes, no].forEach(function (r) {
    if (r) r.addEventListener('change', function () { syncGuests(); clearErr(attCtl()); });
  });

  // guest stepper
  function clampGuests(delta) {
    if (!guests) return;
    var min = parseInt(guests.min, 10) || 1, max = parseInt(guests.max, 10) || 4;
    var n = parseInt(guests.value, 10);
    if (isNaN(n)) n = min;
    n = Math.min(max, Math.max(min, n + (delta || 0)));
    guests.value = String(n);
    if (minus) minus.disabled = n <= min;
    if (plus) plus.disabled = n >= max;
    renderCompanions();
  }
  if (minus) minus.addEventListener('click', function () { clampGuests(-1); });
  if (plus) plus.addEventListener('click', function () { clampGuests(1); });
  if (guests) guests.addEventListener('change', function () { clampGuests(0); });

  // Companion names: one required input per guest beyond the first.
  // Incremental append/remove (never rebuild) so typed names survive
  // stepper changes and Yes -> No -> Yes toggles.
  function renderCompanions() {
    // Only re-render while accepting. Declining hides the whole guests
    // field, so leaving the inputs in place preserves typed names across
    // a Yes -> No -> Yes change (buildPayload ignores them when declining).
    if (!companions || attending() !== true) return;
    var want = (parseInt(guests && guests.value, 10) || 1) - 1;
    while (companions.children.length > want) companions.removeChild(companions.lastElementChild);
    while (companions.children.length < want) {
      var i = companions.children.length + 1;
      var wrap = document.createElement('div'); wrap.className = 'field';
      var lab = document.createElement('label'); lab.className = 'label'; lab.htmlFor = 'companion-' + i;
      lab.textContent = 'Companion ' + i + ' full name';
      var inp = document.createElement('input'); inp.type = 'text'; inp.id = 'companion-' + i;
      inp.name = 'companion-' + i; inp.required = true; inp.autocomplete = 'off';
      inp.setAttribute('aria-describedby', 'err-companion-' + i);
      var err = document.createElement('p'); err.className = 'field-error'; err.id = 'err-companion-' + i;
      err.hidden = true; err.textContent = "Please tell us this companion's name so we can mark their seat.";
      wrap.appendChild(lab); wrap.appendChild(inp); wrap.appendChild(err);
      companions.appendChild(wrap);
    }
  }
  function companionInputs() {
    return companions ? [].slice.call(companions.querySelectorAll('input')) : [];
  }
  // Delegated so it survives re-renders.
  if (companions) companions.addEventListener('input', function (e) {
    if (e.target && e.target.tagName === 'INPUT') clearErr(fieldCtl(e.target, 'err-' + e.target.id));
  });
  clampGuests(0);

  // validation
  // control = { inputs, wrap (.field/.choice), err (#err-*) }
  function attCtl() {
    return { inputs: [yes, no], wrap: yes && yes.closest('.choice'), err: $('err-attending') };
  }
  function fieldCtl(input, errId) {
    return { inputs: [input], wrap: input && input.closest('.field'), err: $(errId) };
  }
  function markErr(c) {
    c.wrap.classList.add('is-invalid');
    c.err.hidden = false;
    c.inputs.forEach(function (i) { i.setAttribute('aria-invalid', 'true'); });
  }
  function clearErr(c) {
    c.wrap.classList.remove('is-invalid');
    c.err.hidden = true;
    c.inputs.forEach(function (i) { i.removeAttribute('aria-invalid'); });
    if (card.dataset.rsvpStatus !== 'error') errors.textContent = '';
  }
  [[fname, 'err-fname'], [lname, 'err-lname'], [email, 'err-email']].forEach(function (p) {
    if (p[0]) p[0].addEventListener('input', function () { clearErr(fieldCtl(p[0], p[1])); });
  });

  function validate() {
    var bad = [];
    if (attending() === null) bad.push(attCtl());
    if (!val(fname)) bad.push(fieldCtl(fname, 'err-fname'));
    if (!val(lname)) bad.push(fieldCtl(lname, 'err-lname'));
    if (!EMAIL_RE.test(val(email))) bad.push(fieldCtl(email, 'err-email'));
    if (attending() === true) {
      companionInputs().forEach(function (inp) {
        if (!val(inp)) bad.push(fieldCtl(inp, 'err-' + inp.id));
      });
    }
    bad.forEach(markErr);
    if (bad.length) {
      errors.textContent = 'Please check the highlighted fields.';
      bad[0].inputs[0].focus();
    }
    return !bad.length;
  }

  // payload: the ONE shape the backend receives
  function buildPayload() {
    var going = attending() === true;
    return {
      timestamp: new Date().toISOString(),
      firstName: val(fname),
      lastName: val(lname),
      email: val(email),
      phone: val(phone),
      attending: going ? 'Yes' : 'No',
      guests: going ? String(parseInt(guests && guests.value, 10) || 1) : '0',
      message: val(message),
      companions: going ? companionInputs().map(val) : []
    };
  }
  window.buildPayload = buildPayload;

  // submit
  function send(payload) {
    // Honeypot filled => bot: pretend success, send nothing.
    if (val(website)) return Promise.resolve();
    var W = window.WEDDING;
    var ctrl = typeof AbortController === 'function' ? new AbortController() : null;
    var timer = ctrl && setTimeout(function () { ctrl.abort(); }, 15000);
    function settle(p) {
      return p.then(function (r) { clearTimeout(timer); return r; },
                    function (e) { clearTimeout(timer); throw e; });
    }
    if (W.RSVP_ENDPOINT_V2) {
      // v2 backend (backend/Code.gs): the body is a JSON string sent with NO
      // Content-Type header, so this is a CORS "simple request" (text/plain)
      // and needs no preflight, which Apps Script cannot answer. The response
      // is readable JSON; success REQUIRES ok:true. Never add headers here.
      return settle(fetch(W.RSVP_ENDPOINT_V2, {
        method: 'POST',
        body: JSON.stringify(payload),
        signal: ctrl ? ctrl.signal : undefined
      })).then(function (r) { return r.json(); }).then(function (d) {
        if (!d || d.ok !== true) {
          var err = new Error('rejected');
          if (d && d.error) err.server = String(d.error);
          throw err;
        }
      });
    }
    // Legacy endpoint. no-cors => opaque: resolved only proves the request
    // left the device. Retired once RSVP_ENDPOINT_V2 is set in config.
    return settle(fetch(W.RSVP_ENDPOINT, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: ctrl ? ctrl.signal : undefined
    })).then(function () {});
  }

  function onSent(payload) {
    var going = payload.attending === 'Yes', n = payload.firstName;
    card.dataset.rsvpStatus = 'sent';
    form.hidden = true;
    var t = $('rsvp-success-title'), x = $('rsvp-success-text');
    if (t) t.textContent = going ? 'We have your reply, ' + n + '.' : 'Thank you for telling us, ' + n + '.';
    if (x) {
      var seats = '';
      if (going && payload.companions && payload.companions.length) {
        var cs = payload.companions.slice();
        seats = "We've saved seats for you, " +
          (cs.length > 1 ? cs.slice(0, -1).join(', ') + ' and ' + cs[cs.length - 1] : cs[0]) + '. ';
      }
      x.textContent = going
        ? seats + "See you on the 21st of November. We'll text the details to the number you gave us closer to the day."
        : "We'll miss you on the day and will keep you in our hearts.";
    }
    success.hidden = false;
    success.focus();
    try { window.dispatchEvent(new CustomEvent('rsvp:sent', { detail: payload })); } catch (e) {}
    try { localStorage.setItem('jc-rsvp-sent', '1'); } catch (e) {}
  }

  function onError(err) {
    card.dataset.rsvpStatus = 'error';
    submitBtn.disabled = false;
    errors.textContent = (err && err.server) ||
      "We couldn't send your reply. Please check your connection and try again, or message Joevan or Christine.";
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (card.dataset.rsvpStatus === 'sending') return; // no double submit
    if (!validate()) return;
    var payload = buildPayload();
    card.dataset.rsvpStatus = 'sending';
    submitBtn.disabled = true;
    errors.textContent = '';
    if (!window.WEDDING || !window.WEDDING.RSVP_ENDPOINT || !window.fetch) { onError(); return; }
    send(payload).then(function () { onSent(payload); }, onError);
  });
})();
