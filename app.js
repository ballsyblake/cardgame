/*
 * FutsalMe: a browser-only futsal card game.
 * No server or database. Everything is saved on this device in localStorage.
 * All players, referees and teams are made up.
 */
(() => {
  'use strict';

  // ---------- Game rules (tweak these) ----------
  const SAVE_KEY = 'futsalme.v1';
  const MATCH_MINUTES = 40;            // futsal: two 20-minute halves
  const TICK_MS = 450;                 // real time per match minute
  const PACK_SIZE = 5;
  const PACKS = {
    bronze: { label: 'Bronze pack', price: 100, odds: { bronze: 75, silver: 22, gold: 3 } },
    silver: { label: 'Silver pack', price: 250, odds: { bronze: 40, silver: 50, gold: 10 } },
    gold:   { label: 'Gold pack',   price: 500, odds: { bronze: 10, silver: 55, gold: 35 } },
  };
  const DUPLICATE_COINS = { bronze: 10, silver: 25, gold: 60 };
  const REWARD = { win: 100, draw: 50, loss: 25 };
  const STARTER_PACKS = ['bronze', 'bronze', 'silver'];
  // What can happen in one match minute, and how likely (weights, not percentages).
  const EVENTS = [['', 60], ['Shot wide', 12], ['Great save', 8], ['Foul', 5], ['Goal', 15]];

  const PLAYER_STATS = [['speed', 'SPE'], ['stamina', 'STA'], ['strength', 'STR'], ['passing', 'PAS'], ['shooting', 'SHO'], ['dribbling', 'DRI']];
  const REF_STATS = [['speed', 'SPE'], ['stamina', 'STA'], ['communication', 'COM'], ['decisions', 'D-M'], ['positioning', 'POS'], ['whistle', 'WHI']];

  // Rows of the pitch from attack (top) to defence; the keeper is always the last slot.
  const FORMATIONS = {
    square:  { label: 'Square',  rows: [2, 2] },
    diamond: { label: 'Diamond', rows: [1, 2, 1] },
    pyramid: { label: 'Pyramid', rows: [1, 1, 2] },
    theY:    { label: 'The Y',   rows: [2, 1, 1] },
  };

  // ---------- Card set: generated from a fixed seed, so it is the same for everyone ----------
  function mulberry32(a) {
    return () => {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const FIRST = ['Ari', 'Bex', 'Cato', 'Dani', 'Eli', 'Finn', 'Gus', 'Hana', 'Idris', 'Jules', 'Kit', 'Lena', 'Milo', 'Nia', 'Otis', 'Pia', 'Quinn', 'Remy', 'Sol', 'Tess', 'Uma', 'Vik', 'Wren', 'Xavi', 'Yara', 'Zeke', 'Bo', 'Cleo', 'Dex', 'Esme'];
  const LAST = ['Ashdown', 'Birch', 'Calloway', 'Drummond', 'Everly', 'Fenwick', 'Garrow', 'Hollis', 'Ironside', 'Jarvis', 'Kestrel', 'Lockhart', 'Marlowe', 'Northam', 'Oakes', 'Pemberton', 'Quill', 'Rooke', 'Sorrel', 'Thackeray', 'Underhill', 'Vance', 'Wetherby', 'Yarrow', 'Zeller', 'Ambrose', 'Blythe', 'Corwin', 'Dunmore', 'Ellery'];
  const CLUBS = ['Northside Wolves', 'Harbour City', 'Ironbark United', 'Lakeside Lions', 'Redgum Rovers', 'Southbank FC', 'Granite Town', 'Kingfisher Athletic', 'Saltwater Sharks', 'Highfield Hornets'];

  const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
  const tierOf = rank => (rank <= 50 ? 'bronze' : rank < 75 ? 'silver' : 'gold');

  function buildCards() {
    const r = mulberry32(20211223);
    const cards = [];
    const used = new Set();
    for (let i = 0; i < 60; i++) {
      const type = i < 48 ? 'player' : 'referee';
      const roll = r();
      const base = roll < 0.5 ? 32 + r() * 16 : roll < 0.85 ? 54 + r() * 18 : 77 + r() * 14;
      const defs = type === 'player' ? PLAYER_STATS : REF_STATS;
      const stats = {};
      let sum = 0;
      for (const [key] of defs) {
        stats[key] = Math.round(clamp(base + (r() - 0.5) * 18, 20, 99));
        sum += stats[key];
      }
      let name;
      do { name = FIRST[Math.floor(r() * FIRST.length)] + ' ' + LAST[Math.floor(r() * LAST.length)]; } while (used.has(name));
      used.add(name);
      const rank = Math.round(sum / defs.length);
      cards.push({ id: 'c' + i, type, name, stats, rank, tier: tierOf(rank), hue: Math.floor(r() * 360) });
    }
    return cards;
  }
  const CARDS = buildCards();
  const CARD = Object.fromEntries(CARDS.map(c => [c.id, c]));

  // ---------- Saved state ----------
  function freshState() {
    return { name: '', coins: 0, packs: [...STARTER_PACKS], owned: {}, formation: 'square', lineup: [null, null, null, null, null], referee: null, record: { win: 0, draw: 0, loss: 0 } };
  }
  function load() {
    try {
      const raw = JSON.parse(localStorage.getItem(SAVE_KEY));
      if (raw && typeof raw === 'object') {
        const s = Object.assign(freshState(), raw);
        s.lineup = (Array.isArray(s.lineup) ? s.lineup : []).slice(0, 5).map(id => (CARD[id] && s.owned[id] ? id : null));
        while (s.lineup.length < 5) s.lineup.push(null);
        if (!CARD[s.referee] || !s.owned[s.referee]) s.referee = null;
        if (!FORMATIONS[s.formation]) s.formation = 'square';
        s.packs = (Array.isArray(s.packs) ? s.packs : []).filter(p => PACKS[p]);
        return s;
      }
    } catch (e) { /* no save, or storage blocked */ }
    return freshState();
  }
  let state = load();
  function save() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch (e) { /* private mode: play without saving */ }
  }

  // ---------- Helpers ----------
  const $ = sel => document.querySelector(sel);
  const view = $('#view');
  const overlay = $('#overlay');
  const esc = s => String(s).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  function weighted(pairs) {
    const total = pairs.reduce((n, p) => n + p[1], 0);
    let roll = Math.random() * total;
    for (const [value, weight] of pairs) { roll -= weight; if (roll < 0) return value; }
    return pairs[pairs.length - 1][0];
  }
  const ownedCards = type => CARDS.filter(c => state.owned[c.id] && (!type || c.type === type));
  const surname = c => c.name.split(' ')[1];

  function teamRating() {
    const players = state.lineup.map(id => CARD[id]).filter(Boolean);
    if (!players.length) return 0;
    const avg = players.reduce((n, c) => n + c.rank, 0) / players.length;
    return Math.round(avg + refBonus());
  }
  // A good referee card nudges your rating up a little; a poor one nudges it down.
  function refBonus() {
    const ref = CARD[state.referee];
    return ref ? Math.round((ref.rank - 50) / 10) : 0;
  }
  const teamFull = () => state.lineup.every(Boolean);

  function avatar(c) {
    const initials = c.name.split(' ').map(w => w[0]).join('');
    return `<span class="avatar ${c.type}" style="--h:${c.hue}">${esc(initials)}</span>`;
  }
  function cardHTML(c, opts = {}) {
    const defs = c.type === 'player' ? PLAYER_STATS : REF_STATS;
    const stats = defs.map(([k, label]) => `<li><b>${c.stats[k]}</b> ${label}</li>`).join('');
    return `<article class="card ${c.tier} ${c.type}${opts.cls ? ' ' + opts.cls : ''}"${opts.attrs || ''}>
      <header><span class="rank">${c.rank}</span><span class="kind">${c.type === 'player' ? 'Player' : 'Referee'}</span></header>
      ${avatar(c)}
      <h3>${esc(c.name)}</h3>
      <ul class="stats">${stats}</ul>
      ${opts.tag ? `<p class="tag">${esc(opts.tag)}</p>` : ''}
    </article>`;
  }
  function lockedHTML(c) {
    return `<article class="card locked ${c.tier}"><header><span class="rank">?</span><span class="kind">${c.tier}</span></header><span class="avatar">?</span><h3>Not found yet</h3></article>`;
  }

  // ---------- Views ----------
  let current = 'home';
  let matchTimer = null;
  const views = {};

  function go(name) {
    if (matchTimer) { clearInterval(matchTimer); matchTimer = null; }
    current = views[name] ? name : 'home';
    closeOverlay();
    render();
    window.scrollTo(0, 0);
  }
  function render() {
    $('#coins').textContent = state.coins + ' coins';
    document.querySelectorAll('#tabs button').forEach(b => b.classList.toggle('on', b.dataset.go === current));
    views[current]();
  }

  views.home = () => {
    const owned = ownedCards().length;
    const r = state.record;
    const first = owned === 0;
    view.innerHTML = `
      <section class="hero">
        <h1>${state.name ? 'Welcome back, ' + esc(state.name) : 'Welcome to FutsalMe'}</h1>
        <p>${first ? 'Open your starter packs, pick five players and play your first match.' : 'Build the best five-a-side team you can.'}</p>
        <button class="btn primary" data-go="${first ? 'packs' : teamFull() ? 'play' : 'team'}">${first ? 'Open starter packs' : teamFull() ? 'Play a match' : 'Pick your team'}</button>
      </section>
      <section class="tiles">
        <div><b>${teamRating()}</b><span>Team rating</span></div>
        <div><b>${owned}/${CARDS.length}</b><span>Cards found</span></div>
        <div><b>${r.win}-${r.draw}-${r.loss}</b><span>Won-drawn-lost</span></div>
        <div><b>${state.packs.length}</b><span>Unopened packs</span></div>
      </section>
      <section class="panel">
        <h2>Account</h2>
        <label for="name">Manager name</label>
        <div class="row"><input id="name" maxlength="20" autocomplete="off" value="${esc(state.name)}" placeholder="Your name"><button class="btn" id="saveName">Save</button></div>
        <p class="hint">Your progress is saved in this browser only. Clearing site data or switching device starts you again.</p>
        <button class="btn danger" id="reset">Reset all progress</button>
      </section>`;
    $('#saveName').onclick = () => { state.name = $('#name').value.trim().slice(0, 20); save(); render(); };
    $('#reset').onclick = () => {
      if (confirm('Delete your cards, coins and results and start again?')) { state = freshState(); save(); render(); }
    };
  };

  views.team = () => {
    const f = FORMATIONS[state.formation];
    let slot = 0;
    const slotHTML = (i, label) => {
      const c = CARD[state.lineup[i]];
      return `<button class="slot ${c ? c.tier : 'empty'}" data-slot="${i}" aria-label="${label}">
        ${c ? `${avatar(c)}<b>${c.rank}</b><span>${esc(surname(c))}</span>` : `<span class="plus">+</span><span>${label}</span>`}</button>`;
    };
    const rows = f.rows.map(n => `<div class="prow">${Array.from({ length: n }, () => slotHTML(slot++, 'Outfield')).join('')}</div>`).join('');
    const ref = CARD[state.referee];
    view.innerHTML = `
      <section class="bar">
        <h1>Team rating ${teamRating()}</h1>
        <label>Formation
          <select id="formation">${Object.entries(FORMATIONS).map(([k, v]) => `<option value="${k}"${k === state.formation ? ' selected' : ''}>${v.label}</option>`).join('')}</select>
        </label>
      </section>
      <section class="pitch">${rows}<div class="prow">${slotHTML(4, 'Keeper')}</div></section>
      <section class="panel refrow">
        <button class="slot ${ref ? ref.tier : 'empty'}" data-slot="ref" aria-label="Referee">${ref ? `${avatar(ref)}<b>${ref.rank}</b><span>${esc(surname(ref))}</span>` : '<span class="plus">+</span><span>Referee</span>'}</button>
        <p>Your match referee. A strong referee adds to your rating, a weak one takes away. Now: <b>${refBonus() >= 0 ? '+' : ''}${refBonus()}</b></p>
      </section>
      <div class="row"><button class="btn" id="best">Pick my best team</button><button class="btn primary" data-go="play"${teamFull() ? '' : ' disabled'}>Play</button></div>
      <p class="hint">Tap a spot to choose a card. Formation changes the shape only, not your rating.</p>`;
    $('#formation').onchange = e => { state.formation = e.target.value; save(); render(); };
    $('#best').onclick = () => {
      const best = ownedCards('player').sort((a, b) => b.rank - a.rank).slice(0, 5).map(c => c.id);
      state.lineup = [0, 1, 2, 3, 4].map(i => best[i] || null);
      const refs = ownedCards('referee').sort((a, b) => b.rank - a.rank);
      state.referee = refs[0] ? refs[0].id : null;
      save(); render();
    };
    view.querySelectorAll('.slot').forEach(b => { b.onclick = () => openPicker(b.dataset.slot); });
  };

  function openPicker(slot) {
    const isRef = slot === 'ref';
    const currentId = isRef ? state.referee : state.lineup[+slot];
    const taken = new Set(state.lineup);
    const options = ownedCards(isRef ? 'referee' : 'player').filter(c => c.id === currentId || !taken.has(c.id)).sort((a, b) => b.rank - a.rank);
    showOverlay(`
      <div class="sheet">
        <header><h2>Choose a ${isRef ? 'referee' : 'player'}</h2><button class="btn" data-close>Close</button></header>
        ${currentId ? '<button class="btn danger" id="clear">Remove from team</button>' : ''}
        ${options.length ? `<div class="grid">${options.map(c => cardHTML(c, { cls: 'tap' + (c.id === currentId ? ' chosen' : ''), attrs: ` data-id="${c.id}" tabindex="0" role="button"` })).join('')}</div>`
          : `<p class="hint">No ${isRef ? 'referee' : 'spare player'} cards yet. Open packs to find more.</p>`}
      </div>`);
    const set = id => { if (isRef) state.referee = id; else state.lineup[+slot] = id; save(); closeOverlay(); render(); };
    const clear = overlay.querySelector('#clear');
    if (clear) clear.onclick = () => set(null);
    overlay.querySelectorAll('.card.tap').forEach(el => {
      el.onclick = () => set(el.dataset.id);
      el.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); set(el.dataset.id); } };
    });
  }

  let cardFilter = 'all';
  let cardSearch = '';
  views.cards = () => {
    const owned = ownedCards().length;
    view.innerHTML = `
      <section class="bar"><h1>Cards</h1><span>${owned} of ${CARDS.length} found (${Math.round(owned / CARDS.length * 100)}%)</span></section>
      <div class="meter"><i style="width:${owned / CARDS.length * 100}%"></i></div>
      <input id="search" type="search" placeholder="Search by name" value="${esc(cardSearch)}" aria-label="Search cards">
      <div class="chips">${[['all', 'All'], ['owned', 'Found'], ['player', 'Players'], ['referee', 'Referees']].map(([k, l]) => `<button class="chip${cardFilter === k ? ' on' : ''}" data-f="${k}">${l}</button>`).join('')}</div>
      <div class="grid" id="grid"></div>`;
    const draw = () => {
      const q = cardSearch.toLowerCase();
      const list = CARDS.filter(c => (cardFilter === 'all' || (cardFilter === 'owned' ? state.owned[c.id] : c.type === cardFilter)))
        .filter(c => !q || (state.owned[c.id] && c.name.toLowerCase().includes(q)))
        .sort((a, b) => b.rank - a.rank);
      $('#grid').innerHTML = list.length ? list.map(c => (state.owned[c.id] ? cardHTML(c) : lockedHTML(c))).join('') : '<p class="hint">No cards match.</p>';
    };
    draw();
    $('#search').oninput = e => { cardSearch = e.target.value; draw(); };
    view.querySelectorAll('.chip').forEach(b => { b.onclick = () => { cardFilter = b.dataset.f; render(); }; });
  };

  views.packs = () => {
    view.innerHTML = `
      <section class="bar"><h1>Packs</h1><span>${state.packs.length} unopened</span></section>
      ${state.packs.length ? `<div class="packs">${state.packs.map((p, i) => `<button class="pack ${p}" data-open="${i}"><b>${PACKS[p].label}</b><span>${PACK_SIZE} cards</span><em>Tap to open</em></button>`).join('')}</div>`
        : '<p class="hint">No packs to open. Win matches to earn coins, then buy more below.</p>'}
      <section class="panel">
        <h2>Shop</h2>
        ${Object.entries(PACKS).map(([k, p]) => `<div class="shop"><div><b>${p.label}</b><span>Gold chance ${p.odds.gold}%, silver ${p.odds.silver}%</span></div><button class="btn" data-buy="${k}"${state.coins < p.price ? ' disabled' : ''}>${p.price} coins</button></div>`).join('')}
        <p class="hint">Each pack has ${PACK_SIZE} cards, at least 4 of them players. Duplicates are swapped for coins.</p>
      </section>`;
    view.querySelectorAll('[data-open]').forEach(b => { b.onclick = () => openPack(+b.dataset.open); });
    view.querySelectorAll('[data-buy]').forEach(b => {
      b.onclick = () => {
        const p = PACKS[b.dataset.buy];
        if (state.coins < p.price) return;
        state.coins -= p.price; state.packs.push(b.dataset.buy); save(); render();
      };
    });
  };

  function drawCard(kind, type) {
    const odds = PACKS[kind].odds;
    const tier = weighted(Object.entries(odds));
    let pool = CARDS.filter(c => c.tier === tier && (!type || c.type === type));
    if (!pool.length) pool = CARDS.filter(c => !type || c.type === type);
    return pick(pool);
  }
  function openPack(index) {
    const kind = state.packs[index];
    if (!kind) return;
    state.packs.splice(index, 1);
    const pulls = [];
    for (let i = 0; i < PACK_SIZE; i++) {
      const c = drawCard(kind, i < PACK_SIZE - 1 ? 'player' : (Math.random() < 0.5 ? 'referee' : null));
      let tag = 'New';
      if (state.owned[c.id]) { state.coins += DUPLICATE_COINS[c.tier]; tag = 'Duplicate +' + DUPLICATE_COINS[c.tier] + ' coins'; }
      else state.owned[c.id] = 1;
      pulls.push({ c, tag });
    }
    save();   // saved before the reveal, so closing the page cannot lose the cards
    showOverlay(`
      <div class="sheet reveal">
        <header><h2>${PACKS[kind].label}</h2><button class="btn" id="all">Reveal all</button></header>
        <div class="grid">${pulls.map((p, i) => `<div class="flip" data-i="${i}" tabindex="0" role="button" aria-label="Reveal card ${i + 1}"><div class="back ${kind}">?</div>${cardHTML(p.c, { tag: p.tag })}</div>`).join('')}</div>
        <button class="btn primary" data-close>Done</button>
      </div>`, true);
    const flip = el => el.classList.add('open');
    overlay.querySelectorAll('.flip').forEach(el => {
      el.onclick = () => flip(el);
      el.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(el); } };
    });
    overlay.querySelector('#all').onclick = () => overlay.querySelectorAll('.flip').forEach(flip);
  }

  views.play = () => {
    if (!teamFull()) {
      view.innerHTML = `<section class="hero"><h1>Pick five players first</h1><p>You need a full team before you can play.</p><button class="btn primary" data-go="${ownedCards('player').length >= 5 ? 'team' : 'packs'}">${ownedCards('player').length >= 5 ? 'Pick your team' : 'Open packs'}</button></section>`;
      return;
    }
    const mine = { name: state.name ? state.name + "'s Five" : 'Your Five', rating: teamRating(), players: state.lineup.map(id => surname(CARD[id])) };
    const opp = { name: pick(CLUBS), rating: clamp(mine.rating + Math.round((Math.random() - 0.5) * 16), 25, 97), players: Array.from({ length: 5 }, () => pick(LAST)) };
    view.innerHTML = `
      <section class="score">
        <div><span>${esc(mine.name)}</span><small>Rating ${mine.rating}</small></div>
        <b id="sc">0 - 0</b>
        <div><span>${esc(opp.name)}</span><small>Rating ${opp.rating}</small></div>
      </section>
      <p class="clock" id="clock">Ready</p>
      <div class="row"><button class="btn primary" id="kick">Kick off</button><button class="btn" id="skip" hidden>Skip to full time</button></div>
      <ol class="feed" id="feed" aria-live="polite"></ol>`;
    const feed = $('#feed');
    const say = (text, cls) => { const li = document.createElement('li'); li.textContent = text; if (cls) li.className = cls; feed.prepend(li); };
    let minute = 0;
    const score = [0, 0];
    const adv = mine.rating - opp.rating;

    function tick() {
      minute++;
      const event = weighted(EVENTS);
      if (event) {
        // The better team is more likely to score; other events are a coin toss.
        const side = event === 'Goal' ? weighted([[0, Math.max(15, 100 + adv * 4)], [1, Math.max(15, 100 - adv * 4)]]) : (Math.random() < 0.5 ? 0 : 1);
        const team = side === 0 ? mine : opp;
        if (event === 'Goal') { score[side]++; $('#sc').textContent = score[0] + ' - ' + score[1]; }
        say(`${minute}' ${event}${event === 'Goal' ? '!' : ''} ${pick(team.players)} (${team.name})`, event === 'Goal' ? (side === 0 ? 'goal us' : 'goal them') : '');
      }
      $('#clock').textContent = minute + "'";
      if (minute === MATCH_MINUTES / 2) say('Half time: ' + score[0] + ' - ' + score[1], 'mark');
      if (minute >= MATCH_MINUTES) finish();
    }
    function finish() {
      clearInterval(matchTimer); matchTimer = null;
      const result = score[0] > score[1] ? 'win' : score[0] < score[1] ? 'loss' : 'draw';
      state.record[result]++; state.coins += REWARD[result]; save();
      $('#coins').textContent = state.coins + ' coins';
      $('#clock').textContent = 'Full time';
      say(`Full time. ${result === 'win' ? 'You won' : result === 'loss' ? 'You lost' : 'A draw'}: +${REWARD[result]} coins`, 'mark');
      $('#skip').hidden = true;
      const kick = $('#kick');
      kick.hidden = false; kick.textContent = 'Play again'; kick.onclick = () => render();
    }
    $('#kick').onclick = () => {
      $('#kick').hidden = true; $('#skip').hidden = false;
      say('Kick off', 'mark');
      matchTimer = setInterval(tick, TICK_MS);
    };
    $('#skip').onclick = () => { clearInterval(matchTimer); matchTimer = null; while (minute < MATCH_MINUTES) tick(); };
  };

  // ---------- Overlay (card picker, pack reveal) ----------
  function showOverlay(html, modal) {
    overlay.innerHTML = html;
    overlay.hidden = false;
    overlay.dataset.modal = modal ? '1' : '';
    document.body.classList.add('noscroll');
    overlay.querySelectorAll('[data-close]').forEach(b => { b.onclick = () => { closeOverlay(); render(); }; });
    const focus = overlay.querySelector('button, [tabindex]');
    if (focus) focus.focus();
  }
  function closeOverlay() {
    overlay.hidden = true; overlay.innerHTML = '';
    document.body.classList.remove('noscroll');
  }
  overlay.addEventListener('click', e => { if (e.target === overlay && !overlay.dataset.modal) closeOverlay(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !overlay.hidden) { closeOverlay(); render(); } });
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-go]');
    if (b && !b.disabled) go(b.dataset.go);
  });

  render();
})();
