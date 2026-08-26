/* ============================================================
   Joevan & Christine — site configuration
   Every fact that might change lives here. Nothing else in
   js/ or index.html should hard-code these values.
   ============================================================ */
window.WEDDING = {
  // Ceremony start, Philippine time (UTC+8)
  WEDDING_DATE: '2026-11-21T14:00:00+08:00',
  // Last day guests can reply (end of day, Philippine time)
  RSVP_DEADLINE: '2026-10-15T23:59:59+08:00',

  // Legacy Google Apps Script web app (the original endpoint). Used only
  // while RSVP_ENDPOINT_V2 below is empty.
  RSVP_ENDPOINT: 'https://script.google.com/macros/s/AKfycbwLFHGng3NKEcJ5C7IBXltWC02_aJ_FnEopGKnEKToxnlWLRgAoZS_tffwAcUvhsJcJ4g/exec',

  // The v2 backend (backend/Code.gs, deployed per backend/DEPLOY.md).
  // Paste the new /exec URL here to switch the form to the v2 transport:
  // readable success/failure in the browser + receipt emails to accepting
  // guests. While this is '', the site keeps the old behaviour above.
  RSVP_ENDPOINT_V2: 'https://script.google.com/macros/s/AKfycbxtyvdUH0iH7mEBBEkm14acLWpwqNtuZ8diMX-90aCSdQDTtMPtxOvU1SFSJPCva0in/exec',

  // The couple's Save-the-Date film (confirmed). A bare video ID or any
  // pasted YouTube link works here (watch?v=, youtu.be/, shorts/, embed/).
  YOUTUBE_ID: 'JW0poKrqtCA',

  HASHTAG: '#DisTINedtobewithJOE',
  SITE_URL: 'https://joevan2025.github.io/joevan-christine', // the live site

  COUPLE: {
    groom: 'Joevan',
    bride: 'Christine',
    groomFull: 'Joevan Ponce',
    brideFull: 'Christine Mae A. Simene'
  },

  CONTACTS: [
    { name: 'Joevan',    phone: '+63 951 751 7046', email: 'j.cponce.me92@gmail.com' },
    { name: 'Christine', phone: '+63 943 087 7271', email: 'christinemaesimene@gmail.com' }
  ],

  // Stops in the order of the day. Coordinates were lifted from the
  // couple's own Google Maps links. Times are Philippine time.
  VENUES: [
    {
      id: 'ceremony',
      time: '2:00 PM',
      start: '2026-11-21T14:00:00+08:00',
      end:   '2026-11-21T15:30:00+08:00',
      label: 'Ceremony',
      name: 'Queen of Peace Parish Redemptorist Church',
      address: 'B.S. Aquino Drive, Bacolod City, Negros Occidental',
      city: 'Bacolod',
      lat: 10.6806389, lon: 122.9591336,
      // Map pin: the church's own Google listing (verified render). The
      // lat/lon above stay on the Redemptorist parking lot for Waze, which is
      // where guests actually drive to.
      ftid: '0x33aed1001540ee07:0x3ae0f12cbbac8cc7',
      mapLat: 10.6802867, mapLon: 122.9593472,
      mapsUrl: 'https://maps.google.com/maps/place/Redemptorist+Parking+Lot/@10.6806307,122.9567142,17.2z/data=!4m6!3m5!1s0x33aed10051c9b70b:0xb2f481be3bb459aa!8m2!3d10.6806389!4d122.9591336!16s%2Fg%2F11v_2sgfhg?hl=en',
      notes: ['Please keep phones silent inside the church', 'Free parking at the Redemptorist lot']
    },
    {
      id: 'reception',
      time: '6:00 PM',
      start: '2026-11-21T18:00:00+08:00',
      end:   '2026-11-21T22:00:00+08:00',
      label: 'Reception',
      name: "Nature's Village Resort, Alfredo Hall",
      address: 'Nature’s Village Resort, Talisay City, Negros Occidental',
      city: 'Talisay',
      lat: 10.726085, lon: 122.964096,
      ftid: '0x33aed6c84a5dd153:0x177631c61f787610',
      mapsUrl: "https://maps.google.com/maps/place/Nature's+Village+Resort/@10.726085,122.9615157,17z/data=!3m1!4b1!4m9!3m8!1s0x33aed6c84a5dd153:0x177631c61f787610!5m2!4m1!1i2!8m2!3d10.726085!4d122.964096!16s%2Fg%2F1tzzs0sz",
      notes: ['Closed function hall', 'Free parking on the resort grounds']
    },
    {
      id: 'afterparty',
      time: '10:00 PM',
      start: '2026-11-21T22:00:00+08:00',
      end:   '2026-11-22T01:00:00+08:00',
      label: 'After-party',
      // TODO (couple): Google Maps lists this place as "ROMBOHAN Restobar". Confirm the spelling.
      name: 'Rombuhan Restobar',
      address: 'Silay City, Negros Occidental',
      city: 'Silay',
      lat: 10.788289, lon: 122.9709472,
      ftid: '0x33aed6199bb083c7:0xa8769563f0d7ae60',
      mapsUrl: 'https://maps.google.com/maps/place/ROMBOHAN+Restobar/@10.788289,122.9683669,17z/data=!3m1!4b1!4m6!3m5!1s0x33aed6199bb083c7:0xa8769563f0d7ae60!8m2!3d10.788289!4d122.9709472!16s%2Fg%2F11clwjj9t0',
      notes: ['Dancing and celebration until late']
    }
  ],

  // Approximate drive times between stops, shown as "approx." on the page.
  // TODO (couple): confirm or set to null to hide.
  DRIVE_MINUTES: { ceremonyToReception: 25, receptionToAfterparty: 15 },

  // Music: drop MP3s into audio/ with these file names, then type the
  // title and artist here. A missing file shows "coming soon".
  TRACKS: [
    { moment: 'Processional',     title: '', artist: '', file: 'audio/01-processional.mp3' },
    { moment: "Bride's entrance", title: '', artist: '', file: 'audio/02-bride-entrance.mp3' },
    { moment: 'First dance',      title: '', artist: '', file: 'audio/03-first-dance.mp3' },
    { moment: 'Last song',        title: '', artist: '', file: 'audio/04-last-song.mp3' }
  ],

  // Gallery: images/prenup-01.jpg … prenup-06.jpg. Slots 1, 3, 6 are tall
  // (portrait), 2, 4, 5 are wide (landscape). Lower this number to show
  // fewer slots.
  GALLERY_COUNT: 6
};
