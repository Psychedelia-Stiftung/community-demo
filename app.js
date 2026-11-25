/* Community MVP, round 3. Plain JS, no library.
   One frame for every screen: a bottom bar (Start, Gruppen, Nachrichten, Profil), one group template with tabs,
   one post card. Light follows the hour across the whole app.
   Round 3: the app opens on Start, already inside as a member in week 2. Start = the field in Castricum with the
   faces of your groups (a two-second opening, only when the app opens), what is happening now as pictures that
   open their place, and your groups as cards you swipe. The invitation lives in Demo-Einstellungen.
   State lives in localStorage per viewer and device (key below); everything renders without it. */
(() => {
  'use strict';

  // ------------------------------------------------------------------ people (invented) and drawn faces
  const PEOPLE = {
    clara: ['Clara', '#c4906b', '#2e221c', 'bun', '#2f4a5c', '#c9d4d3'],
    joost: ['Joost', '#e3bc9c', '#7a5a3c', 'short', '#4f5d4c', '#d8cfbd'],
    jonas: ['Jonas', '#e0b28f', '#5f4130', 'short', '#3d4b5e', '#b8c5cb'],
    marta: ['Marta', '#cf9d79', '#2b201b', 'curly', '#9b6b4d', '#c6d0ce'],
    tomas: ['Tomás', '#c38e68', '#28201b', 'short', '#566b5b', '#d4cab5'],
    ines: ['Ines', '#efcfb6', '#8a4a2c', 'bob', '#2b3a4f', '#cdd8da'],
    pieter: ['Pieter', '#e8c4a9', '#9b978f', 'short', '#5d6f7f', '#dbd2c0'],
    aiko: ['Aiko', '#e4c09d', '#1c1919', 'bob', '#b9ab90', '#b3c1c3'],
    sam: ['Sam', '#7a4e35', '#1d1613', 'buzz', '#d2c5ab', '#c4cecc'],
    hanna: ['Hanna', '#ecc8ab', '#5a3b26', 'long', '#7b8b78', '#d3c9b4'],
    malik: ['Malik', '#5c3a28', '#16100d', 'buzz', '#3f566a', '#d8cfbe'],
    elif: ['Elif', '#d1a37f', '#291d18', 'long', '#a07f60', '#c2ced0'],
    ruben: ['Ruben', '#b88968', '#3a2920', 'curly', '#4d5f50', '#dcd3c2'],
    greta: ['Greta', '#f0d2bd', '#d8d3cb', 'short', '#6a7d8f', '#cad2d0'],
    ayla: ['Ayla', '#c99470', '#231a16', 'long', '#6a2a26', '#dcc4b9'],
    ben: ['Ben', '#e6c1a2', '#5a4632', 'short', '#3e4a3c', '#cdb9ae'],
    sophie: ['Sophie', '#f0d0b8', '#b98a4e', 'bob', '#8a5a4a', '#d8c9bf'],
    mehmet: ['Mehmet', '#b98463', '#1c1512', 'short', '#2f2a2a', '#cbb4a8'],
    johanna: ['Johanna', '#efcdb3', '#6e4a2e', 'bun', '#a5776a', '#dccbc0'],
    leon: ['Leon', '#d9a985', '#2a211c', 'curly', '#4a3b36', '#c9b6aa'],
    frieda: ['Frieda', '#f2d6c2', '#e0d6c8', 'short', '#6b4a4a', '#d6c6bc'],
    karim: ['Karim', '#8f5e42', '#14100d', 'buzz', '#7a5a46', '#cdb8ab'],
    theresa: ['Theresa', '#e9c7ab', '#3e2c22', 'bob', '#1d4a3e', '#c8d0c4'],
  };
  const ROLE = { clara: 'Facilitatorin', joost: 'Team', ayla: 'Kula-Team', theresa: 'Moderation' };

  function hairBack(st, h) {
    if (st === 'long') return `<path d="M30,46 C28,24 72,24 70,46 L74,86 C62,92 38,92 26,86 Z" fill="${h}"/>`;
    if (st === 'bob') return `<path d="M31,44 C29,22 71,22 69,44 L71,64 C62,68 38,68 29,64 Z" fill="${h}"/>`;
    if (st === 'curly') return `<g fill="${h}"><circle cx="34" cy="34" r="12"/><circle cx="50" cy="26" r="14"/><circle cx="66" cy="34" r="12"/><circle cx="31" cy="50" r="10"/><circle cx="69" cy="50" r="10"/></g>`;
    return '';
  }
  function hairTop(st, h) {
    if (st === 'buzz') return `<path d="M35,40 C35,24 65,24 65,40 C60,33 40,33 35,40 Z" fill="${h}" opacity="0.85"/>`;
    if (st === 'bun') return `<circle cx="50" cy="19" r="8" fill="${h}"/><path d="M34,42 C33,22 67,22 66,42 C61,33 39,33 34,42 Z" fill="${h}"/>`;
    if (st === 'curly') return `<path d="M35,38 C37,26 63,26 65,38 C58,32 42,32 35,38 Z" fill="${h}"/>`;
    return `<path d="M34,42 C33,22 67,22 66,42 C60,34 40,34 34,42 Z" fill="${h}"/>`;
  }
  function face(key, size) {
    if (key === 'me') return meFace(size);
    if (key === 'stiftung' || key === 'team') return `<span class="face mark" style="width: ${size}px; height: ${size}px" aria-hidden="true"><img src="img/tree.png" alt="" width="${Math.round(size * 0.62)}"></span>`;
    const [, skin, hair, st, cloth, bg] = PEOPLE[key];
    return `<svg class="face" width="${size}" height="${size}" viewBox="0 0 100 100" aria-hidden="true" focusable="false">` +
      `<rect width="100" height="100" fill="${bg}"/><g filter="url(#pfSoft)">${hairBack(st, hair)}` +
      `<ellipse cx="50" cy="104" rx="40" ry="27" fill="${cloth}"/><rect x="43" y="58" width="14" height="18" rx="5" fill="${skin}"/>` +
      `<ellipse cx="50" cy="45" rx="15" ry="18.5" fill="${skin}"/>${hairTop(st, hair)}</g><rect width="100" height="100" fill="url(#pfLight)"/></svg>`;
  }
  // the initial stands in for a photo; its size snaps to the type scale
  const MONO = (s) => (s <= 30 ? 14 : s <= 44 ? 16 : s <= 60 ? 20 : 26);
  function meFace(size) {
    if (S.photo) return `<img class="face" src="${S.photo}" width="${size}" height="${size}" alt="">`;
    const ch = (S.name || 'D').trim().charAt(0).toUpperCase() || 'D';
    return `<span class="face mono" aria-hidden="true" style="width: ${size}px; height: ${size}px; font-size: ${MONO(size)}px">${esc(ch)}</span>`;
  }
  const nameOf = (k) => (k === 'me' ? 'Du' : k === 'stiftung' ? 'Psychedelia-Stiftung' : k === 'team' ? 'Das Team' : PEOPLE[k][0]);
  const stack = (keys, size) => `<span class="stack">${keys.map((k) => face(k, size)).join('')}</span>`;

  // ------------------------------------------------------------------ icons
  const sv = (w, body, extra = '') => `<svg width="${w}" height="${w}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"${extra}>${body}</svg>`;
  const I = {
    back: sv(22, '<path d="M15 5l-7 7 7 7"/>', ' stroke-width="2.2"'),
    chev: sv(16, '<path d="M9 5l7 7-7 7"/>', ' stroke-width="2"'),
    check: sv(15, '<path d="M5 12.5l4.5 4.5L19 7.5"/>', ' stroke-width="2.8"'),
    send: sv(20, '<path d="M12 19V5M5.5 11.5L12 5l6.5 6.5"/>', ' stroke-width="2.4"'),
    close: sv(20, '<path d="M6 6l12 12M18 6L6 18"/>', ' stroke-width="2.2"'),
    camera: sv(18, '<rect x="3" y="6" width="18" height="13" rx="3"/><circle cx="12" cy="12.5" r="3.4"/><path d="M9 6l1.2-2h3.6L15 6"/>', ' stroke-width="1.8"'),
    home: sv(24, '<path d="M4 10.8L12 4l8 6.8V19a1.5 1.5 0 0 1-1.5 1.5H15v-6H9v6H5.5A1.5 1.5 0 0 1 4 19z"/>'),
    groups: sv(24, '<circle cx="9" cy="8.6" r="3.3"/><path d="M3.2 19.5c.7-3.4 3-5.4 5.8-5.4s5.1 2 5.8 5.4"/><circle cx="16.8" cy="9.6" r="2.6"/><path d="M15.6 14.3c2.5-.2 4.5 1.5 5.2 4.6"/>'),
    chat: sv(24, '<path d="M5 4.8h14a1.6 1.6 0 0 1 1.6 1.6v9a1.6 1.6 0 0 1-1.6 1.6h-8.6L6 20.4V17H5a1.6 1.6 0 0 1-1.6-1.6v-9A1.6 1.6 0 0 1 5 4.8z"/>'),
    person: sv(24, '<circle cx="12" cy="8.4" r="3.9"/><path d="M4.4 20.2c.9-4 3.9-6.1 7.6-6.1s6.7 2.1 7.6 6.1"/>'),
    pin: '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M14.6 2.6l6.8 6.8-2.5 1-3.7 3.7.5 4.7-1.7 1.7-4.4-4.4-5 5-1.5-1.5 5-5-4.4-4.4 1.7-1.7 4.7.5 3.7-3.7z"/></svg>',
    lock: '<svg width="10" height="11" viewBox="0 0 10 12" fill="currentColor" aria-hidden="true"><rect x="0.5" y="5" width="9" height="6.5" rx="1.6"/><path d="M2.5 5V3.6a2.5 2.5 0 0 1 5 0V5" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>',
  };
  const LABEL = { g: 'Gespräch', r: 'Reise', t: 'Treffen' };

  // ------------------------------------------------------------------ state
  const KEY = 'community-mvp-v2'; // round 3: a new key, so every viewer gets the new first open
  const PHOTO_KEY = 'community-mvp-photo-';
  function fresh() {
    return {
      v: 2, joined: true, name: 'Lena', email: '', photo: null, stage: 'w2', light: 'auto',
      member: { retreat: true, kula: true, forum: true },
      start: { retreat: 'r', kula: 't', forum: 'g' }, after6: true,
      posts: {}, replies: {}, answers: {}, rsvp: {},
      todo: { intro: false },
      photos: { retreat: [], kula: [] },
      prof: { dm: 'fuenf', digest: 'woche', replies: true, meets: true, news: false },
      dms: { team: [], jonas: [], marta: [] }, seen: {}, readAll: false,
    };
  }
  function load() {
    const base = fresh();
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) {
        // first open of round 3 on this device: clear what rounds 1 and 2 left behind (state and shared photos)
        Object.keys(localStorage).filter((k) => k.startsWith('community-mvp') && k !== KEY).forEach((k) => localStorage.removeItem(k));
        return base;
      }
      const s = JSON.parse(raw);
      if (!s || s.v !== 2) return base;
      const out = Object.assign(base, s, {
        member: Object.assign(base.member, s.member), start: Object.assign(base.start, s.start),
        todo: Object.assign(base.todo, s.todo), prof: Object.assign(base.prof, s.prof),
        photos: Object.assign(base.photos, s.photos), dms: Object.assign(base.dms, s.dms), seen: Object.assign(base.seen, s.seen),
      });
      // round one kept help messages in their own list; they now live in the chat with the team
      if (Array.isArray(s.help) && s.help.length && !(s.dms && s.dms.team && s.dms.team.length)) out.dms.team = s.help.map((h) => ({ text: h.text, ts: h.ts }));
      delete out.help;
      if (!['g', 't'].includes(out.start.kula)) out.start.kula = 't';
      if (!['g', 't'].includes(out.start.forum)) out.start.forum = 'g';
      return out;
    } catch (e) { return base; }
  }
  let S = load();
  const mem = {}; // photo data kept in memory when the device refuses to store it
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(S)); return true; } catch (e) { return false; }
  }
  function photoSrc(p) {
    if (mem[p.id]) return mem[p.id];
    try { return localStorage.getItem(PHOTO_KEY + p.id) || ''; } catch (e) { return ''; }
  }
  function resetDemo() {
    try {
      Object.keys(localStorage).filter((k) => k.startsWith('community-mvp')).forEach((k) => localStorage.removeItem(k));
    } catch (e) { /* nothing stored */ }
    S = fresh();
    Object.keys(ui.view).forEach((k) => delete ui.view[k]);
    ui.inv = 'cover'; ui.reply = null; ui.typing = null; ui.invDraft = null;
  }

  const ui = { view: {}, inv: 'cover', reply: null, typing: null, pick: null, pending: null, setup: 'retreat', newId: null, invDraft: null, back: 'gruppen', last: null, pendingNav: null, opening: false };
  const RM = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };

  // ------------------------------------------------------------------ helpers
  const $ = (sel, root = document) => root.querySelector(sel);
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  const nm = () => esc((S.name || '').trim() || 'Lena');
  const fill = (s) => s.replace(/\{name\}/g, nm());
  function hour() { return new Date().getHours(); }
  function isNight() { if (S.light === 'day') return false; if (S.light === 'night') return true; const h = hour(); return h < 7 || h >= 19; }
  function timeLabel(ts) {
    const d = new Date(ts), now = Date.now();
    if (now - ts < 90 * 1000) return 'gerade eben';
    const hm = d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
    return new Date(now).toDateString() === d.toDateString() ? `heute um ${hm}` : d.toLocaleDateString('de-DE', { day: 'numeric', month: 'long' });
  }
  const uid = () => Math.random().toString(36).slice(2, 9);
  const T1 = () => S.stage === 't1';
  const W7 = () => S.stage === 'w7';

  // ------------------------------------------------------------------ groups
  const G = {
    retreat: {
      name: 'October Practitioners 2026', short: 'October Practitioners', op: 'Psychedelia Retreats', count: 15,
      about: 'Die Gruppe eures Retreats in Castricum. Für die vier Tage und die Wochen danach.',
      admins: ['clara', 'joost'], adminLine: 'Clara und Joost führen die Gruppe für Psychedelia Retreats.',
    },
    kula: {
      name: 'Kula', short: 'Kula', op: 'Kula', count: 12,
      about: 'Einmal im Monat ein Abend in der Werkstatt in Wedding, dazwischen dieses Gespräch.',
      admins: ['ayla'], adminLine: 'Ayla führt die Gruppe für Kula.',
    },
    forum: {
      name: 'Offenes Forum', short: 'Offenes Forum', op: 'die Stiftung', count: 86,
      about: 'Für alle in der Community. Jeden Monat ein Thema und ein Online-Abend. Lesen reicht auch.',
      admins: ['theresa'], adminLine: 'Theresa moderiert das Forum für die Stiftung.',
    },
  };
  const GIDS = ['retreat', 'kula', 'forum'];
  const FACES = { retreat: ['clara', 'jonas', 'marta', 'tomas', 'aiko'], kula: ['ayla', 'ben', 'sophie', 'johanna', 'mehmet'], forum: ['theresa', 'greta', 'malik', 'aiko', 'pieter'] };
  const UNREAD = { stiftung: true, retreat: true, kula: true, forum: false };

  function tabsFor(g) { return g === 'retreat' && !W7() ? ['g', 'r', 't'] : ['g', 't']; }
  function startView(g) {
    const v = S.start[g];
    if (g === 'retreat' && W7() && v === 'r') return S.after6 ? 't' : 'g';
    return tabsFor(g).includes(v) ? v : 'g';
  }
  const threadKey = (g) => (g === 'retreat' && T1() ? 'retreat-t1' : g);
  function status(g) {
    if (g === 'retreat') return T1() ? 'Tag 1 von 4, in Castricum' : W7() ? 'Einmal im Monat, online' : 'Woche 2 von 6';
    if (g === 'kula') return 'Kula, Berlin';
    return 'Für alle in der Community';
  }
  function rowStatus(g) {
    if (g === 'retreat') return T1() ? 'Tag 1 von 4' : W7() ? 'Einmal im Monat' : 'Woche 2 von 6';
    if (g === 'kula') return 'Kula-Abend am Freitag, 20. November';
    if (g === 'forum') return 'Thema im November: Erzählen';
    return 'Der Newsletter vom Mittwoch ist da';
  }
  function coverImg(g) {
    if (g === 'retreat') {
      return isNight()
        ? '<img src="img/field-dusk.jpg" width="910" height="610" alt="Die Wiese hinter dem Haus in Castricum in der Dämmerung" style="object-position: 50% 22%">'
        : '<img src="img/field-gold.jpg" width="1200" height="789" alt="Die Wiese hinter dem Haus in Castricum bei Sonnenuntergang" style="object-position: 50% 34%">';
    }
    if (g === 'kula') return '<img src="img/kula-cover.svg" alt="Gezeichnet: der Raum in der Werkstatt am Abend, Papierlampe, Stühle im Kreis" style="object-position: 50% 34%">';
    return '<img src="img/forum-cover.svg" alt="Gezeichnet: Schreibtischlampe und offenes Notizbuch am Fenster in der Dämmerung" style="object-position: 50% 42%">';
  }
  function thumb(g) {
    if (g === 'stiftung') return '<span class="thumb mark"><img src="img/tree.png" alt=""></span>';
    return `<span class="thumb">${coverImg(g).replace(/ alt="[^"]*"/, ' alt=""')}</span>`;
  }

  // ------------------------------------------------------------------ conversations (seeded; {name} is the viewer)
  const Q1 = 'What do you hope to take home from these four days?';
  const Q2 = 'Which moment from the four days keeps coming back to you?';
  const Q7 = 'What has stayed with you since October?';
  const SEED = {
    retreat: [
      { id: 'r1', who: 'me', when: 'Mittwoch', lang: 'en', text: 'Back at work. The first thing I noticed is how fast everyone talks. Did anyone else come home to that?' },
      { id: 'r2', parent: 'r1', who: 'tomas', when: 'Mittwoch', lang: 'en', text: 'Yes. I wait a breath before I answer now. My team thinks I am tired.' },
      { id: 'r3', parent: 'r1', who: 'clara', when: 'heute um 21:48', lang: 'en', text: '{name}, stay with the speed you noticed. Bring it on Thursday, we can start there.' },
      { id: 'r4', who: 'marta', when: 'Freitag', lang: 'en', text: 'Finally got the photos off my camera. The oaks behind the house, and the old bell.', photos: ['oaks', 'bell'] },
      { id: 'r5', who: 'jonas', when: 'heute um 20:05', lang: 'en', text: 'Sitting for someone is harder at home than it was in the dunes.' },
    ],
    'retreat-t1': [],
    kula: [
      { id: 'k2', parent: 'k1', who: 'ben', when: 'Dienstag', text: 'Ich bringe Suppe mit. Wer bringt Brot?' },
      { id: 'k3', parent: 'k1', who: 'sophie', when: 'heute um 19:12', text: 'Brot kommt von mir. Und Kerzen, falls der Strom wieder ausfällt.' },
      { id: 'k4', who: 'mehmet', when: 'Mittwoch', text: 'Ich schaffe es erst um halb acht. Fangt ohne mich an.' },
      { id: 'k5', who: 'johanna', when: 'heute um 21:05', text: 'Danke noch für den letzten Abend. Ich habe lange an das Gespräch über Pausen gedacht.' },
    ],
    forum: [
      { id: 'f1', parent: 'fq', who: 'greta', when: 'Montag', text: 'Ich erzähle inzwischen weniger und frage mehr zurück.' },
      { id: 'f2', who: 'malik', when: 'Dienstag', text: 'Meiner Schwester habe ich einen Brief geschrieben. Reden ging nicht.' },
      { id: 'f3', parent: 'f2', who: 'theresa', when: 'Dienstag', text: 'Malik, magst du erzählen, wie sie geantwortet hat?' },
      { id: 'f4', who: 'aiko', when: 'heute um 18:40', text: 'Im Newsletter vom Mittwoch steht etwas dazu. Hat das jemand gelesen?' },
    ],
  };
  const SEED_W7 = [{ id: 'q7a', parent: 'q7', who: 'jonas', when: '12. Dezember', lang: 'en', text: 'The quiet mornings. I kept them.' }];
  function seedFor(key) { return key === 'retreat' && W7() ? SEED.retreat.concat(SEED_W7) : SEED[key] || []; }
  function pinned(g) {
    if (g === 'retreat') {
      if (T1()) return { id: 'w1', who: 'clara', when: 'heute um 8:40', label: 'Angeheftet', lang: 'en', text: 'Welcome, {name}. Before we open the circle, tell us in one sentence why you came.' };
      if (W7()) return { id: 'q7', who: 'clara', when: '11. Dezember', label: 'Frage im Dezember', lang: 'en', text: Q7 };
      return { id: 'q2', who: 'clara', when: 'Montag', label: 'Frage der Woche', lang: 'en', text: Q2, ask: 'retreat-q' };
    }
    if (g === 'kula') return { id: 'k1', who: 'ayla', when: 'Dienstag', label: 'Angeheftet', text: 'Was bringst du am Freitag mit? Ein Gericht, ein Lied oder eine Frage.' };
    return { id: 'fq', who: 'theresa', when: '2. November', label: 'Thema im November', text: 'Wie erzählst du von etwas, das dir wichtig war?' };
  }
  // answers to the weekly question are read in Reise, chosen per answer: your Five, the whole circle, or Clara only
  const ANS_W2 = [
    { id: 'a1', who: 'jonas', when: 'heute um 20:05', lang: 'en', text: 'The walk back across the field on the last night. Nobody said anything, and nobody needed to.' },
    { id: 'a2', who: 'aiko', when: 'Dienstag', lang: 'en', text: 'Lying in the grass behind the house, hearing the field go quiet.' },
    { id: 'a3', who: 'tomas', when: 'Montag', lang: 'en', text: 'Sitting in the opposite chair on Wednesday. Same room, different person.' },
  ];
  const ANS_MORE = [
    { id: 'a4', who: 'pieter', when: 'Montag', lang: 'en', text: 'The bell before breakfast.' },
    { id: 'a5', who: 'hanna', when: 'Montag', lang: 'en', text: 'Nobody asking me what I do for a living.' },
  ];
  const AUD = { fuenf: 'für deine Fünf', kreis: 'für den ganzen Kreis', clara: 'nur für Clara', alle: 'für alle in der Gruppe' };

  const STIFTUNG_POSTS = [
    { id: 's1', who: 'stiftung', when: 'Mittwoch', text: 'Der Newsletter vom Mittwoch ist da. Wer ihn bestellt hat, findet ihn im Postfach. Bestellen kannst du ihn im Profil unter E-Mails.' },
    { id: 's2', who: 'stiftung', when: '2. November', text: 'Neu in der Community: das Offene Forum. Jeden Monat ein Thema und ein Online-Abend, offen für alle.' },
  ];

  // ------------------------------------------------------------------ the post card, the same everywhere
  function photosHTML(list) {
    const ALT = { oaks: 'Eichen hinter dem Haus im Gegenlicht', bell: 'Die alte Glocke auf der Veranda' };
    return `<div class="post-photos">${list.map((p) => `<img src="img/${p}.jpg" alt="${ALT[p] || ''}" loading="lazy">`).join('')}</div>`;
  }
  function postCard(m, opt = {}) {
    const when = m.ts ? timeLabel(m.ts) : m.when;
    const meta = m.meta || [m.who !== 'me' ? ROLE[m.who] : '', when].filter(Boolean).join(', ');
    const lang = m.lang ? ` lang="${m.lang}"` : '';
    return `<article class="post${opt.reply ? ' is-reply' : ''}${m.label ? ' is-pinned' : ''}${m.id === ui.newId ? ' is-new' : ''}" id="m-${m.id}">
${m.label ? `<p class="pin">${I.pin}${esc(m.label)}</p>` : ''}<div class="post-head">${face(m.who, opt.reply ? 28 : 36)}<p class="post-meta"><b>${esc(nameOf(m.who))}</b> <span>${esc(meta)}</span></p></div>
<p class="post-text"${lang}>${fill(esc(m.text))}</p>${m.photos ? photosHTML(m.photos) : ''}${opt.actions || ''}
</article>`;
  }
  const actReply = (m, count) => `<div class="post-act"><button type="button" class="act" data-act="reply" data-id="${m.id}" data-who="${esc(nameOf(m.who))}"${ui.reply && ui.reply.id === m.id ? ' aria-expanded="true"' : ''}>Antworten</button>${count ? `<span class="count">${count} ${count === 1 ? 'Antwort' : 'Antworten'}</span>` : ''}</div>`;
  function replyForm(g, m) {
    return `<form class="reply-form" data-form="post" data-g="${g}" data-parent="${m.id}">${meFace(28)}
<label class="sr" for="rep">Deine Antwort an ${esc(nameOf(m.who))}</label><textarea id="rep" name="text" rows="1" placeholder="Antwort an ${esc(nameOf(m.who))}" enterkeyhint="send"></textarea>
<button type="submit" class="send" aria-label="Antwort senden" disabled>${I.send}</button></form>`;
  }

  // ------------------------------------------------------------------ the frame: bottom bar
  const CHAT_IDS = () => (T1() ? ['team'] : ['team', 'jonas', 'marta']);
  const unreadChat = (id) => id === 'jonas' && !S.seen['chat-jonas'];
  function tabOf(r) {
    if (r === 'start' || r === 'fuerdich') return 'start';
    if (r === 'nachrichten' || CHATS[r]) return 'nachrichten';
    if (r === 'profil') return 'profil';
    return 'gruppen';
  }
  function bar(r) {
    const t = tabOf(r);
    const dm = CHAT_IDS().some(unreadChat);
    const items = [['start', 'Start', I.home], ['gruppen', 'Gruppen', I.groups], ['nachrichten', 'Nachrichten', I.chat], ['profil', 'Profil', I.person]];
    return `<nav class="tabbar" aria-label="Hauptmenü">${items.map(([h, l, ic]) => `<a href="#${h}" class="tab"${t === h ? ' aria-current="page"' : ''}><span class="tab-ic">${ic}${h === 'nachrichten' && dm ? '<span class="tab-dot" aria-hidden="true"></span>' : ''}</span><span class="tab-l">${l}</span>${h === 'nachrichten' && dm ? '<span class="sr">, neue Nachricht</span>' : ''}</a>`).join('')}</nav>`;
  }
  const pageHead = (href, label, title) => `<header class="pbar"><a class="back" href="#${href}">${I.back}${label}</a></header>${title ? `<h1 class="page-h">${title}</h1>` : ''}`;

  // ------------------------------------------------------------------ gatherings
  function meetNext(g) {
    if (g === 'retreat') {
      if (T1()) return { when: 'Heute, 11:00', what: 'Eröffnungskreis im großen Raum', who: ['clara', 'marta', 'tomas', 'ines'], whoText: 'Clara, Marta, Tomás und Ines sind schon da', status: 'Du bist für das Retreat angemeldet.' };
      return {
        when: W7() ? '7. Januar, 19:30' : 'Donnerstag, 19:30', what: W7() ? 'Monatskreis mit Clara, online' : 'Wochenkreis mit Clara, online',
        who: ['clara', 'jonas', 'marta', 'tomas'], others: 8, key: 'retreat-' + S.stage,
        yes: W7() ? 'Du kommst. Clara schickt dir den Link am 7. Januar um 19:00.' : 'Du kommst. Clara schickt dir den Link am Donnerstag um 19:00.',
        no: W7() ? 'Diesmal nicht. Der nächste Monatskreis ist im Februar.' : 'Diesmal nicht. Der nächste Kreis ist am Donnerstag, 19. November.',
      };
    }
    if (g === 'kula') return { when: 'Freitag, 20. November', what: 'Kula-Abend um 19:00 in der Werkstatt, Wedding', who: ['ayla', 'ben', 'sophie', 'johanna'], others: 5, key: 'kula', yes: 'Du kommst. Ayla sieht es und freut sich.', no: 'Diesmal nicht. Der nächste Kula-Abend ist im Dezember.' };
    return { when: 'Mittwoch, 18. November', what: 'Online-Abend um 19:00: Fragen an die Forschung', who: ['theresa', 'greta', 'pieter', 'karim'], others: 23, key: 'forum', yes: 'Du kommst. Den Link schicken wir dir am Mittwoch um 18:00.', no: 'Diesmal nicht. Die Aufzeichnung kommt danach hierher.' };
  }
  function meetCard(g, onStart) {
    const n = meetNext(g);
    const going = n.key && S.rsvp[n.key] === 'yes';
    const who = going ? n.who.concat('me') : n.who;
    const names = n.who.slice(0, 2).map((k) => PEOPLE[k][0]);
    const whoText = n.whoText || `${going ? 'Du, ' : ''}${names[0]}, ${names[1]} und ${n.others + n.who.length - 2} andere kommen`;
    let act;
    if (!n.key) act = `<p class="meet-status">${n.status}</p>`;
    else if (!S.rsvp[n.key]) act = `<div class="rsvp"><button type="button" class="btn btn-lamp" data-act="rsvp" data-key="${n.key}" data-v="yes">Ich komme</button><button type="button" class="btn btn-ghost" data-act="rsvp" data-key="${n.key}" data-v="no">Diesmal nicht</button></div>`;
    else act = `<div class="rsvp-done" role="status"><span class="ok">${S.rsvp[n.key] === 'yes' ? I.check : I.close}</span><span class="t">${S.rsvp[n.key] === 'yes' ? n.yes : n.no}</span><button type="button" class="link" data-act="rsvp" data-key="${n.key}" data-v="">Ändern</button></div>`;
    const label = onStart ? `<b>Als Nächstes</b> in ${esc(G[g].short)}` : '<b>Nächstes Treffen</b>';
    return `<section class="card meet" id="meet-${g}" aria-label="${onStart ? 'Als Nächstes' : 'Nächstes Treffen'}"><p class="card-label">${label}</p>
<h2 class="meet-when">${n.when}</h2><p class="meet-what">${n.what}</p>
<div class="meet-who">${stack(who, 28)}<span>${whoText}</span></div>${act}</section>`;
  }
  const PAST = {
    retreat: () => {
      if (T1()) return { head: 'Diese Tage', items: [{ what: 'Die vier Tage in Castricum', when: 'Heute ist Tag 1 von 4', share: true }] };
      return {
        head: 'Frühere Treffen',
        items: [
          { what: 'Wochenkreis mit Clara', when: W7() ? 'Donnerstag, 10. Dezember, online' : 'Donnerstag, 5. November, online' },
          { what: 'Die vier Tage in Castricum', when: '26. bis 29. Oktober', share: true },
        ],
      };
    },
    kula: () => ({ head: 'Frühere Treffen', items: [{ what: 'Kula-Abend in der Werkstatt', when: 'Freitag, 23. Oktober', share: true }] }),
    forum: () => ({
      head: 'Frühere Abende',
      note: 'Die Aufzeichnungen bleiben hier, für alle in der Community.',
      items: [
        { what: 'Was eine Studie zeigen kann und was nicht', when: '21. Oktober, online' },
        { what: 'Wie man eine Gruppe gut leitet', when: '23. September, online' },
        { what: 'Fragen zur Stiftung', when: '26. August, online' },
      ],
    }),
  };
  const ALBUM = {
    'retreat-t1': [
      { src: 'chandelier', alt: 'Der Leuchter unter dem Reetdach im großen Raum, geteilt von Clara' },
      { src: 'labyrinth', alt: 'Ein leerer Holzstuhl am Schild zum Labyrinth' },
      { src: 'circle', alt: 'Die roten Sitzkissen im Kreis im großen Raum' },
    ],
    retreat: [
      { src: 'oaks', alt: 'Eichen hinter dem Haus im Gegenlicht, von Marta' },
      { src: 'bell', alt: 'Die alte Glocke Elisabeth auf der Veranda, von Marta' },
      { src: 'field-dusk', alt: 'Die Wiese in der Dämmerung, von Tomás' },
      { src: 'labyrinth', alt: 'Ein leerer Holzstuhl am Schild zum Labyrinth, von Marta' },
      { src: 'chandelier', alt: 'Der Leuchter unter dem Reetdach, von Marta' },
      { src: 'circle', alt: 'Die roten Sitzkissen im Kreis im großen Raum' },
    ],
    kula: [
      { svg: 'kula-bowls', alt: 'Gezeichnet: der lange Tisch von oben, Schalen mit Suppe, von Sophie' },
      { svg: 'kula-coats', alt: 'Gezeichnet: Mäntel an der Garderobe' },
      { svg: 'kula-rain', alt: 'Gezeichnet: das hohe Fenster bei Nacht, Regen' },
    ],
  };
  function albumHTML(g) {
    const key = g === 'retreat' && T1() ? 'retreat-t1' : g;
    const mine = (S.photos[g] || []).slice().reverse().filter((p) => photoSrc(p));
    const seeded = (ALBUM[key] || []).slice();
    while (seeded.length && (mine.length + seeded.length) % 3) seeded.pop();
    const tiles = mine.map((p) => `<figure class="tile${p.id === ui.newId ? ' is-new' : ''}" id="ph-${p.id}"><img src="${photoSrc(p)}" alt="${esc(p.cap || 'Dein Foto')}"><span class="badge${p.social ? ' is-yes' : ''}">${p.social ? 'Social Media: Ja' : 'Nur für die Gruppe'}</span></figure>`)
      .concat(seeded.map((t) => `<figure class="tile">${t.svg ? `<img src="img/${t.svg}.svg" alt="${t.alt}" loading="lazy">` : `<img src="img/${t.src}.jpg" alt="${t.alt}" loading="lazy">`}</figure>`));
    return `<div class="photos" id="photos-${g}">${tiles.join('')}</div>`;
  }
  function treffen(g) {
    const P = PAST[g]();
    const items = P.items.map((it) => `<article class="past-item"><div class="past-head"><div><h3 class="past-what">${it.what}</h3><p class="past-when">${it.when}</p></div>
${it.share ? `<button type="button" class="btn btn-ghost btn-sm" data-act="photo" data-g="${g}">${I.camera}Foto teilen</button>` : ''}</div>${it.share ? albumHTML(g) : ''}</article>`).join('');
    return `<div class="pad">${meetCard(g, false)}</div>
<section class="past" aria-labelledby="past-h"><h2 class="sec-h" id="past-h">${P.head}</h2>${items}${P.note ? `<p class="quiet">${P.note}</p>` : ''}</section>`;
  }

  // ------------------------------------------------------------------ Gespräch
  function composer(g) {
    const ph = g === 'retreat' && T1() && !S.todo.intro ? 'Ein Satz, warum du hier bist' : 'Schreib in die Gruppe';
    return `<form class="composer" data-form="post" data-g="${g}">${meFace(36)}
<label class="sr" for="say">Beitrag für ${esc(G[g].short)}</label><textarea id="say" name="text" rows="1" placeholder="${ph}" enterkeyhint="send"></textarea>
<button type="submit" class="send" aria-label="Beitrag senden" disabled>${I.send}</button></form>`;
  }
  function threadAll(key) {
    const own = (S.posts[key] || []).map((p) => ({ id: p.id, parent: p.parent, who: 'me', ts: p.ts, text: p.text }));
    const all = seedFor(key).concat(own);
    const host = S.replies[key];
    if (host) all.push({ id: 'host-' + key, parent: host.parent, who: host.who, ts: host.ts, text: host.text, lang: 'en' });
    return all;
  }
  function threadBlock(g, key, m, all) {
    const kids = all.filter((x) => x.parent === m.id);
    let html;
    if (m.ask) {
      // the weekly question: answers go to Reise, with a choice of who may read them
      const n = ANS_W2.length + ANS_MORE.length + (S.answers[m.ask] ? 1 : 0);
      html = postCard(m, { actions: `<div class="post-act"><button type="button" class="act" data-act="answer" data-key="${m.ask}">${S.answers[m.ask] ? 'Antwort ändern' : 'Antworten'}</button><button type="button" class="act is-quiet" data-act="view" data-v="r">${n} Antworten in Reise</button></div>` });
    } else {
      html = postCard(m, { actions: actReply(m, kids.length) });
      kids.forEach((k) => { html += postCard(k, { reply: true }); });
    }
    if (ui.typing && ui.typing.key === key && ui.typing.parent === m.id) html += `<p class="typing" role="status">${face('clara', 28)}<span>Clara schreibt <i></i><i></i><i></i></span></p>`;
    if (ui.reply && ui.reply.key === key && ui.reply.id === m.id) html += replyForm(g, m);
    return `<div class="thread">${html}</div>`;
  }
  function gespraech(g) {
    const key = threadKey(g);
    const all = threadAll(key);
    const pin = pinned(g);
    const tops = all.filter((m) => !m.parent);
    const ownTops = tops.filter((m) => m.who === 'me' && m.ts).sort((a, b) => b.ts - a.ts);
    const seedTops = tops.filter((m) => !(m.who === 'me' && m.ts)).reverse();
    const list = [pin].concat(ownTops, seedTops).map((m) => threadBlock(g, key, m, all)).join('');
    const empty = !ownTops.length && !seedTops.length ? '<p class="quiet">Hier beginnt euer Gespräch. Clara antwortet auf jeden ersten Beitrag, meist noch am selben Tag.</p>' : '';
    return `${composer(g)}<div class="feed">${list}</div>${empty}`;
  }

  // ------------------------------------------------------------------ Reise: Woche 1 to 6
  const WEEKS = [[1, '2. November', 'Nach Hause kommen'], [2, '9. November', 'Zurück im Alltag'], [3, '16. November'], [4, '23. November'], [5, '30. November'], [6, '7. Dezember']];
  function ownAnswer(key) {
    const a = S.answers[key];
    if (!a) return '';
    return postCard({ id: 'mine-' + key, who: 'me', text: a.text, meta: `${AUD[a.aud] || ''}, ${timeLabel(a.ts)}` }, { actions: `<div class="post-act"><button type="button" class="act" data-act="answer" data-key="${key}">Ändern</button></div>` });
  }
  function reise(g) {
    const five = T1()
      ? `<div class="five"><span class="slots" aria-hidden="true">${'<span></span>'.repeat(5)}</span><p class="five-t"><b>Deine Fünf</b><span>Heute Nachmittag findest du deinen Partner. Danach siehst du hier deine Fünf.</span></p></div>`
      : `<div class="five">${stack(['me', 'jonas', 'marta', 'malik', 'aiko'], 36)}<p class="five-t"><b>Deine Fünf</b><span>Du, Jonas, Marta, Malik und Aiko. Jonas ist dein Partner aus dem Retreat.</span></p></div>`;
    let rows = '';
    if (T1()) {
      const key = 'retreat-t1-q';
      const q = { id: 'q1', who: 'clara', when: 'heute um 8:30', label: 'Frage für heute', lang: 'en', text: Q1 };
      rows += `<li class="wk is-now"><div class="wk-head"><span class="wk-n">Die vier Tage</span><span class="wk-when">Tag 1 von 4</span></div>
${postCard(q, { actions: S.answers[key] ? '' : `<div class="post-act"><button type="button" class="act" data-act="answer" data-key="${key}">Antworten</button><span class="count">Nur Clara liest mit</span></div>` })}${ownAnswer(key)}</li>`;
      rows += WEEKS.map(([n, d]) => `<li class="wk is-later"><div class="wk-head"><span class="wk-n">Woche ${n}</span><span class="wk-when">ab ${d}</span></div></li>`).join('');
    } else {
      const key = 'retreat-q';
      rows += `<li class="wk is-past"><details><summary><span class="wk-n">Woche 1</span><span class="wk-t">${WEEKS[0][2]}</span>${I.chev}</summary>
${postCard({ id: 'q1w', who: 'clara', when: '2. November', label: 'Frage der Woche', lang: 'en', text: 'What did you notice first when you came home?' }, { actions: '<div class="post-act"><span class="count">12 Antworten</span></div>' })}</details></li>`;
      const answers = ANS_W2.concat(S.readAll ? ANS_MORE : []).map((a) => postCard(a)).join('');
      rows += `<li class="wk is-now"><div class="wk-head"><span class="wk-n">Woche 2</span><span class="wk-t">${WEEKS[1][2]}</span><span class="wk-when">diese Woche</span></div>
${postCard(Object.assign(pinned('retreat'), { when: 'Montag' }), { actions: `<div class="post-act"><button type="button" class="act" data-act="answer" data-key="${key}">${S.answers[key] ? 'Antwort ändern' : 'Antworten'}</button><span class="count">Du wählst, wer es liest</span></div>` })}
${ownAnswer(key)}${answers}${S.readAll ? '' : '<button type="button" class="link more-link" data-act="read-all">Alle Antworten lesen</button>'}</li>`;
      rows += WEEKS.slice(2).map(([n, d]) => `<li class="wk is-later"><div class="wk-head"><span class="wk-n">Woche ${n}</span><span class="wk-when">ab ${d}</span></div></li>`).join('');
    }
    return `<div class="pad">${five}</div><ol class="weeks" aria-label="Eure Reise, Woche 1 bis 6">${rows}</ol>
<p class="quiet">Nach Woche 6 trefft ihr euch einmal im Monat. Die Gruppe bleibt.</p>`;
  }

  // ------------------------------------------------------------------ the group page: one template for every group
  function groupHead(g) {
    return `<header class="ghero">${g === 'stiftung' ? '<span class="ghero-mark"><img src="img/tree.png" alt="Das Baum-Zeichen der Psychedelia-Stiftung"></span>' : coverImg(g)}
<a class="chip" href="#${ui.back}" aria-label="Zurück">${I.back}</a></header>
<div class="ghead"><h1><button type="button" class="gname" data-act="info" data-g="${g}" aria-haspopup="dialog">${g === 'stiftung' ? 'Aus der Stiftung' : esc(G[g].short)}${I.chev}<span class="sr">, Info zur Gruppe</span></button></h1>
<p class="gstatus">${g === 'stiftung' ? 'Nur die Stiftung schreibt hier. Alle lesen mit.' : status(g)}</p>
${g === 'stiftung' ? '' : `<p class="gmembers">${stack(FACES[g], 28)}<span>${G[g].count} Mitglieder</span></p>`}</div>`;
  }
  function groupScreen(g) {
    if (!S.member[g]) {
      return `${pageHead('gruppen', 'Gruppen', `Du bist nicht mehr in ${esc(G[g].short)}.`)}
<p class="page-p">Die Gespräche und Fotos von ${esc(G[g].short)} siehst du erst wieder, wenn du zurückkommst.</p>
<div class="pad"><button type="button" class="btn btn-solid" data-act="rejoin" data-g="${g}">Wieder beitreten</button></div>`;
    }
    const tabs = tabsFor(g);
    let v = ui.view[g];
    if (!tabs.includes(v)) v = startView(g);
    ui.view[g] = v;
    if (!S.seen[g]) { S.seen[g] = true; save(); }
    const tabBtns = tabs.map((k) => `<button type="button" class="gtab" role="tab" id="tab-${k}" aria-selected="${k === v}" aria-controls="panel" data-act="view" data-v="${k}">${LABEL[k]}</button>`).join('');
    const body = v === 'g' ? gespraech(g) : v === 'r' ? reise(g) : treffen(g);
    return `${groupHead(g)}<div class="gtabs" role="tablist" aria-label="Bereiche der Gruppe">${tabBtns}</div>
<div class="gbody" id="panel" role="tabpanel" aria-labelledby="tab-${v}">${body}</div>`;
  }
  function stiftungScreen() {
    if (!S.seen.stiftung) { S.seen.stiftung = true; save(); }
    return `${groupHead('stiftung')}<div class="gbody"><div class="feed">${STIFTUNG_POSTS.map((m) => `<div class="thread">${postCard(m)}</div>`).join('')}</div></div>`;
  }

  // ------------------------------------------------------------------ Start (round 3): the field, what is happening now, your groups
  // the people of your groups, standing in the field: one small cluster per group
  const HERO_FACES = { retreat: ['clara', 'jonas', 'marta'], kula: ['ayla', 'ben', 'sophie'], forum: ['theresa', 'greta', 'malik'] };
  function heroHTML(mine) {
    const night = isNight();
    const img = night
      ? '<img class="hero-photo" src="img/hero-dusk.jpg" width="910" height="980" alt="Der Waldrand hinter der Wiese in Castricum in der Dämmerung" fetchpriority="high">'
      : '<img class="hero-photo" src="img/hero-gold.jpg" width="910" height="980" alt="Die Wiese hinter dem Haus in Castricum bei Sonnenuntergang, Schafe auf der Weide" fetchpriority="high">';
    let i = 0;
    const faces = mine.map((g) => `<span class="hf-group">${HERO_FACES[g].map((k) => `<span class="hf" style="--i: ${i++}">${face(k, 40)}</span>`).join('')}</span>`).join('');
    const who = mine.map((g) => HERO_FACES[g].map((k) => PEOPLE[k][0]).join(', ')).join('; ');
    return `<header class="hero${night ? ' is-night' : ''}${ui.opening ? ' is-opening' : ''}">${img}
<div class="hero-txt"><p class="hero-by"><span class="hero-mark" aria-hidden="true"><img src="img/tree.png" alt="" width="23" height="12"></span>Community der Psychedelia-Stiftung.</p>
<h1 class="hero-h">Deine Gruppen<br> an einem Ort.</h1></div>
${faces ? `<div class="hero-faces" role="img" aria-label="Menschen aus deinen Gruppen: ${esc(who)}">${faces}</div>` : ''}</header>`;
  }
  const replyCount = (key, id) => threadAll(key).filter((x) => x.parent === id).length;
  // the doors: what is happening right now, as pictures; each opens its real place and asks nothing
  function photoDoor(mine) {
    let d = null;
    if (mine.includes('retreat')) {
      d = T1()
        ? { g: 'retreat', who: 'clara', list: ['chandelier', 'labyrinth', 'circle'], s: 'Die vier Tage in Castricum', when: '8:12' }
        : { g: 'retreat', who: 'marta', list: ['oaks', 'bell', 'labyrinth', 'chandelier'], s: 'Die vier Tage in Castricum', when: 'Freitag' };
    } else if (mine.includes('kula')) {
      d = { g: 'kula', who: 'sophie', list: ['kula-bowls', 'kula-coats', 'kula-rain'], svg: true, s: 'Der Kula-Abend im Oktober', when: '24. Okt.' };
    }
    if (!d) return '';
    // each path is written out whole (folder, name, ending), the shape build_share.py can inline
    const thumbs = d.list.map((f) => (d.svg ? `<img src="img/${f}.svg" alt="" loading="lazy">` : `<img src="img/${f}.jpg" alt="" loading="lazy">`)).join('');
    const t = `${nameOf(d.who)} hat ${d.list.length} ${d.g === 'kula' ? 'Bilder' : 'Fotos'} geteilt`;
    return `<button type="button" class="door door-photos" data-act="open" data-g="${d.g}" data-v="t" data-to="photos-${d.g}" aria-label="${t}: ${d.s}, ${d.when}. Öffnet das Album unter dem Treffen.">
<span class="door-thumbs" style="--n: ${d.list.length}">${thumbs}</span>
<span class="door-cap">${face(d.who, 28)}<span class="row-main"><span class="door-t"><b>${nameOf(d.who)}</b> hat ${d.list.length} ${d.g === 'kula' ? 'Bilder' : 'Fotos'} geteilt</span><span class="door-s">${d.s}</span></span><span class="door-when">${d.when}</span></span></button>`;
  }
  const RING_MORE = { retreat: ['aiko', 'ines', 'pieter', 'hanna'], kula: ['mehmet', 'leon', 'frieda', 'karim'], forum: ['malik', 'elif', 'ruben', 'aiko'] };
  function meetDoor(g) {
    const n = meetNext(g);
    const going = n.key && S.rsvp[n.key] === 'yes';
    const [kind, day, time] = {
      retreat: T1() ? ['Eröffnungskreis', 'Heute', '11:00'] : W7() ? ['Monatskreis', '7. Januar', '19:30'] : ['Wochenkreis', 'Donnerstag', '19:30'],
      kula: ['Kula-Abend', 'Freitag', '19:00'],
      forum: ['Online-Abend', 'Mittwoch', '19:00'],
    }[g];
    const here = g === 'retreat' && T1();
    const total = here ? n.who.length : n.who.length + n.others;
    let ring = here ? n.who.slice() : n.who.concat(RING_MORE[g]).slice(0, 8);
    if (going) ring = ['me'].concat(ring.slice(0, 7));
    const count = here ? `${total} sind schon da` : going ? `Du und ${total} andere` : `${total} kommen`;
    const R = 45, C = 60, F = 30;
    const seats = ring.map((k, j) => {
      const a = -Math.PI / 2 + (j * 2 * Math.PI) / ring.length;
      return `<span class="seat" style="left: ${Math.round(C + R * Math.cos(a) - F / 2)}px; top: ${Math.round(C + R * Math.sin(a) - F / 2)}px">${face(k, F)}</span>`;
    }).join('');
    return `<button type="button" class="door tile" data-act="open" data-g="${g}" data-v="t" data-mark="meet-${g}" aria-label="${kind}, ${day} um ${time}. ${count}${here ? '' : going ? ' kommen' : ''}. Öffnet Treffen.">
<span class="tile-k">${kind}</span><span class="ring" aria-hidden="true">${seats}<span class="ring-t">${time}</span></span>
<span class="tile-foot"><span class="tile-day">${day}</span><span class="tile-s">${count}</span></span></button>`;
  }
  function questionDoor(g) {
    let d;
    if (g === 'retreat') {
      if (T1()) d = { v: 'r', to: 'm-q1', who: 'clara', q: Q1, en: true, s: S.answers['retreat-t1-q'] ? 'Du hast geantwortet' : 'Nur Clara liest mit' };
      else if (W7()) { const n = replyCount('retreat', 'q7'); d = { v: 'g', to: 'm-q7', who: 'clara', q: Q7, en: true, s: `${n} ${n === 1 ? 'Antwort' : 'Antworten'}` }; }
      else { const n = ANS_W2.length + ANS_MORE.length + (S.answers['retreat-q'] ? 1 : 0); d = { v: 'g', to: 'm-q2', who: 'clara', q: Q2, en: true, s: `${n} Antworten` }; }
    } else if (g === 'forum') {
      const n = replyCount('forum', 'fq');
      d = { v: 'g', to: 'm-fq', who: 'theresa', q: pinned('forum').text, s: `${n} ${n === 1 ? 'Antwort' : 'Antworten'}` };
    } else {
      const n = replyCount('kula', 'k1');
      d = { v: 'g', to: 'm-k1', who: 'ayla', q: pinned('kula').text, s: `${n} ${n === 1 ? 'Antwort' : 'Antworten'}` };
    }
    const where = d.v === 'r' ? 'Reise' : 'Gespräch';
    return `<button type="button" class="door tile" data-act="open" data-g="${g}" data-v="${d.v}" data-to="${d.to}" aria-label="${nameOf(d.who)} fragt: ${esc(d.q)} ${d.s}. Öffnet ${where}.">
<span class="tile-k">${face(d.who, 28)}${nameOf(d.who)} fragt</span><span class="tile-q"${d.en ? ' lang="en"' : ''}>${esc(d.q)}</span>
<span class="tile-foot"><span class="tile-s">${d.s}</span></span></button>`;
  }
  // your groups as cards you swipe; the retreat card shows the house's door, so the field is not on Start twice
  function groupCard(g) {
    const dot = UNREAD[g] && !S.seen[g];
    const name = g === 'stiftung' ? 'Aus der Stiftung' : esc(G[g].short);
    const img = g === 'stiftung' ? '<span class="gcard-mark"><img src="img/tree.png" alt="" width="72" height="37"></span>'
      : g === 'retreat' ? '<img src="img/door.jpg" alt="" width="780" height="1300" loading="lazy" style="object-position: 50% 26%">'
        : coverImg(g).replace(/ alt="[^"]*"/, ' alt="" loading="lazy"');
    return `<a class="gcard" href="#${g}"><span class="gcard-img">${img}</span><span class="gcard-t">${name}${dot ? '<span class="dot" aria-hidden="true"></span><span class="sr">, neu für dich</span>' : ''}</span><span class="gcard-s">${rowStatus(g)}</span></a>`;
  }
  function startScreen() {
    const mine = GIDS.filter((g) => S.member[g]);
    const jump = T1() && S.member.retreat ? '<button type="button" class="link" data-act="jump" data-stage="w2">Zu Woche 2 vorspulen</button>' : '';
    const now = mine.length
      ? `<section class="sec now" aria-labelledby="now-h"><div class="sec-head"><h2 class="sec-h" id="now-h">Was gerade passiert</h2><a class="more" href="#fuerdich">Alle anzeigen</a></div>
${photoDoor(mine)}<div class="pair">${meetDoor(mine[0])}${questionDoor(['retreat', 'forum', 'kula'].find((g) => S.member[g]))}</div></section>`
      : '<section class="sec now"><p class="page-p flush">Du bist gerade in keiner Gruppe. Wenn dich jemand einlädt, erscheint die Gruppe hier.</p></section>';
    return `${heroHTML(mine)}<div class="start-body">${now}
<section class="sec" aria-labelledby="dg-h"><h2 class="sec-h" id="dg-h">Deine Gruppen</h2>
<div class="cards">${mine.concat('stiftung').map(groupCard).join('')}</div></section>
<p class="note"><span>Demo: erfundene Menschen, echte Orte.</span>${jump}</p></div>`;
  }
  function forYou() {
    const out = [];
    if (S.member.retreat) {
      if (T1()) {
        const host = S.replies['retreat-t1'];
        out.push(host
          ? { face: 'clara', t: '<b>Clara</b> hat dir geantwortet', s: host.text, when: timeLabel(host.ts), g: 'retreat', v: 'g', to: 'm-host-retreat-t1', en: true, mine: true }
          : { face: 'clara', t: '<b>Clara</b> hat dich begrüßt', s: 'Welcome, {name}. Before we open the circle, tell us in one sentence why you came.', when: '8:40', g: 'retreat', v: 'g', to: 'm-w1', en: true, mine: true });
        out.push({ face: 'clara', t: '<b>Clara</b> hat Fotos geteilt', s: 'Die vier Tage in Castricum', when: '8:12', g: 'retreat', v: 't', to: 'photos-retreat', mine: true });
      } else if (W7()) {
        out.push({ face: 'jonas', t: '<b>Jonas</b> hat geantwortet', s: 'The quiet mornings. I kept them.', when: '12. Dez.', g: 'retreat', v: 'g', to: 'm-q7a', en: true, mine: true });
      } else {
        out.push({ face: 'clara', t: '<b>Clara</b> hat dir geantwortet', s: '{name}, stay with the speed you noticed. Bring it on Thursday, we can start there.', when: '21:48', g: 'retreat', v: 'g', to: 'm-r3', en: true, mine: true });
        out.push({ face: 'marta', t: '<b>Marta</b> hat Fotos geteilt', s: 'Die vier Tage in Castricum', when: 'Freitag', g: 'retreat', v: 't', to: 'photos-retreat', mine: true });
      }
    }
    if (S.member.kula) out.push({ face: 'sophie', t: '<b>Sophie</b> hat Ayla geantwortet', s: 'Brot kommt von mir. Und Kerzen, falls der Strom wieder ausfällt.', when: '19:12', g: 'kula', v: 'g', to: 'm-k3' });
    if (S.member.forum) out.push({ face: 'theresa', t: '<b>Theresa</b> fragt alle im Forum', s: 'Wie erzählst du von etwas, das dir wichtig war?', when: '2. Nov.', g: 'forum', v: 'g', to: 'm-fq' });
    return out;
  }
  const fyRow = (it) => `<button type="button" class="row" data-act="open" data-g="${it.g}" data-v="${it.v}" data-to="${it.to}">${face(it.face, 36)}<span class="row-main"><span class="row-t">${it.t}</span><span class="row-s says"${it.en ? ' lang="en"' : ''}>${fill(esc(it.s))}</span></span><span class="row-when">${it.when.replace(/^heute um /, '')}</span></button>`;
  function groupRow(g) {
    const dot = UNREAD[g] && !S.seen[g];
    const name = g === 'stiftung' ? 'Aus der Stiftung' : esc(G[g].short);
    return `<a class="row" href="#${g}">${thumb(g)}<span class="row-main"><span class="row-t">${name}</span><span class="row-s">${rowStatus(g)}</span></span>${dot ? '<span class="dot" aria-hidden="true"></span><span class="sr">, neu für dich</span>' : ''}</a>`;
  }
  function forYouScreen() {
    return `${pageHead('start', 'Start', 'Was gerade passiert')}<section class="sec">${forYou().map(fyRow).join('')}</section>`;
  }

  // ------------------------------------------------------------------ Gruppen
  function groupsScreen() {
    const mine = GIDS.filter((g) => S.member[g]);
    const left = GIDS.filter((g) => !S.member[g]);
    return `<header class="top"><h1>Gruppen</h1></header>
<section class="sec">${['stiftung'].concat(mine).map(groupRow).join('')}</section>
${left.length ? `<section class="sec" aria-labelledby="left-h"><h2 class="sec-h" id="left-h">Früher dabei</h2>${left.map((g) => `<div class="row is-static">${thumb(g)}<span class="row-main"><span class="row-t">${esc(G[g].short)}</span><span class="row-s">Verlassen</span></span><button type="button" class="btn btn-ghost btn-sm" data-act="rejoin" data-g="${g}">Wieder beitreten</button></div>`).join('')}</section>` : ''}
<p class="quiet">Neue Gruppen kommen über eine Einladung.</p>`;
  }

  // ------------------------------------------------------------------ Nachrichten: Das Team on top is the help route
  const CHATS = {
    team: {
      name: 'Das Team', face: 'team', sub: 'Psychedelia Retreats und die Stiftung', ph: 'Schreib dem Team',
      seed: () => [{ who: 'them', when: T1() ? 'heute' : '26. Oktober', text: 'Hallo {name}. Hier erreichst du das Team von Psychedelia Retreats und der Stiftung direkt, wenn etwas schwer ist oder du eine Frage hast. Wir antworten persönlich, meist innerhalb eines Tages. Niemand aus deinen Gruppen liest mit.' }],
    },
    jonas: {
      name: 'Jonas', face: 'jonas', sub: 'Dein Partner aus dem Retreat', ph: 'Nachricht an Jonas',
      seed: () => [{ who: 'them', when: 'heute um 20:12', lang: 'en', text: 'I read your post about how fast everyone talks. Same at my office. Shall we compare notes before Thursday?' }],
    },
    marta: {
      name: 'Marta', face: 'marta', sub: 'Aus deinen Fünf', ph: 'Nachricht an Marta',
      seed: () => [
        { who: 'them', when: 'Freitag', lang: 'en', text: 'I put the rest of the photos in the group. The one with the bell is for you.' },
        { who: 'me', when: 'Freitag', lang: 'en', text: 'Thank you. It is my lock screen now.' },
      ],
    },
  };
  function chatMsgs(id) {
    return CHATS[id].seed().concat((S.dms[id] || []).map((m) => ({ who: 'me', ts: m.ts, text: m.text, id: m.id })));
  }
  function messagesScreen() {
    const rows = CHAT_IDS().map((id) => {
      const c = CHATS[id];
      const last = chatMsgs(id).slice(-1)[0];
      const when = (last.ts ? timeLabel(last.ts) : last.when).replace(/^heute um /, '');
      return `<a class="row" href="#${id}">${face(c.face, 44)}<span class="row-main"><span class="row-t">${id === 'team' ? `${I.pin}<span class="sr">Angeheftet: </span>` : ''}${c.name}</span><span class="row-s says"${last.lang ? ` lang="${last.lang}"` : ''}>${last.who === 'me' ? 'Du: ' : ''}${fill(esc(last.text))}</span></span><span class="row-when">${esc(when)}</span>${unreadChat(id) ? '<span class="dot" aria-hidden="true"></span><span class="sr">, ungelesen</span>' : ''}</a>`;
    }).join('');
    return `<header class="top"><h1>Nachrichten</h1></header><section class="sec">${rows}</section>
<p class="quiet">Wer dir schreiben darf, stellst du im Profil ein.</p>`;
  }
  function chatScreen(id) {
    const c = CHATS[id];
    if (!S.seen['chat-' + id]) { S.seen['chat-' + id] = true; save(); }
    const msgs = chatMsgs(id);
    const lastMine = msgs.map((m) => m.who).lastIndexOf('me');
    const bubbles = msgs.map((m, i) => `<div class="bubble${m.who === 'me' ? ' is-me' : ''}${m.id && m.id === ui.newId ? ' is-new' : ''}"${m.lang ? ` lang="${m.lang}"` : ''}><p>${fill(esc(m.text))}</p><span class="bt">${esc(m.ts ? timeLabel(m.ts) : m.when)}</span></div>${id === 'team' && i === lastMine && m.ts ? '<p class="sent-note" role="status">Gesendet. Das Team antwortet dir persönlich, meist innerhalb eines Tages. In der Demo geht nichts raus.</p>' : ''}`).join('');
    const urgent = id === 'team' ? '<div class="chat-note"><p><b>Wenn es dringend ist</b></p><p>Im Notfall: Rettungsdienst, 112</p><p>Telefonseelsorge, kostenlos und rund um die Uhr: 0800 111 0 111</p></div>' : '';
    return `<header class="pbar chat-bar"><a class="back" href="#nachrichten" aria-label="Zurück zu Nachrichten">${I.back}</a>${face(c.face, 36)}<div class="chat-who"><p class="cn">${c.name}</p><p class="cs">${c.sub}</p></div></header>
<div class="chat">${urgent}${bubbles}</div>
<form class="chat-composer" data-form="dm" data-chat="${id}"><label class="sr" for="dm">Nachricht an ${c.name}</label><textarea id="dm" name="text" rows="1" placeholder="${c.ph}" enterkeyhint="send"></textarea>
<button type="submit" class="send" aria-label="Nachricht senden" disabled>${I.send}</button></form>`;
  }

  // ------------------------------------------------------------------ Profil
  const DM_L = { alle: 'Alle in deinen Gruppen', fuenf: 'Deine Fünf und das Team', team: 'Nur das Team' };
  const DIG_L = { tag: 'Einmal am Tag', woche: 'Einmal pro Woche', keine: 'Keine Zusammenfassung' };
  const setRow = (act, t, v, href) => (href
    ? `<a class="set-row" href="${href}"><span class="row-main"><span class="row-t">${t}</span>${v ? `<span class="row-s">${v}</span>` : ''}</span>${I.chev}</a>`
    : `<button type="button" class="set-row" data-act="${act}"><span class="row-main"><span class="row-t">${t}</span>${v ? `<span class="row-s">${v}</span>` : ''}</span>${I.chev}</button>`);
  function profileScreen() {
    const p = S.prof;
    const notif = [p.replies && 'Antworten', p.meets && 'Treffen'].filter(Boolean).join(' und ') || 'Aus';
    return `<header class="top"><h1>Profil</h1></header>
<div class="prof-head">${meFace(72)}<div><p class="nm">${nm()}</p><button type="button" class="link" data-act="avatar">${S.photo ? 'Foto ändern' : 'Foto hinzufügen'}</button></div></div>
<section class="sec"><h2 class="set-h">Du</h2>${setRow('sheet-name', 'Vorname', nm())}${setRow('sheet-dm', 'Wer darf dir schreiben?', DM_L[p.dm])}</section>
<section class="sec"><h2 class="set-h">Von uns</h2>${setRow('sheet-email', 'E-Mails', DIG_L[p.digest] + (p.news ? ', mit Newsletter' : ''))}${setRow('sheet-notif', 'Benachrichtigungen', notif)}</section>
<section class="sec"><h2 class="set-h">Hilfe</h2>${setRow('', 'Hilfe und Kontakt', 'Schreib dem Team direkt', '#team')}${setRow('rules', 'Hausregeln', '')}${setRow('privacy', 'Datenschutz', '')}</section>
<section class="sec"><h2 class="set-h">Demo</h2>${setRow('demo', 'Demo-Einstellungen', 'Zeit, Licht, von vorn beginnen')}</section>`;
  }

  // ------------------------------------------------------------------ Einrichten: the admins choose the first tab
  function setupScreen() {
    const g = ui.setup in G ? ui.setup : 'retreat';
    const pick = S.start[g];
    const opts = g === 'retreat' ? ['g', 'r', 't'] : ['g', 't'];
    const rec = { retreat: 'r', kula: 't', forum: 'g' }[g];
    const D = {
      g: 'Zuerst die Beiträge. Gut für Gruppen, in denen viel geschrieben wird.',
      r: 'Zuerst die Frage der Woche und eure Fünf. Für die sechs Wochen nach dem Retreat.',
      t: 'Zuerst das nächste Treffen und eure Fotos. Gut, sobald ihr euch einmal im Monat trefft.',
    };
    const choices = opts.map((k) => radio('start', k, pick, LABEL[k], D[k] + (rec === k ? ' Empfohlen.' : ''), 'start', ` data-g="${g}"`)).join('');
    const sw = g === 'retreat' && pick === 'r' ? `<div class="panel"><div class="panel-row"><div class="row-main"><p class="row-t" id="sw-l">Nach Woche 6 mit Treffen öffnen</p><p class="row-s">Nach Woche 6 verschwindet Reise. Ab Freitag, 11. Dezember sieht die Gruppe dann zuerst den nächsten Monatskreis. Ausgeschaltet öffnet sie mit Gespräch.</p></div>
<button type="button" class="switch" role="switch" aria-checked="${S.after6}" aria-labelledby="sw-l" data-act="after6"></button></div></div>` : '';
    const preview = g === 'retreat' && pick === 'r' && !W7() ? `<button type="button" class="go-link" data-act="preview-w7">Vorschau: so öffnet sie ab 11. Dezember${I.chev}</button>` : '';
    return `${pageHead(g, esc(G[g].short), 'Wie öffnet sich eure Gruppe?')}
<p class="page-p">Alle sehen beim Öffnen denselben Bereich. Die anderen sind einen Tipp entfernt.</p>
<p class="admin-note">Nur Admins sehen diese Seite. In der Demo darfst du hinein.</p>
<fieldset class="sec choices"><legend class="sr">Erster Bereich der Gruppe</legend>${choices}</fieldset>${sw}
<div class="sec"><button type="button" class="go-link" data-act="open" data-g="${g}" data-v="start">So sieht es die Gruppe${I.chev}</button>${preview}
<p class="quiet flush">Mitglieder wählen das nicht selbst, damit alle dasselbe sehen. Änderungen gelten sofort.</p></div>`;
  }

  // ------------------------------------------------------------------ Einladung (kept from round one)
  function inviteScreen() {
    const domain = `<p class="domain">${I.lock}community.psychedelia-stiftung.de</p>`;
    const door = '<img src="img/door.jpg" alt="Die alte Holztür des Hauses ZeeVELD in Castricum mit Kranz und Laterne">';
    if (ui.inv === 'cover') {
      return `<section class="invite-cover">${door}${domain}
<div class="invite-foot"><div class="invite-from">${face('clara', 36)}<p><b>Clara</b> <span>lädt dich ein</span></p></div>
<h1 class="invite-title">October Practitioners 2026</h1>
<p class="invite-sub">Die Gruppe eures Retreats in Castricum. Für die vier Tage und die Wochen danach.</p>
<div class="invite-who">${stack(['clara', 'marta', 'tomas', 'ines'], 32)}<p>Clara, Marta, Tomás und Ines<br>sind schon da.</p></div></div></section>
<div class="invite-act"><button type="button" class="btn btn-lamp btn-wide" data-act="inv" data-step="account">Einladung annehmen</button>
<p>Ohne Passwort. Du bekommst einen Link per E-Mail.</p>
${S.joined ? '<p><a class="link" href="#start">Schon dabei? Zu deinen Gruppen</a></p>' : ''}
<p class="invite-runs"><img src="img/tree.png" alt="" width="29" height="15">Community der Psychedelia-Stiftung. Psychedelia Retreats führt diese Gruppe.</p></div>`;
    }
    const d = ui.invDraft || { name: 'Noor', email: 'noor.h@beispiel.de', consent: false, news: false };
    ui.invDraft = d;
    const peek = `<div class="peek">${door}${domain}</div>`;
    if (ui.inv === 'account') {
      return `<div class="sheet-page">${peek}<form class="sheet-card" data-form="account" novalidate>
<span class="grabber" aria-hidden="true"></span>
<button type="button" class="back" data-act="inv" data-step="cover">${I.back}Zurück</button>
<h2>Ein Konto, dann bist du drin.</h2>
<p class="lede">Community gehört der Psychedelia-Stiftung. Mit diesem einen Konto kommst du in jede Gruppe, in die du eingeladen wirst.</p>
<div class="field"><label for="jn">Vorname</label><input id="jn" name="name" value="${esc(d.name)}" autocomplete="given-name" required maxlength="40"><p class="hint">So sehen dich die anderen in der Gruppe.</p><p class="err" id="jn-err" hidden>Wie sollen dich die anderen nennen? Ein Vorname reicht.</p></div>
<div class="field"><label for="jm">E-Mail</label><input id="jm" name="email" type="email" value="${esc(d.email)}" autocomplete="email" inputmode="email" required><p class="hint">Nur für deinen Anmeldelink. In der Gruppe sieht sie niemand.</p><p class="err" id="jm-err" hidden>Gib deine E-Mail-Adresse ein, damit der Link ankommt.</p></div>
<div class="consent">
  <label class="check"><input type="checkbox" name="consent" ${d.consent ? 'checked' : ''} data-change="inv-draft"><span class="box" aria-hidden="true">${I.check}</span><span>Ich nehme die Hausregeln und die Datenschutzerklärung der <span class="nowrap">Psychedelia-Stiftung</span> an.</span></label>
  <p class="read-row"><button type="button" class="link" data-act="rules">Hausregeln lesen</button><button type="button" class="link" data-act="privacy">Datenschutz lesen</button></p>
  <p class="err" id="consent-err" hidden>Nimm zuerst die Hausregeln an. Ohne sie geht es nicht in die Gruppe.</p>
  <label class="check"><input type="checkbox" name="news" ${d.news ? 'checked' : ''} data-change="inv-draft"><span class="box" aria-hidden="true">${I.check}</span><span>Schick mir auch den Newsletter der Stiftung.<span class="s">Freiwillig. Du kannst ihn jederzeit abbestellen.</span></span></label>
</div>
<button type="submit" class="btn btn-solid btn-wide" aria-disabled="${!d.consent}">Anmeldelink schicken</button>
</form></div>`;
    }
    return `<div class="sheet-page">
<button type="button" class="notif" data-act="join" aria-label="Mitteilung: Dein Anmeldelink. Öffnen und in die Gruppe gehen"><span class="ic"><img src="img/tree.png" alt=""></span><span class="tx"><span class="r1"><b>Community</b><span class="g">jetzt</span></span><b>Dein Anmeldelink</b><span class="l">Tipp hier, um in October Practitioners 2026 zu gehen.</span></span></button>
${peek}<div class="sheet-card"><span class="grabber" aria-hidden="true"></span>
<h2 class="mail-h">Schau in dein Postfach.</h2>
<p class="lede">Der Link ist unterwegs an <b>${esc(d.email)}</b>. Öffne ihn auf diesem Telefon, dann bist du sofort in der Gruppe.</p>
<p class="read-row"><button type="button" class="link" data-act="resend">Nochmal schicken</button><button type="button" class="link" data-act="inv" data-step="account">Andere Adresse</button></p>
<p class="lede small">Der Link gilt eine Stunde. Danach schickst du dir einfach einen neuen. In der Demo öffnest du ihn oben über die Mitteilung.</p>
</div></div>`;
  }

  // ------------------------------------------------------------------ routing and rendering
  const ROUTES = ['start', 'gruppen', 'nachrichten', 'profil', 'fuerdich', 'retreat', 'kula', 'forum', 'stiftung', 'einrichten', 'einladung', 'team', 'jonas', 'marta', 'hilfe'];
  function current() {
    const h = location.hash.replace(/^#/, '');
    if (h === 'hilfe') return 'team';
    if (ROUTES.includes(h)) return (h === 'jonas' || h === 'marta') && T1() ? 'nachrichten' : h;
    return S.joined ? 'start' : 'einladung';
  }
  const root = document.getElementById('app');
  function render(keepScroll) {
    const r = current();
    const y = window.scrollY;
    document.documentElement.dataset.light = r === 'einladung' ? 'invite' : isNight() ? 'night' : 'day';
    let html;
    if (r === 'start') html = startScreen();
    else if (r === 'gruppen') html = groupsScreen();
    else if (r === 'nachrichten') html = messagesScreen();
    else if (r === 'profil') html = profileScreen();
    else if (r === 'fuerdich') html = forYouScreen();
    else if (r in G) html = groupScreen(r);
    else if (r === 'stiftung') html = stiftungScreen();
    else if (r === 'einrichten') html = setupScreen();
    else if (CHATS[r]) html = chatScreen(r);
    else html = inviteScreen();
    const withBar = r !== 'einladung' && !CHATS[r];
    root.innerHTML = `<div class="screen${withBar ? ' has-bar' : ''}" data-route="${r}">${html}</div>${withBar ? bar(r) : ''}`;
    document.title = r in G ? `${G[r].short}, Community` : 'Community';
    if (keepScroll) window.scrollTo(0, y);
    ui.newId = null;
    const hp = root.querySelector('.hero-photo');
    if (hp) {
      const miss = () => hp.closest('.hero').classList.add('no-photo');
      if (hp.complete && !hp.naturalWidth && hp.src) miss(); else hp.addEventListener('error', miss, { once: true });
    }
  }
  function go(hash, opts = {}) {
    if (opts.view) ui.view[hash] = opts.view;
    if (location.hash === '#' + hash) { render(); window.scrollTo(0, 0); afterNav(opts); return; }
    ui.pendingNav = opts;
    location.hash = hash;
  }
  function afterNav(opts) {
    if (!opts) return;
    if (opts.scrollTo) {
      const el = document.getElementById(opts.scrollTo);
      if (el) setTimeout(() => el.scrollIntoView({ behavior: RM.matches ? 'auto' : 'smooth', block: 'center' }), 60);
    }
    if (opts.focus) { const el = $(opts.focus); if (el) setTimeout(() => el.focus({ preventScroll: true }), 80); }
    if (opts.mark && !RM.matches) {
      // a door on Start opened this place: a brief ring shows what you tapped through to
      const el = document.getElementById(opts.mark);
      if (el) { el.classList.add('is-arrived'); setTimeout(() => el.classList.remove('is-arrived'), 1700); }
    }
  }
  // the two-second opening: the photo fades in, the line follows, the faces arrive one by one. Waits for the photo.
  function startOpening() {
    const h = document.querySelector('.hero.is-opening');
    if (!h) return;
    const img = h.querySelector('.hero-photo');
    let on = false;
    const run = () => {
      if (on) return;
      on = true;
      h.classList.add('go');
      setTimeout(() => h.classList.remove('is-opening', 'go'), 2600);
    };
    if (img.complete && img.naturalWidth) run();
    else { img.addEventListener('load', run, { once: true }); img.addEventListener('error', run, { once: true }); setTimeout(run, 1200); }
  }
  window.addEventListener('hashchange', () => {
    const r = current();
    const opts = ui.pendingNav || {};
    ui.pendingNav = null;
    if ((r in G || r === 'stiftung') && (ui.last === 'start' || ui.last === 'gruppen')) ui.back = ui.last;
    ui.last = r;
    if (r in G && !opts.keepView) ui.view[r] = startView(r);
    if (r === 'einladung' && !opts.keepInv) ui.inv = 'cover';
    if (!opts.keepReply) ui.reply = null;
    closeSheet();
    render();
    window.scrollTo(0, 0);
    afterNav(opts);
  });

  // ------------------------------------------------------------------ toast
  let toastT = null;
  function toast(msg, action) {
    const t = document.getElementById('toast');
    t.innerHTML = `<span>${msg}</span>${action ? `<button type="button" id="toastAct">${action.label}</button>` : ''}`;
    t.classList.add('is-on');
    if (action) document.getElementById('toastAct').onclick = () => { t.classList.remove('is-on'); action.fn(); };
    clearTimeout(toastT);
    toastT = setTimeout(() => t.classList.remove('is-on'), action ? 5200 : 3200);
  }

  // ------------------------------------------------------------------ sheets
  let sheetEl = null;
  function openSheet(html, onOpen) {
    closeSheet();
    const d = document.createElement('dialog');
    d.className = 'sheet';
    d.innerHTML = `<div class="sheet-in">${html}</div>`;
    document.body.appendChild(d);
    sheetEl = d;
    d.addEventListener('click', (e) => { if (e.target === d) closeSheet(); });
    d.addEventListener('close', () => { if (sheetEl === d) sheetEl = null; d.remove(); });
    try { d.showModal(); } catch (e) { d.setAttribute('open', ''); }
    if (onOpen) onOpen(d);
  }
  function closeSheet() { if (sheetEl) { const d = sheetEl; sheetEl = null; try { d.close(); } catch (e) { /* */ } d.remove(); } }
  const sheetTop = (k) => `<div class="sheet-top"><p class="k">${k}</p><button type="button" class="icon-btn" data-act="close" aria-label="Schließen">${I.close}</button></div>`;
  function radio(name, val, cur, t, s, change, extra = '') {
    return `<label class="choice"><input type="radio" name="${name}" value="${val}" ${cur === val ? 'checked' : ''} data-change="${change}"${extra}><span class="mk" aria-hidden="true">${I.check}</span><span class="row-main"><span class="row-t">${t}</span>${s ? `<span class="row-s">${s}</span>` : ''}</span></label>`;
  }
  function box(name, on, t, s) {
    return `<label class="choice is-box"><input type="checkbox" name="${name}" ${on ? 'checked' : ''} data-change="prof"><span class="mk" aria-hidden="true">${I.check}</span><span class="row-main"><span class="row-t">${t}</span>${s ? `<span class="row-s">${s}</span>` : ''}</span></label>`;
  }

  function rulesSheet() {
    openSheet(`${sheetTop('Gilt in jeder Gruppe')}<h2>Hausregeln</h2><p class="lede">Entwurf, bis die rechtliche Prüfung durch ist.</p>
<ol class="rules"><li>Was im Kreis gesagt wird, bleibt im Kreis.</li><li>Fotos von anderen teilst du nur mit ihrem Ja.</li><li>Hier gibt niemand medizinischen Rat. Dafür ist das Team da, persönlich.</li><li>Du antwortest, wie du selbst angesprochen werden möchtest.</li><li>Wenn es dir nicht gut geht, schreib dem Team direkt.</li></ol>
<div class="btn-row"><button type="button" class="btn btn-solid" data-act="close">Gelesen</button></div>`);
  }
  function privacySheet() {
    openSheet(`${sheetTop('Community der Psychedelia-Stiftung')}<h2>Datenschutz</h2><p class="lede">Die Datenschutzerklärung kommt von der Stiftung, sobald die rechtliche Prüfung abgeschlossen ist. In dieser Demo bleibt alles, was du eingibst, auf diesem Gerät.</p>
<div class="btn-row"><button type="button" class="btn btn-solid" data-act="close">Verstanden</button></div>`);
  }
  function infoSheet(g) {
    if (g === 'stiftung') {
      openSheet(`${sheetTop('Info')}<h2>Aus der Stiftung</h2><p class="lede">Neuigkeiten der Psychedelia-Stiftung für alle in der Community. Nur die Stiftung schreibt hier.</p>
<div class="rows">${setRow('rules', 'Hausregeln', '')}${setRow('', 'Problem melden', 'Schreib dem Team direkt', '#team')}</div>`);
      return;
    }
    openSheet(`${sheetTop('Info zur Gruppe')}<h2>${esc(G[g].name)}</h2><p class="lede">${G[g].about}</p>
<p class="admins">${stack(G[g].admins, 28)}<span>${G[g].adminLine}</span></p>
<div class="rows">${setRow('rules', 'Hausregeln', '')}${setRow('', 'Problem melden', 'Schreib dem Team direkt', '#team')}
<button type="button" class="set-row" data-act="setup" data-g="${g}"><span class="row-main"><span class="row-t">Gruppe einrichten</span><span class="row-s">Für Admins. Öffnet mit ${LABEL[startView(g)]}.</span></span>${I.chev}</button>
<button type="button" class="set-row is-danger" data-act="leave" data-g="${g}"><span class="row-main"><span class="row-t">Gruppe verlassen</span></span></button></div>`);
  }
  function leaveSheet(g) {
    openSheet(`${sheetTop('Info zur Gruppe')}<h2>${esc(G[g].short)} verlassen?</h2><p class="lede">Du siehst die Gespräche, Treffen und Fotos von ${esc(G[g].short)} dann nicht mehr. Was du geschrieben hast, bleibt für die anderen sichtbar. Unter Gruppen kannst du wieder beitreten.</p>
<div class="btn-row"><button type="button" class="btn btn-ghost" data-act="close">Bleiben</button><button type="button" class="btn btn-solid" data-act="leave-yes" data-g="${g}">Verlassen</button></div>`);
  }
  function demoSheet() {
    const seg = (name, opts, cur) => `<div class="seg" role="radiogroup">${opts.map(([v, l]) => `<label><input type="radio" name="${name}" value="${v}" ${cur === v ? 'checked' : ''} data-change="demo-${name}"><span>${l}</span></label>`).join('')}</div>`;
    openSheet(`${sheetTop('Demo')}<h2>Demo-Einstellungen</h2><p class="lede">Die Menschen und Texte sind erfunden. Die Fotos zeigen den echten Ort in Castricum, ohne Teilnehmende. Was du hier tust, bleibt auf diesem Gerät.</p>
<p class="q">Wann bist du in der Retreat-Gruppe?</p>${seg('stage', [['t1', 'Tag 1'], ['w2', 'Woche 2'], ['w7', 'Ab 11. Dez.']], S.stage)}
<p class="q-hint">Tag 1 im Retreat, Woche 2 zurück im Alltag, oder nach Woche 6, wenn Reise verschwindet.</p>
<p class="q">Licht</p>${seg('light', [['auto', 'Nach Uhrzeit'], ['day', 'Tag'], ['night', 'Nacht']], S.light)}
<div class="btn-col"><button type="button" class="btn btn-ghost" data-act="replay-invite">Einladung ansehen</button>
<button type="button" class="btn btn-ghost" data-act="reset">Demo zurücksetzen</button></div>`);
  }
  function answerSheet(key) {
    const t1 = key === 'retreat-t1-q';
    const a = S.answers[key] || {};
    const aud = t1
      ? '<p class="q-hint">Nur du und Clara lest deine Antwort. In Woche 6 bekommst du sie zurück.</p><input type="hidden" name="aud" value="clara">'
      : `<p class="q">Wer darf es lesen?</p><div class="seg aud" role="radiogroup">${[['fuenf', 'Deine Fünf'], ['kreis', 'Alle im Kreis'], ['clara', 'Nur Clara']].map(([v, l]) => `<label><input type="radio" name="aud" value="${v}" ${(a.aud || 'fuenf') === v ? 'checked' : ''}><span>${l}</span></label>`).join('')}</div>`;
    openSheet(`${sheetTop(t1 ? 'Clara fragt dich vor dem ersten Kreis' : 'Clara fragt diese Woche')}<form data-form="answer" data-key="${key}"><h2 lang="en">${t1 ? Q1 : Q2}</h2>
<div class="field"><label for="ans" class="sr">Deine Antwort</label><textarea id="ans" name="text" placeholder="Ein paar Sätze reichen. Englisch oder Deutsch.">${esc(a.text || '')}</textarea></div>
${aud}<p class="err" id="ans-err" hidden>Schreib zuerst deine Antwort.</p>
<div class="btn-row"><button type="button" class="btn btn-ghost" data-act="close">Abbrechen</button><button type="submit" class="btn btn-solid">${a.text ? 'Speichern' : 'Antwort teilen'}</button></div></form>`,
    (d) => setTimeout(() => { const t = d.querySelector('textarea'); if (t) t.focus(); }, 60));
  }
  function shareSheet() {
    const p = ui.pending;
    const g = p.g;
    openSheet(`${sheetTop(`Foto teilen in ${esc(G[g].short)}`)}<form data-form="share">
<div class="preview"><img src="${p.data}" alt="Dein ausgewähltes Foto"></div>
<div class="field"><label for="cap">Was ist darauf? <span class="opt">Freiwillig.</span></label><input id="cap" name="cap" maxlength="80" placeholder="${g === 'kula' ? 'Zum Beispiel: Der Tisch nach dem Essen' : 'Zum Beispiel: The field on the last morning'}"></div>
<p class="q" id="soc-q">Darf ${G[g].op} dieses Foto auch auf Social Media zeigen?</p>
<p class="q-hint">Sind Menschen darauf zu sehen, frag sie vorher. Ohne dein Ja bleibt es in der Gruppe.</p>
<div class="yn" role="radiogroup" aria-labelledby="soc-q"><label><input type="radio" name="social" value="yes"><span>Ja</span></label><label><input type="radio" name="social" value="no"><span>Nein</span></label></div>
<p class="err" id="soc-err" hidden>Wähl Ja oder Nein, dann kannst du teilen.</p>
<div class="btn-row"><button type="button" class="btn btn-ghost" data-act="close">Abbrechen</button><button type="submit" class="btn btn-solid">Teilen</button></div></form>`);
  }
  function profSheet(kind) {
    const p = S.prof;
    if (kind === 'name') {
      openSheet(`${sheetTop('Profil')}<form data-form="name"><h2>Vorname</h2><div class="field"><label for="pn">So sehen dich die anderen in deinen Gruppen.</label><input id="pn" name="name" value="${nm()}" autocomplete="given-name" maxlength="40"></div>
<div class="btn-row"><button type="button" class="btn btn-ghost" data-act="close">Abbrechen</button><button type="submit" class="btn btn-solid">Speichern</button></div></form>`);
    } else if (kind === 'dm') {
      openSheet(`${sheetTop('Profil')}<h2>Wer darf dir schreiben?</h2><p class="lede">Nachrichten nur an dich, außerhalb der Gruppe. Das Team erreicht dich immer.</p>
<div class="choices">${radio('dm', 'alle', p.dm, DM_L.alle, '', 'prof')}${radio('dm', 'fuenf', p.dm, DM_L.fuenf, 'Empfohlen in den ersten sechs Wochen.', 'prof')}${radio('dm', 'team', p.dm, DM_L.team, '', 'prof')}</div>
<div class="btn-row"><button type="button" class="btn btn-solid" data-act="close">Fertig</button></div>`);
    } else if (kind === 'email') {
      openSheet(`${sheetTop('Profil')}<h2>E-Mails</h2><p class="lede">Was in deinen Gruppen passiert, als Zusammenfassung.</p>
<div class="choices">${radio('digest', 'tag', p.digest, DIG_L.tag, 'Am Abend, um 19:00.', 'prof')}${radio('digest', 'woche', p.digest, DIG_L.woche, 'Am Sonntagmorgen.', 'prof')}${radio('digest', 'keine', p.digest, DIG_L.keine, '', 'prof')}</div>
<div class="choices">${box('news', p.news, 'Newsletter der Stiftung', 'Freiwillig. Du kannst ihn jederzeit abbestellen.')}</div>
<div class="btn-row"><button type="button" class="btn btn-solid" data-act="close">Fertig</button></div>`);
    } else {
      openSheet(`${sheetTop('Profil')}<h2>Benachrichtigungen</h2><p class="lede">Einzeln und sofort, zusätzlich zur Zusammenfassung.</p>
<div class="choices">${box('replies', p.replies, 'Wenn dir jemand antwortet', '')}${box('meets', p.meets, 'Am Tag vor einem Treffen', '')}</div>
<div class="btn-row"><button type="button" class="btn btn-solid" data-act="close">Fertig</button></div>`);
    }
  }

  // ------------------------------------------------------------------ photos from the phone's library
  function pickPhoto(purpose, g) {
    ui.pick = { purpose, g };
    const f = document.getElementById('filePick');
    f.value = '';
    f.click();
  }
  function downscale(file, max, q) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        const s = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
        const w = Math.round(img.naturalWidth * s), h = Math.round(img.naturalHeight * s);
        const c = document.createElement('canvas');
        c.width = w; c.height = h;
        c.getContext('2d').drawImage(img, 0, 0, w, h);
        URL.revokeObjectURL(url);
        resolve(c.toDataURL('image/jpeg', q));
      };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('decode')); };
      img.src = url;
    });
  }
  document.getElementById('filePick').addEventListener('change', async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file || !ui.pick) return;
    try {
      if (ui.pick.purpose === 'avatar') {
        S.photo = await downscale(file, 320, 0.84);
        save();
        render(true);
        toast('Dein Foto ist da. So erkennen dich die anderen.');
      } else {
        const data = await downscale(file, 1200, 0.8);
        ui.pending = { data, g: ui.pick.g };
        shareSheet();
      }
    } catch (err) {
      toast('Dieses Bild kann der Browser nicht öffnen. Versuch ein anderes.');
    }
  });

  // ------------------------------------------------------------------ actions
  function focusField(id) { const t = document.getElementById(id); if (t) setTimeout(() => t.focus({ preventScroll: true }), 60); }
  const ACT = {
    view(t) {
      const g = current();
      if (!(g in G)) return;
      ui.view[g] = t.dataset.v;
      ui.reply = null;
      render();
      const tabs = document.querySelector('.gtabs');
      if (tabs && window.scrollY > tabs.offsetTop) window.scrollTo(0, tabs.offsetTop);
    },
    open(t) {
      const g = t.dataset.g;
      const v = t.dataset.v === 'start' ? startView(g) : t.dataset.v;
      closeSheet();
      go(g, { view: v, keepView: true, scrollTo: t.dataset.to || null, mark: t.dataset.mark || t.dataset.to || null });
    },
    'open-reply'() {
      closeSheet();
      ui.reply = { key: 'retreat', id: 'q7', who: 'Clara' };
      go('retreat', { view: 'g', keepView: true, keepReply: true, scrollTo: 'm-q7', focus: '#rep' });
    },
    reply(t) {
      const g = current();
      const key = threadKey(g);
      if (ui.reply && ui.reply.id === t.dataset.id) { ui.reply = null; render(true); return; }
      ui.reply = { key, id: t.dataset.id, who: t.dataset.who };
      render(true);
      focusField('rep');
    },
    rsvp(t) {
      const key = t.dataset.key;
      if (t.dataset.v) S.rsvp[key] = t.dataset.v; else delete S.rsvp[key];
      save();
      render(true);
    },
    'read-all'() { S.readAll = true; save(); render(true); },
    answer(t) { answerSheet(t.dataset.key); },
    photo(t) { pickPhoto('album', t.dataset.g); },
    avatar() { pickPhoto('avatar'); },
    rules() { rulesSheet(); },
    privacy() { privacySheet(); },
    info(t) { infoSheet(t.dataset.g); },
    setup(t) { ui.setup = t.dataset.g; closeSheet(); go('einrichten'); },
    after6() {
      S.after6 = !S.after6;
      save();
      render(true);
      toast(S.after6 ? 'Gespeichert. Ab 11. Dezember öffnet sich die Gruppe mit Treffen.' : 'Gespeichert. Ab 11. Dezember öffnet sich die Gruppe mit Gespräch.');
    },
    'preview-w7'() {
      S.stage = 'w7';
      save();
      go('retreat', { view: startView('retreat'), keepView: true });
      setTimeout(() => toast('Demo-Zeit: ab 11. Dezember. Reise ist vorbei.', { label: 'Zurück zu Woche 2', fn: () => { S.stage = 'w2'; save(); ui.view.retreat = startView('retreat'); render(); window.scrollTo(0, 0); } }), 400);
    },
    leave(t) { leaveSheet(t.dataset.g); },
    'leave-yes'(t) {
      const g = t.dataset.g;
      S.member[g] = false;
      save();
      closeSheet();
      go('gruppen');
      setTimeout(() => toast(`Du hast ${G[g].short} verlassen.`, { label: 'Rückgängig', fn: () => { S.member[g] = true; save(); render(true); } }), 300);
    },
    rejoin(t) {
      const g = t.dataset.g;
      S.member[g] = true;
      save();
      ui.view[g] = startView(g);
      if (current() === g) { render(); window.scrollTo(0, 0); } else render(true);
      toast(`Du bist wieder in ${G[g].short}.`);
    },
    close() { closeSheet(); },
    jump(t) { S.stage = t.dataset.stage; save(); ui.view.retreat = startView('retreat'); render(); window.scrollTo(0, 0); toast('Demo-Zeit: Woche 2. Zurück zu Tag 1 im Profil unter Demo-Einstellungen.'); },
    demo() { demoSheet(); },
    'sheet-name'() { profSheet('name'); },
    'sheet-dm'() { profSheet('dm'); },
    'sheet-email'() { profSheet('email'); },
    'sheet-notif'() { profSheet('notif'); },
    'replay-invite'() { closeSheet(); ui.inv = 'cover'; ui.invDraft = null; go('einladung'); },
    reset(t) {
      if (t.dataset.armed !== '1') { t.dataset.armed = '1'; t.textContent = 'Wirklich zurücksetzen? Nochmal tippen.'; t.classList.remove('btn-ghost'); t.classList.add('btn-solid'); return; }
      resetDemo();
      closeSheet();
      if (location.hash === '#start') { render(); window.scrollTo(0, 0); } else location.hash = 'start';
      setTimeout(() => toast('Die Demo beginnt von vorn.'), 300);
    },
    inv(t) {
      if (ui.inv === 'account') captureDraft();
      ui.inv = t.dataset.step;
      render();
      window.scrollTo(0, 0);
    },
    resend() { toast('Wir haben den Link nochmal geschickt.'); },
    join() {
      const d = ui.invDraft || {};
      S.joined = true;
      S.name = (d.name || 'Noor').trim() || 'Noor';
      S.email = d.email || '';
      S.prof.news = !!d.news;
      S.stage = 't1';
      S.member.retreat = true;
      save();
      ui.inv = 'cover';
      ui.back = 'start';
      go('retreat', { view: startView('retreat'), keepView: true });
      setTimeout(() => toast(`Willkommen, ${esc(S.name)}. Du bist in October Practitioners.`), 400);
    },
  };
  function captureDraft() {
    const f = document.querySelector('form[data-form="account"]');
    if (!f) return;
    ui.invDraft = { name: f.name.value, email: f.email.value, consent: f.consent.checked, news: f.news.checked };
  }

  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-act]');
    if (t) {
      const fn = ACT[t.dataset.act];
      if (fn) { e.preventDefault(); fn(t, e); }
      return;
    }
    // tapping the tab you are already on brings you back to its top
    const a = e.target.closest('a[href^="#"]');
    if (a && a.getAttribute('href') === location.hash) { e.preventDefault(); window.scrollTo({ top: 0, behavior: RM.matches ? 'auto' : 'smooth' }); }
  });

  // text fields that send: grow with the text, enable send, Enter sends on a keyboard with Shift for a new line
  const SENDERS = ['say', 'rep', 'dm'];
  document.addEventListener('input', (e) => {
    const t = e.target;
    if (t.form && t.form.dataset.form === 'account') captureDraft();
    if (SENDERS.includes(t.id)) {
      t.style.height = 'auto';
      t.style.height = Math.min(140, t.scrollHeight + 2) + 'px';
      const b = t.form && t.form.querySelector('.send');
      if (b) b.disabled = !t.value.trim();
    }
  });
  document.addEventListener('keydown', (e) => {
    if (SENDERS.includes(e.target.id) && e.key === 'Enter' && !e.shiftKey && !e.isComposing && window.matchMedia('(hover: hover)').matches) {
      e.preventDefault();
      e.target.form.requestSubmit();
    }
  });

  document.addEventListener('change', (e) => {
    const t = e.target;
    const c = t.dataset.change;
    if (!c) return;
    if (c === 'start') {
      S.start[t.dataset.g] = t.value;
      save();
      render(true);
      toast(`Gespeichert. ${G[t.dataset.g].short} öffnet jetzt mit ${LABEL[t.value]}.`);
    } else if (c === 'prof') {
      if (t.type === 'radio') S.prof[t.name] = t.value; else S.prof[t.name] = t.checked;
      save();
      render(true);
      toast('Gespeichert.');
    } else if (c === 'demo-stage') {
      S.stage = t.value;
      save();
      ui.view.retreat = startView('retreat');
      render(true);
    } else if (c === 'demo-light') {
      S.light = t.value;
      save();
      render(true);
    } else if (c === 'inv-draft') {
      captureDraft();
      const b = document.querySelector('form[data-form="account"] [type="submit"]');
      if (b) b.setAttribute('aria-disabled', String(!ui.invDraft.consent));
      if (ui.invDraft.consent) { const er = document.getElementById('consent-err'); if (er) er.hidden = true; }
    }
  });

  document.addEventListener('submit', (e) => {
    const f = e.target;
    const kind = f.dataset.form;
    if (!kind) return;
    e.preventDefault();
    if (kind === 'post') {
      const text = f.text.value.trim();
      if (!text) return;
      const g = f.dataset.g;
      const key = threadKey(g);
      const id = uid();
      const parent = f.dataset.parent || null;
      (S.posts[key] = S.posts[key] || []).push({ id, text, ts: Date.now(), parent });
      const firstIntro = key === 'retreat-t1' && !S.todo.intro;
      if (firstIntro) S.todo.intro = true;
      save();
      ui.reply = null;
      ui.newId = id;
      render(true);
      const el = document.getElementById('m-' + id);
      if (el) el.scrollIntoView({ block: 'center', behavior: RM.matches ? 'auto' : 'smooth' });
      if (firstIntro) {
        const hostParent = parent || id;
        setTimeout(() => { ui.typing = { key, parent: hostParent }; if (current() === g) render(true); }, 900);
        setTimeout(() => {
          ui.typing = null;
          S.replies[key] = { who: 'clara', parent: hostParent, ts: Date.now(), text: 'Thank you, {name}. I am glad you are here. We start at 11:00 in the big room, your cushion is waiting.' };
          save();
          if (current() === g) { render(true); toast('Clara hat dir geantwortet.'); }
        }, 3600);
      }
    } else if (kind === 'answer') {
      const text = f.text.value.trim();
      const err = f.querySelector('#ans-err');
      if (!text) { err.hidden = false; f.text.focus(); return; }
      S.answers[f.dataset.key] = { text, aud: f.aud.value, ts: Date.now() };
      save();
      closeSheet();
      render(true);
      toast(f.aud.value === 'clara' ? 'Deine Antwort ist bei Clara.' : 'Deine Antwort ist geteilt. Du findest sie in Reise.');
    } else if (kind === 'share') {
      const soc = f.querySelector('input[name="social"]:checked');
      if (!soc) { f.querySelector('#soc-err').hidden = false; f.querySelector('input[name="social"]').focus(); return; }
      const p = ui.pending;
      const id = uid();
      let stored = true;
      try { localStorage.setItem(PHOTO_KEY + id, p.data); } catch (err) { stored = false; mem[id] = p.data; }
      S.photos[p.g] = S.photos[p.g] || [];
      S.photos[p.g].push({ id, cap: f.cap.value.trim(), social: soc.value === 'yes', ts: Date.now() });
      save();
      closeSheet();
      ui.pending = null;
      ui.newId = id;
      const msg = stored ? (soc.value === 'yes' ? 'Geteilt, mit deinem Ja für Social Media.' : 'Geteilt. Es bleibt in der Gruppe.') : 'Geteilt. Dieses Gerät hat keinen Platz, es zu behalten, nach dem Neuladen ist es weg.';
      if (current() === p.g) { ui.view[p.g] = 't'; render(true); afterNav({ scrollTo: 'photos-' + p.g }); } else go(p.g, { view: 't', keepView: true, scrollTo: 'photos-' + p.g });
      toast(msg);
    } else if (kind === 'account') {
      captureDraft();
      const d = ui.invDraft;
      let ok = true;
      const show = (id, bad) => { const el = document.getElementById(id); if (el) el.hidden = !bad; if (bad) ok = false; };
      const mailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email.trim());
      show('jn-err', !d.name.trim());
      show('jm-err', !mailOk);
      show('consent-err', !d.consent);
      if (!ok) { (!d.name.trim() ? f.name : !mailOk ? f.email : f.consent).focus(); return; }
      ui.inv = 'mail';
      render();
      window.scrollTo(0, 0);
    } else if (kind === 'name') {
      const v = f.name.value.trim();
      if (v) { S.name = v; save(); closeSheet(); render(true); toast('Gespeichert.'); }
    } else if (kind === 'dm') {
      const v = f.text.value.trim();
      if (!v) return;
      const id = uid();
      const c = f.dataset.chat;
      (S.dms[c] = S.dms[c] || []).push({ id, text: v, ts: Date.now() });
      save();
      ui.newId = id;
      render();
      window.scrollTo(0, document.documentElement.scrollHeight);
      focusField('dm');
    }
  });

  // the light follows the hour: check every few minutes
  setInterval(() => { if (S.light === 'auto') { const l = isNight() ? 'night' : 'day'; const r = current(); if (r !== 'einladung' && l !== document.documentElement.dataset.light) render(true); } }, 5 * 60 * 1000);

  // first paint
  try { history.scrollRestoration = 'manual'; } catch (e) { /* older browsers */ }
  const r0 = current();
  ui.last = r0;
  if (r0 in G) ui.view[r0] = startView(r0);
  ui.opening = r0 === 'start' && !RM.matches;
  render();
  ui.opening = false;
  startOpening();
  window.scrollTo(0, 0);
})();
