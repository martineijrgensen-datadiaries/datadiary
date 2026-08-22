/* ──────────────────────────────────────────────────────────────
   data/diary — DATA BLOCKS
   A pixel easter egg. Every so often a random element on the page
   starts wiggling. Click it and you get to build a customer profile
   out of falling identifier blocks.

   Vanilla JS, no dependencies, no build step.
   ────────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  /* ── Tuning ──────────────────────────────────────────────── */
  var PICK_INTERVAL = 10000;  // ms between picking a new wiggler
  var WIGGLE_TIME   = 10000;  // ms the picked element stays clickable

  var BASE_SPEED    = 95;     // px/sec a block falls at fields = 0
  var SPEED_RAMP    = 0.045;  // +4.5% speed per field ingested
  var SPEED_CAP     = 4;      // never faster than 4x base
  var BASE_SPAWN    = 1100;   // ms between spawns at fields = 0
  var SPAWN_RAMP    = 28;     // ms shaved off per field
  var MIN_SPAWN     = 320;    // never tighter than this
  var BASE_BAD      = 0.12;   // chance a block is a bad one
  var BAD_RAMP      = 0.01;
  var MAX_BAD       = 0.35;
  var BUCKET_KEYS   = 460;    // px/sec the bucket moves under keyboard

  var W = 360, H = 480;       // logical canvas size
  var BLOCK_W = 62, BLOCK_H = 30;
  var BUCKET_W = 72, BUCKET_H = 18;

  var MODE_KEY = 'datadiary-mode';
  var BEST_KEY = 'datadiary-blocks-best';
  var MUTE_KEY = 'datadiary-blocks-muted';

  /* Things that belong in a customer profile. */
  var GOOD = [
    { label: 'CRM ID',       fill: 'sky'   },
    { label: 'COOKIE ID',    fill: 'lime'  },
    { label: 'ORDER ID',     fill: 'coral' },
    { label: 'PURCHASE',     fill: 'sky'   },
    { label: 'WEB VISIT',    fill: 'lime'  },
    { label: 'APP LOGIN',    fill: 'coral' },
    { label: 'EMAIL CLICK',  fill: 'sky'   },
    { label: 'LOYALTY CARD', fill: 'lime'  },
    { label: 'STORE VISIT',  fill: 'coral' },
    { label: 'SEARCH TERM',  fill: 'sky'   },
    { label: 'CART ADD',     fill: 'lime'  },
    { label: 'SUPPORT CHAT', fill: 'coral' }
  ];

  /* Things that very much do not. */
  var BAD = [
    { label: 'PASSWORD',  sin: 'you put a PASSWORD in a customer profile.' },
    { label: 'CC_NUM',    sin: 'you ingested a raw CREDIT CARD NUMBER.' },
    { label: 'CPR_NR',    sin: 'you ingested a CPR number. legal is on line one.' },
    { label: 'RAW_EMAIL', sin: 'you ingested an unhashed EMAIL address.' },
    { label: 'API_KEY',   sin: 'you ingested an API KEY. rotate everything.' },
    { label: 'HEALTH',    sin: 'you ingested HEALTH data. that is regulated.' },
    { label: 'IP_ADDR',   sin: 'you ingested a raw IP ADDRESS.' },
    { label: '🦆', emoji: true, sin: 'you ingested a duck. a literal duck.' },
    { label: '🍩', emoji: true, sin: 'you ingested a donut. tasty. not a customer attribute.' },
    { label: '🦖', emoji: true, sin: 'you ingested a dinosaur. extinct, and not GDPR-relevant either.' }
  ];

  /* ── Small helpers ───────────────────────────────────────── */
  function ls(get, key, val) {
    try { return get ? localStorage.getItem(key) : localStorage.setItem(key, val); }
    catch (e) { return null; }
  }
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function token(name) {
    return getComputedStyle(document.documentElement).getPropertyValue('--' + name).trim();
  }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  /* Splits a label onto as few lines as fit maxWidth. Assumes ctx.font is
     already set. Single words are never split (no hyphenation). */
  function wrapLabel(ctx, text, maxWidth) {
    var words = text.split(' ');
    if (words.length === 1) return [text];
    if (ctx.measureText(text).width <= maxWidth) return [text];

    var lines = [], current = '';
    for (var i = 0; i < words.length; i++) {
      var test = current ? current + ' ' + words[i] : words[i];
      if (ctx.measureText(test).width <= maxWidth) {
        current = test;
      } else {
        if (current) lines.push(current);
        current = words[i];
      }
    }
    if (current) lines.push(current);
    return lines;
  }

  /* ══════════════════════════════════════════════════════════
     PART A — the wiggle scanner
     ══════════════════════════════════════════════════════════ */

  var CANDIDATES = 'p, h1, h2, h3, h4, li, img, blockquote, td, .tag, .mood-card-tape, .logo-icon';

  var wiggling = null;      // currently wiggling element
  var pickTimer = null;
  var stopTimer = null;
  var scannerOn = false;

  function eligible(node) {
    if (node.closest('a, button, input, textarea, .dd-game, .dd-invite, .mode-overlay')) return false;
    if (node.querySelector('a, button')) return false;

    var r = node.getBoundingClientRect();
    // the content column is 680px wide, so the width cap has to clear that.
    // the height cap is what actually keeps us off big layout containers.
    if (r.width < 12 || r.height < 12 || r.width > 900 || r.height > 400) return false;
    // must actually be on screen right now
    if (r.bottom < 0 || r.top > window.innerHeight) return false;
    if (r.right < 0 || r.left > window.innerWidth) return false;

    var cs = getComputedStyle(node);
    if (cs.visibility === 'hidden' || cs.display === 'none' || cs.opacity === '0') return false;
    // we animate `transform`, so skip anything already using it (mood cards, tape)
    if (cs.transform !== 'none') return false;

    return true;
  }

  function unwiggle() {
    if (!wiggling) return;
    wiggling.classList.remove('dd-wiggle');
    wiggling.removeAttribute('title');
    wiggling.removeEventListener('click', onWiggleClick);
    wiggling = null;
  }

  function onWiggleClick() {
    unwiggle();
    stopScanner();
    openInvite();
  }

  function pickOne() {
    unwiggle();
    if (!scannerOn) return;

    var all = document.querySelectorAll(CANDIDATES);
    var ok = [];
    for (var i = 0; i < all.length; i++) {
      if (eligible(all[i])) ok.push(all[i]);
    }
    if (!ok.length) return;

    wiggling = pick(ok);
    wiggling.classList.add('dd-wiggle');
    wiggling.setAttribute('title', '?');
    wiggling.addEventListener('click', onWiggleClick);

    clearTimeout(stopTimer);
    stopTimer = setTimeout(unwiggle, WIGGLE_TIME);
  }

  function startScanner() {
    if (scannerOn) return;
    if (ls(true, MUTE_KEY)) return;        // user said "nah, I'm reading" — leave them alone
    if (!ls(true, MODE_KEY)) return;       // mode picker still up on first visit
    scannerOn = true;
    clearInterval(pickTimer);
    pickTimer = setInterval(pickOne, PICK_INTERVAL);
  }

  function stopScanner() {
    scannerOn = false;
    clearInterval(pickTimer);
    clearTimeout(stopTimer);
    unwiggle();
  }

  /* The mode picker blocks the scanner. Poll until it's answered. */
  function waitForMode() {
    if (ls(true, MODE_KEY)) { startScanner(); return; }
    var t = setInterval(function () {
      if (ls(true, MODE_KEY)) { clearInterval(t); startScanner(); }
    }, 1000);
  }

  /* ══════════════════════════════════════════════════════════
     PART B — the invite prompt
     ══════════════════════════════════════════════════════════ */

  var invite = null;

  function buildInvite() {
    var wrap = el('div', 'dd-invite');
    wrap.setAttribute('role', 'dialog');
    wrap.setAttribute('aria-modal', 'true');
    wrap.setAttribute('aria-label', 'a stray record wants to play');
    var pop  = el('div', 'dd-invite-popup');
    pop.appendChild(el('div', 'dd-invite-tape'));
    pop.appendChild(el('p',  'dd-invite-eyebrow', '⚠ anomaly detected'));
    pop.appendChild(el('h2', 'dd-invite-title', 'a stray record is loose on this page'));
    pop.appendChild(el('p',  'dd-invite-sub', 'it wants to be part of a customer profile. help it?'));

    var row  = el('div', 'dd-invite-choices');
    var yes  = el('button', 'dd-invite-btn dd-invite-yes', "let's build a profile");
    var no   = el('button', 'dd-invite-btn dd-invite-no', "nah, I'm reading");
    row.appendChild(yes);
    row.appendChild(no);
    pop.appendChild(row);

    pop.appendChild(el('p', 'dd-invite-note', 'catch the identifiers. drop nothing. ingest nothing you shouldn’t.'));
    wrap.appendChild(pop);

    yes.addEventListener('click', function () { closeInvite(); openGame(); });
    no.addEventListener('click', function () {
      ls(false, MUTE_KEY, '1');
      closeInvite();
    });
    wrap.addEventListener('click', function (e) {
      if (e.target === wrap) { closeInvite(); startScanner(); }
    });

    document.body.appendChild(wrap);
    return wrap;
  }

  function onInviteKey(e) {
    if (e.key === 'Escape') { closeInvite(); startScanner(); }
  }

  function openInvite() {
    if (!invite) invite = buildInvite();
    invite.style.display = 'flex';
    invite.querySelector('.dd-invite-yes').focus();
    document.addEventListener('keydown', onInviteKey);
  }

  function closeInvite() {
    if (invite) invite.style.display = 'none';
    document.removeEventListener('keydown', onInviteKey);
  }

  /* ══════════════════════════════════════════════════════════
     PART C — the game
     ══════════════════════════════════════════════════════════ */

  var game = null;      // overlay root
  var canvas, ctx, hudFields, hudSpeed, hudBest, overPanel, closeBtn;
  var lastFocus = null;

  /* run state */
  var blocks, bucketX, fields, spawnAcc, raf, lastT, running, keyLeft, keyRight;

  function buildGame() {
    var root = el('div', 'dd-game');
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-modal', 'true');
    root.setAttribute('aria-label', 'Data Blocks');

    var panel = el('div', 'dd-game-panel');

    closeBtn = el('button', 'dd-game-close', '×');
    closeBtn.setAttribute('aria-label', 'close game');
    panel.appendChild(closeBtn);

    var hud = el('div', 'dd-game-hud');
    hudFields = el('span', 'dd-hud-item');
    hudSpeed  = el('span', 'dd-hud-item');
    hudBest   = el('span', 'dd-hud-item');
    hud.appendChild(hudFields);
    hud.appendChild(hudSpeed);
    hud.appendChild(hudBest);
    panel.appendChild(hud);

    var stage = el('div', 'dd-game-stage');
    canvas = el('canvas');
    canvas.id = 'dd-game-canvas';
    canvas.setAttribute('aria-label', 'falling blocks game area');
    stage.appendChild(canvas);

    overPanel = el('div', 'dd-game-over');
    overPanel.style.display = 'none';
    stage.appendChild(overPanel);

    panel.appendChild(stage);
    panel.appendChild(el('p', 'dd-game-hint', 'move: mouse, drag, or ← →   ·   quit: esc'));
    root.appendChild(panel);
    document.body.appendChild(root);

    ctx = canvas.getContext('2d');
    sizeCanvas();

    closeBtn.addEventListener('click', closeGame);
    root.addEventListener('click', function (e) { if (e.target === root) closeGame(); });
    canvas.addEventListener('mousemove', onPointer);
    canvas.addEventListener('touchstart', onPointer, { passive: true });
    canvas.addEventListener('touchmove', onPointer, { passive: true });
    window.addEventListener('resize', sizeCanvas);

    return root;
  }

  function sizeCanvas() {
    if (!canvas) return;
    var dpr = Math.min(window.devicePixelRatio || 1, 3);
    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;
  }

  function onPointer(e) {
    if (!running) return;
    var pt = e.touches ? e.touches[0] : e;
    var r = canvas.getBoundingClientRect();
    var x = (pt.clientX - r.left) / r.width * W;
    bucketX = clampBucket(x - BUCKET_W / 2);
  }

  function clampBucket(x) {
    return Math.max(0, Math.min(W - BUCKET_W, x));
  }

  function onKeyDown(e) {
    if (e.key === 'Escape') { closeGame(); return; }
    if (e.key === 'ArrowLeft'  || e.key === 'a' || e.key === 'A') { keyLeft = true;  e.preventDefault(); }
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') { keyRight = true; e.preventDefault(); }
  }
  function onKeyUp(e) {
    if (e.key === 'ArrowLeft'  || e.key === 'a' || e.key === 'A') keyLeft = false;
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keyRight = false;
  }

  function openGame() {
    lastFocus = document.activeElement;
    if (!game) game = buildGame();
    game.style.display = 'flex';
    document.body.classList.add('dd-game-open');
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    document.addEventListener('visibilitychange', onVisibility);
    stopScanner();
    closeBtn.focus();
    resetRun();
  }

  function closeGame() {
    running = false;
    cancelAnimationFrame(raf);
    if (game) game.style.display = 'none';
    document.body.classList.remove('dd-game-open');
    document.removeEventListener('keydown', onKeyDown);
    document.removeEventListener('keyup', onKeyUp);
    document.removeEventListener('visibilitychange', onVisibility);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
    startScanner();
  }

  function onVisibility() {
    if (document.hidden) {
      running = false;
      cancelAnimationFrame(raf);
    } else if (overPanel.style.display === 'none' && game.style.display !== 'none') {
      running = true;
      lastT = performance.now();
      raf = requestAnimationFrame(tick);
    }
  }

  function best() { return parseInt(ls(true, BEST_KEY), 10) || 0; }

  function resetRun() {
    blocks   = [];
    bucketX  = (W - BUCKET_W) / 2;
    fields   = 0;
    spawnAcc = 0;
    keyLeft  = keyRight = false;
    overPanel.style.display = 'none';
    running  = true;
    lastT    = performance.now();
    updateHud();
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(tick);
  }

  function speedMult() {
    return Math.min(SPEED_CAP, 1 + fields * SPEED_RAMP);
  }

  function updateHud() {
    hudFields.textContent = 'FIELDS: ' + fields;
    hudSpeed.textContent  = 'SPEED: ' + speedMult().toFixed(1) + 'x';
    hudBest.textContent   = 'BEST: ' + best();
  }

  function spawn() {
    var bad = Math.random() < Math.min(MAX_BAD, BASE_BAD + fields * BAD_RAMP);
    var def = bad ? pick(BAD) : pick(GOOD);
    blocks.push({
      x: Math.random() * (W - BLOCK_W),
      y: -BLOCK_H,
      bad: bad,
      def: def
    });
  }

  function tick(now) {
    if (!running) return;
    var dt = Math.min((now - lastT) / 1000, 0.05);  // clamp so a stalled tab can't teleport blocks
    lastT = now;

    /* keyboard movement */
    if (keyLeft)  bucketX = clampBucket(bucketX - BUCKET_KEYS * dt);
    if (keyRight) bucketX = clampBucket(bucketX + BUCKET_KEYS * dt);

    /* spawning */
    spawnAcc += dt * 1000;
    var every = Math.max(MIN_SPAWN, BASE_SPAWN - fields * SPAWN_RAMP);
    if (spawnAcc >= every) { spawnAcc = 0; spawn(); }

    /* movement + collisions */
    var fall = BASE_SPEED * speedMult();
    var bucketTop = H - BUCKET_H - 6;

    for (var i = blocks.length - 1; i >= 0; i--) {
      var b = blocks[i];
      b.y += fall * dt;

      var overlapsBucket =
        b.y + BLOCK_H >= bucketTop &&
        b.y + BLOCK_H <= bucketTop + BUCKET_H + 8 &&
        b.x + BLOCK_W > bucketX &&
        b.x < bucketX + BUCKET_W;

      if (overlapsBucket) {
        if (b.bad) { draw(); return gameOver('PROFILE REJECTED', b.def.sin); }
        blocks.splice(i, 1);
        fields++;
        updateHud();
        continue;
      }

      if (b.y > H) {
        if (!b.bad) {
          draw();
          return gameOver('INSUFFICIENT DATA', 'you dropped ' + b.def.label + '. the profile is incomplete.');
        }
        blocks.splice(i, 1);  // dropping a bad block is the correct move
      }
    }

    draw();
    raf = requestAnimationFrame(tick);
  }

  /* ── Rendering: rectangles only, nothing else ───────────── */
  function draw() {
    var ink   = token('ink')   || '#1a1a2e';
    var cream = token('cream') || '#faf7f0';

    ctx.fillStyle = cream;
    ctx.fillRect(0, 0, W, H);

    /* faint pixel grid so the play area reads as a screen */
    ctx.fillStyle = token('border') || 'rgba(0,0,0,.12)';
    for (var gx = 0; gx < W; gx += 24) ctx.fillRect(gx, 0, 1, H);
    for (var gy = 0; gy < H; gy += 24) ctx.fillRect(0, gy, W, 1);

    /* blocks */
    for (var i = 0; i < blocks.length; i++) {
      var b = blocks[i];
      var x = Math.round(b.x), y = Math.round(b.y);

      ctx.fillStyle = b.bad ? ink : (token(b.def.fill) || '#ccc');
      ctx.fillRect(x, y, BLOCK_W, BLOCK_H);

      ctx.fillStyle = b.bad ? cream : ink;
      ctx.fillRect(x, y, BLOCK_W, 3);
      ctx.fillRect(x, y + BLOCK_H - 3, BLOCK_W, 3);
      ctx.fillRect(x, y, 3, BLOCK_H);
      ctx.fillRect(x + BLOCK_W - 3, y, 3, BLOCK_H);

      /* bad blocks get a chunky warning notch so colour isn't the only tell */
      if (b.bad) {
        ctx.fillStyle = token('coral') || '#e5533d';
        ctx.fillRect(x + 5, y + 5, 4, 10);
        ctx.fillRect(x + 5, y + 17, 4, 4);
      }

      /* emoji (duck, donut, dinosaur) get room to actually read at this size */
      ctx.fillStyle = b.bad ? cream : ink;
      var fontSize = b.def.emoji ? 16 : 9;
      ctx.font = '700 ' + fontSize + 'px ' + (token('font-mono') || 'monospace');
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      var labelX = x + BLOCK_W / 2 + (b.bad ? 3 : 0);
      if (b.def.emoji) {
        ctx.fillText(b.def.label, labelX, y + BLOCK_H / 2 + 1);
      } else {
        /* two-word labels (COOKIE ID, LOYALTY CARD...) stack onto two lines */
        var lines = wrapLabel(ctx, b.def.label, BLOCK_W - 8);
        var lineHeight = fontSize + 2;
        var startY = y + BLOCK_H / 2 + 1 - ((lines.length - 1) * lineHeight) / 2;
        for (var li = 0; li < lines.length; li++) {
          ctx.fillText(lines[li], labelX, startY + li * lineHeight);
        }
      }
    }

    /* bucket */
    var bx = Math.round(bucketX), by = H - BUCKET_H - 6;
    ctx.fillStyle = ink;
    ctx.fillRect(bx, by, BUCKET_W, BUCKET_H);
    ctx.fillStyle = token('lime') || '#c6f24e';
    ctx.fillRect(bx, by, BUCKET_W, 4);

    ctx.fillStyle = cream;
    ctx.font = '700 8px ' + (token('font-mono') || 'monospace');
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('PROFILE', bx + BUCKET_W / 2, by + BUCKET_H / 2 + 3);

    /* floor */
    ctx.fillStyle = ink;
    ctx.fillRect(0, H - 4, W, 4);
  }

  function gameOver(headline, detail) {
    running = false;
    cancelAnimationFrame(raf);

    if (fields > best()) ls(false, BEST_KEY, String(fields));
    updateHud();

    overPanel.innerHTML = '';
    overPanel.appendChild(el('p', 'dd-over-head', headline));
    overPanel.appendChild(el('p', 'dd-over-detail', detail));
    overPanel.appendChild(el('p', 'dd-over-score', fields + ' fields ingested · best ' + best()));

    var row   = el('div', 'dd-over-actions');
    var again = el('button', 'dd-invite-btn dd-invite-yes', 'run it again');
    var out   = el('button', 'dd-invite-btn dd-invite-no', 'close');
    row.appendChild(again);
    row.appendChild(out);
    overPanel.appendChild(row);
    overPanel.style.display = 'flex';

    again.addEventListener('click', resetRun);
    out.addEventListener('click', closeGame);
    again.focus();
  }

  /* ── Boot ────────────────────────────────────────────────── */
  /* Console escape hatch: dataBlocks.play() skips straight to the game,
     dataBlocks.wiggleNow() forces a pick instead of waiting for the timer. */
  window.dataBlocks = { play: openGame, wiggleNow: pickOne };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', waitForMode);
  } else {
    waitForMode();
  }
})();
