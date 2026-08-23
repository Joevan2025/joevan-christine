/* ============================================================================
   Joevan & Christine — RSVP backend (Google Apps Script, V8 runtime)

   Paste this whole file into the Apps Script editor bound to the RSVP Google
   Sheet and deploy it as a Web App — the exact steps are in backend/DEPLOY.md.

   The site POSTs the JSON built by buildPayload() in js/rsvp.js. This script
   validates it, appends one row to the 'RSVPs v2' tab, then emails a receipt
   to accepting guests. The ROW is the source of truth; email is best-effort.
   ============================================================================ */

// ---------------------------------------------------------------------------
// Sheet layout
// ---------------------------------------------------------------------------

// 'RSVPs v2' is a FRESH tab on purpose: the old form's tab has a different
// column layout and holds live historical replies. Writing v2 rows into it
// would scramble that history, so v2 gets its own tab and the old tab stays
// untouched as an archive.
var SHEET_NAME = 'RSVPs v2';
var LOG_NAME = 'Log';
var HEADERS = ['Timestamp (server)', 'First name', 'Last name', 'Email', 'Phone',
  'Attending', 'Guests', 'Companions', 'Message', 'Client timestamp', 'Receipt'];

// ---------------------------------------------------------------------------
// Validation limits (mirror the frontend's)
// ---------------------------------------------------------------------------
var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/; // same regex as js/rsvp.js
var MAX_NAME = 100;     // first name, last name, and each companion
var MAX_EMAIL = 200;
var MAX_PHONE = 40;
var MAX_MESSAGE = 1000;
var MIN_GUESTS = 1;
var MAX_GUESTS = 4;

// ---------------------------------------------------------------------------
// Wedding facts — keep in sync with js/config.js — Apps Script cannot read it
// ---------------------------------------------------------------------------
var WEDDING_DATE_TEXT = 'Saturday, 21 November 2026';
var WEDDING_CITY = 'Bacolod';
var RSVP_DEADLINE_TEXT = '15 October'; // 2026 — the wedding year is implied
var HASHTAG = '#DisTINedtobewithJOE';
var VENUES = [
  { time: '2:00 PM',  label: 'Ceremony',    name: 'Queen of Peace Parish Redemptorist Church', city: 'Bacolod City' },
  { time: '6:00 PM',  label: 'Reception',   name: "Nature's Village Resort, Alfredo Hall",     city: 'Talisay City' },
  { time: '10:00 PM', label: 'After-party', name: 'Rombuhan Restobar',                         city: 'Silay City' }
];
var CONTACTS = [
  { name: 'Joevan',    phone: '+63 951 751 7046', email: 'j.cponce.me92@gmail.com' },
  { name: 'Christine', phone: '+63 943 087 7271', email: 'christinemaesimene@gmail.com' }
];

// Script Properties (Project Settings -> Script properties) override these:
//   REPLY_TO       reply-to address on guest receipts
//   NOTIFY_COUPLE  'true' to email the couple on every RSVP (default: OFF)
//   COUPLE_EMAIL   comma-separated recipients for those notifications
var DEFAULT_REPLY_TO = 'christinemaesimene@gmail.com'; // = CONTACTS[1].email

// ---------------------------------------------------------------------------
// Entry points
// ---------------------------------------------------------------------------

function doPost(e) {
  var raw = e && e.postData ? e.postData.contents : '';
  try {
    var p = parseBody_(e);
    if (p === null) return json_({ ok: false, error: 'We could not read your reply.' });

    // Honeypot: bots fill the invisible "website" field. Pretend success and
    // store nothing — a bot that sees ok:true has no reason to retry.
    if (p.website != null && String(p.website).trim() !== '') return json_({ ok: true });

    var v = validate_(p);
    if (!v.ok) return json_({ ok: false, error: v.error });
    var clean = v.clean;

    var outcome = withLock_(function () {
      var sheet = getSheet_(SHEET_NAME);
      ensureHeader_(sheet);
      if (isDuplicate_(sheet, clean)) return { duplicate: true };
      return { sheet: sheet, row: appendRow_(sheet, clean) };
    });
    if (outcome.duplicate) return json_({ ok: true, duplicate: true });

    // The row above is the source of truth. Everything below is best-effort:
    // a mail failure must NEVER turn this response into ok:false, or the
    // guest would retry and we would record the same reply twice.
    var receipt;
    try {
      receipt = clean.attending === 'Yes' ? sendReceipt_(clean) : 'skipped (declined)';
    } catch (mailErr) {
      logError_('sendReceipt_', mailErr, clean.email);
      receipt = 'failed: ' + String(mailErr && mailErr.message ? mailErr.message : mailErr);
    }
    try {
      outcome.sheet.getRange(outcome.row, HEADERS.indexOf('Receipt') + 1).setValue(receipt);
    } catch (cellErr) {
      logError_('receipt cell', cellErr, 'row ' + outcome.row + ': ' + receipt);
    }

    try {
      notifyCouple_(clean);
    } catch (notifyErr) {
      logError_('notifyCouple_', notifyErr, clean.email);
    }

    return json_({ ok: true });
  } catch (err) {
    logError_('doPost', err, raw);
    return json_({ ok: false, error: 'Something went wrong on our side. Please try again, or message Joevan or Christine.' });
  }
}

// Health check: curl -sL "$URL" -> {"ok":true,"service":"jc-rsvp","version":1}
function doGet() {
  return json_({ ok: true, service: 'jc-rsvp', version: 1 });
}

// ---------------------------------------------------------------------------
// Parsing and validation
// ---------------------------------------------------------------------------

function parseBody_(e) {
  // The site sends a CORS "simple request", so the JSON body arrives typed as
  // text/plain, and curl tests send it as x-www-form-urlencoded. Either way
  // the body ITSELF is always a JSON string, so e.postData.type is
  // meaningless here — we deliberately ignore it and JSON.parse the raw
  // contents.
  try {
    if (!e || !e.postData || !e.postData.contents) return null;
    var p = JSON.parse(e.postData.contents);
    return p && typeof p === 'object' && !Array.isArray(p) ? p : null;
  } catch (err) {
    return null;
  }
}

function validate_(p) {
  var clean = {
    firstName: cap_(p.firstName, MAX_NAME),
    lastName: cap_(p.lastName, MAX_NAME),
    email: cap_(p.email, MAX_EMAIL),
    phone: cap_(p.phone, MAX_PHONE),
    message: cap_(p.message, MAX_MESSAGE),
    clientTimestamp: cap_(p.timestamp, 40)
  };
  if (!clean.firstName) return { ok: false, error: 'Please tell us your first name.' };
  if (!clean.lastName) return { ok: false, error: 'Please tell us your last name.' };
  if (!EMAIL_RE.test(clean.email)) return { ok: false, error: 'That email address does not look right. Please check it and try again.' };
  if (p.attending !== 'Yes' && p.attending !== 'No') return { ok: false, error: 'Please tell us whether you can come.' };
  clean.attending = p.attending;

  var guests = parseInt(p.guests, 10);
  if (clean.attending === 'No') {
    guests = 0; // a decline never brings guests, whatever the payload says
  } else if (isNaN(guests) || guests < MIN_GUESTS || guests > MAX_GUESTS) {
    return { ok: false, error: 'Please choose between ' + MIN_GUESTS + ' and ' + MAX_GUESTS + ' guests.' };
  }
  clean.guests = guests;

  clean.companions = clean.attending === 'No' ? [] : normalizeCompanions_(p.companions);
  // Legacy cached frontends never send `companions` at all — accept that as
  // empty. Only enforce the head-count when the key is actually present.
  if (clean.attending === 'Yes' && ('companions' in p) &&
      clean.companions.length !== clean.guests - 1) {
    return { ok: false, error: "Please tell us each companion's name." };
  }
  return { ok: true, error: '', clean: clean };
}

// Trim, stringify, and cut to a maximum length.
function cap_(v, max) {
  return String(v == null ? '' : v).trim().slice(0, max);
}

// Accepts an array, a comma-joined string, or nothing (legacy frontend).
function normalizeCompanions_(v) {
  var list = [];
  if (Array.isArray(v)) list = v;
  else if (typeof v === 'string') list = v.split(',');
  return list
    .map(function (s) { return cap_(s, MAX_NAME); })
    .filter(function (s) { return s.length > 0; });
}

// ---------------------------------------------------------------------------
// Sheet plumbing
// ---------------------------------------------------------------------------

function getSheet_(name) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName(name) || ss.insertSheet(name);
}

function ensureHeader_(sheet) {
  var first = sheet.getRange(1, 1, 1, HEADERS.length).getValues()[0];
  var same = HEADERS.every(function (h, i) { return first[i] === h; });
  if (same) return;
  sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]).setFontWeight('bold');
  sheet.setFrozenRows(1);
}

// Returns the number of the row it just wrote.
function appendRow_(sheet, clean) {
  sheet.appendRow([
    new Date(),                   // server timestamp — the client clock is not trusted
    clean.firstName,
    clean.lastName,
    clean.email,
    clean.phone,
    clean.attending,
    clean.guests,
    clean.companions.join(', '),
    clean.message,
    clean.clientTimestamp,
    'pending'                     // replaced after the mail attempt in doPost
  ]);
  return sheet.getLastRow();      // safe: we still hold the script lock
}

// Same person (email + first + last, case-insensitive) already recorded in
// the last 25 rows within the past 60 seconds => a double-tap, not a new RSVP.
function isDuplicate_(sheet, clean) {
  var last = sheet.getLastRow();
  var n = Math.min(25, last - 1); // data starts at row 2
  if (n < 1) return false;
  var rows = sheet.getRange(last - n + 1, 1, n, 4).getValues();
  var now = Date.now();
  for (var i = 0; i < rows.length; i++) {
    var ts = rows[i][0];
    var t = ts instanceof Date ? ts.getTime() : new Date(ts).getTime();
    if (!t || Math.abs(now - t) > 60000) continue;
    if (String(rows[i][1]).toLowerCase() === clean.firstName.toLowerCase() &&
        String(rows[i][2]).toLowerCase() === clean.lastName.toLowerCase() &&
        String(rows[i][3]).toLowerCase() === clean.email.toLowerCase()) {
      return true;
    }
  }
  return false;
}

function withLock_(fn) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000); // throws if another request holds the lock too long
  try {
    return fn();
  } finally {
    lock.releaseLock();
  }
}

// ---------------------------------------------------------------------------
// Email
// ---------------------------------------------------------------------------

// Returns the string written into the Receipt column.
function sendReceipt_(clean) {
  // Leave headroom so the couple's own notifications never hit a hard wall.
  if (MailApp.getRemainingDailyQuota() <= 5) return 'skipped (quota)';
  MailApp.sendEmail({
    to: clean.email,
    subject: 'We have your reply — Joevan & Christine · 21 November 2026',
    htmlBody: emailHtml_(clean),
    body: emailText_(clean),    // plain-text fallback for old clients
    name: 'Joevan & Christine',
    replyTo: prop_('REPLY_TO', DEFAULT_REPLY_TO)
  });
  return 'sent';
}

function emailHtml_(clean) {
  // Email clients strip <style> blocks, so EVERY style is inline. No images,
  // no SVG, no external resources — the 2px wisteria rule is the only
  // ornament. All user-supplied strings go through esc_ before interpolation.
  var serif = "'Cormorant Garamond',Georgia,'Times New Roman',serif";
  var sans = "Jost,'Helvetica Neue',Helvetica,Arial,sans-serif";
  var label = 'font-family:' + sans + ';font-size:11px;letter-spacing:2px;text-transform:uppercase;';
  var text = 'font-family:' + sans + ';font-size:14px;line-height:22px;color:#2A2636;';
  var hairline = 'border-top:1px solid #8C8597;';

  var partyLines = [esc_(clean.firstName + ' ' + clean.lastName)]
    .concat(clean.companions.map(esc_))
    .join('<br>');

  var dayRows = VENUES.map(function (v) {
    return '<tr>' +
      '<td valign="top" style="' + label + 'color:#6E4BA0;padding:10px 14px 10px 0;white-space:nowrap;">' + esc_(v.time) + '</td>' +
      '<td style="' + text + 'padding:8px 0;">' +
        '<span style="font-family:' + serif + ';font-style:italic;font-weight:300;font-size:18px;">' + esc_(v.label) + '</span><br>' +
        esc_(v.name) + ' &middot; ' + esc_(v.city) +
      '</td>' +
    '</tr>';
  }).join('');

  var contactLines = CONTACTS.map(function (c) {
    return esc_(c.name) + ' &middot; ' + esc_(c.phone);
  }).join('<br>');

  return '' +
    '<table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" bgcolor="#FBF8F2" style="background-color:#FBF8F2;margin:0;padding:0;">' +
      '<tr><td align="center" style="padding:36px 16px;">' +
        '<table role="presentation" width="600" border="0" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;">' +
          // 2px wisteria top rule — the only ornament
          '<tr><td style="height:2px;line-height:2px;font-size:2px;background-color:#6E4BA0;">&nbsp;</td></tr>' +
          '<tr><td bgcolor="#F3EEE5" style="background-color:#F3EEE5;padding:36px 40px;">' +

            // (1) masthead
            '<p style="margin:0 0 10px;' + label + 'color:#6E4BA0;text-align:center;">The wedding of</p>' +
            '<h1 style="margin:0 0 8px;font-family:' + serif + ';font-style:italic;font-weight:300;font-size:34px;line-height:40px;color:#2A2636;text-align:center;">Joevan &amp; Christine</h1>' +
            '<p style="margin:0 0 28px;' + text + 'text-align:center;">' + WEDDING_DATE_TEXT + ' &middot; ' + WEDDING_CITY + '</p>' +

            '<div style="' + hairline + 'margin:0 0 24px;"></div>' +

            // (2) the reply and the party
            '<h2 style="margin:0 0 14px;font-family:' + serif + ';font-style:italic;font-weight:400;font-size:24px;line-height:30px;color:#2A2636;">We have your reply, ' + esc_(clean.firstName) + '.</h2>' +
            '<p style="margin:0 0 6px;' + label + 'color:#8C8597;">Your party</p>' +
            '<p style="margin:0 0 6px;' + text + '">' + partyLines + '</p>' +
            '<p style="margin:0 0 24px;' + text + 'color:#6E4BA0;">a party of ' + clean.guests + '</p>' +

            '<div style="' + hairline + 'margin:0 0 20px;"></div>' +

            // (3) the day
            '<p style="margin:0 0 6px;' + label + 'color:#8C8597;">The day</p>' +
            '<table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">' + dayRows + '</table>' +

            '<div style="' + hairline + 'margin:0 0 20px;"></div>' +

            // (4) changes + hashtag
            '<p style="margin:0 0 8px;' + text + '">Plans change? Just reply to this email &mdash; kindly before ' + RSVP_DEADLINE_TEXT + '.</p>' +
            '<p style="margin:0 0 24px;font-family:' + sans + ';font-size:13px;letter-spacing:1px;color:#6E4BA0;">' + esc_(HASHTAG) + '</p>' +

            '<div style="' + hairline + 'margin:0 0 18px;"></div>' +

            // (5) contacts
            '<p style="margin:0;font-family:' + sans + ';font-size:12px;line-height:20px;color:#8C8597;">' + contactLines + '</p>' +

          '</td></tr>' +
        '</table>' +
      '</td></tr>' +
    '</table>';
}

// Plain-text mirror of emailHtml_ for clients that prefer it.
function emailText_(clean) {
  var lines = [
    'THE WEDDING OF',
    'Joevan & Christine',
    WEDDING_DATE_TEXT + ' · ' + WEDDING_CITY,
    '',
    'We have your reply, ' + clean.firstName + '.',
    '',
    'Your party:',
    '  ' + clean.firstName + ' ' + clean.lastName
  ];
  clean.companions.forEach(function (c) { lines.push('  ' + c); });
  lines.push('  a party of ' + clean.guests);
  lines.push('');
  lines.push('The day:');
  VENUES.forEach(function (v) {
    lines.push('  ' + v.time + '  ' + v.label + ' — ' + v.name + ', ' + v.city);
  });
  lines.push('');
  lines.push('Plans change? Just reply to this email — kindly before ' + RSVP_DEADLINE_TEXT + '.');
  lines.push(HASHTAG);
  lines.push('');
  CONTACTS.forEach(function (c) { lines.push(c.name + ' — ' + c.phone); });
  return lines.join('\n');
}

// Optional heads-up to the couple. OFF unless the Script Property
// NOTIFY_COUPLE is exactly 'true'.
function notifyCouple_(clean) {
  if (prop_('NOTIFY_COUPLE', '') !== 'true') return;
  var to = prop_('COUPLE_EMAIL', CONTACTS.map(function (c) { return c.email; }).join(','));
  var body = [
    clean.firstName + ' ' + clean.lastName + ' — ' + clean.attending +
      (clean.attending === 'Yes' ? ' (party of ' + clean.guests + ')' : ''),
    'Email: ' + clean.email,
    'Phone: ' + (clean.phone || '—'),
    'Companions: ' + (clean.companions.length ? clean.companions.join(', ') : '—'),
    'Message: ' + (clean.message || '—')
  ].join('\n');
  MailApp.sendEmail({
    to: to,
    subject: 'RSVP: ' + clean.firstName + ' ' + clean.lastName + ' — ' + clean.attending,
    body: body,
    name: 'RSVP backend',
    replyTo: clean.email // so a reply goes straight to the guest
  });
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// Script Property with a fallback; never throws.
function prop_(key, fallback) {
  try {
    var v = PropertiesService.getScriptProperties().getProperty(key);
    return v && String(v).trim() ? String(v).trim() : fallback;
  } catch (err) {
    return fallback;
  }
}

// HTML-escape a user-supplied string before putting it in the email.
function esc_(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Write one line to the Log tab; swallows its own errors so logging can
// never take down a request.
function logError_(stage, err, raw) {
  try {
    getSheet_(LOG_NAME).appendRow([
      new Date().toISOString(),
      stage,
      String(err),
      String(raw == null ? '' : raw).slice(0, 500)
    ]);
  } catch (ignore) {
    // nothing left to do — logging is best-effort by design
  }
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
