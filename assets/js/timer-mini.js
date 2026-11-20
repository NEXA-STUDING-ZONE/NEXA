(function () {
  'use strict';
  const stage = document.getElementById('fxStage');
  const openBtn = document.getElementById('fxMini');
  if (!stage || !openBtn) return;

  const stageHome = stage.parentNode;
  const stageAnchor = stage.nextSibling;

  const KEY_FLAG = 'nexa.fx.mini';
  const KEY_POS = 'nexa.fx.miniPos';
  const KEY_BPOS = 'nexa.fx.miniBubblePos';
  const FIXED_W = 560;
  const FIXED_H = 340;
  const L = (en, ar) => (document.documentElement.lang === 'ar' ? ar : en);

  const bar = document.createElement('div');
  bar.className = 'nx-mini-bar';
  bar.innerHTML =
    '<span class="nx-grip" aria-hidden="true"><i></i><i></i><i></i><i></i></span>' +
    '<span class="nx-lbl" id="nxMiniLbl"></span>' +
    '<button type="button" id="nxMiniHide" aria-label=""><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg></button>' +
    '<button type="button" id="nxMiniOpen" aria-label=""><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 4h6v6M20 4l-7 7M10 20H4v-6M4 20l7-7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>' +
    '<button type="button" id="nxMiniX" aria-label="">&times;</button>';
  stage.append(bar);

  const hideMini = bar.querySelector('#nxMiniHide');
  const openMini = bar.querySelector('#nxMiniOpen');
  const closeMini = bar.querySelector('#nxMiniX');
  const lblEl = bar.querySelector('#nxMiniLbl');

  const bubble = document.createElement('button');
  bubble.type = 'button';
  bubble.className = 'nx-bubble';
  bubble.id = 'nxBubble';
  bubble.innerHTML = '<span id="nxBubbleT">--:--</span>';
  document.body.appendChild(bubble);
  const bubbleT = bubble.querySelector('#nxBubbleT');

  const getFlag = () => {
    try { return localStorage.getItem(KEY_FLAG) === '1'; } catch (e) { return false; }
  };
  const setFlag = v => {
    try { v ? localStorage.setItem(KEY_FLAG, '1') : localStorage.removeItem(KEY_FLAG); } catch (e) {}
  };
  const onFocusView = () => location.hash === '#/focus';
  const isFloating = () => stage.classList.contains('fx-mini-float');
  const isCollapsed = () => bubble.classList.contains('show');

  const labels = () => {
    openBtn.setAttribute('aria-label', L('Minimize timer', 'تصغير المؤقت'));
    openBtn.title = L('Minimize timer', 'تصغير المؤقت');
    hideMini.setAttribute('aria-label', L('Hide', 'إخفاء'));
    hideMini.title = L('Hide', 'إخفاء');
    closeMini.setAttribute('aria-label', L('Close', 'إغلاق'));
    closeMini.title = L('Close', 'إغلاق');
    openMini.setAttribute('aria-label', L('Back to timer', 'العودة إلى المؤقت'));
    openMini.title = L('Back to timer', 'العودة إلى المؤقت');
    bubble.setAttribute('aria-label', L('Show timer', 'إظهار المؤقت'));
    bubble.title = L('Show timer', 'إظهار المؤقت');
  };

  const ring = stage.querySelector('.fx-ring');
  const fxT = document.getElementById('fxT');
  const fxL = document.getElementById('fxL');
  const fitInner = () => {
    if (!isFloating() || !ring) return;
    const mid = stage.querySelector('.fx-mid');
    if (!mid) return;
    const topH = stage.querySelector('.fx-top').offsetHeight;
    const ctl = stage.querySelector('.fx-ctl');
    const reserved = topH + (ctl ? ctl.offsetHeight : 0) + 36;
    const availH = Math.max(60, stage.clientHeight - reserved);
    const availW = mid.clientWidth - 20;
    const digits = stage.dataset.skin === 'digits';
    if (digits) {
      ring.style.width = Math.min(availW, 420) + 'px';
      const fontSize = Math.max(100, Math.min(availH * 2.34, availW * .81, 495));
      if (fxT) fxT.style.fontSize = Math.round(fontSize) + 'px';
    } else {
      const ringSize = Math.max(60, Math.min(availW, availH, 320));
      ring.style.width = ringSize + 'px';
      const len = Math.max(readTime().length, 5);
      const fontSize = Math.max(14, Math.min(ringSize * .3, (ringSize * 1.15) / len));
      if (fxT) fxT.style.fontSize = Math.round(fontSize) + 'px';
    }
  };
  const unfitInner = () => {
    if (!ring) return;
    ring.style.width = '';
    if (fxT) fxT.style.fontSize = '';
  };

  const readTime = () => {
    if (!fxT) return '--:--';
    if (fxT._c) return fxT._c.map(c => (c._ch !== undefined ? c._ch : '')).join('');
    return fxT.textContent.trim();
  };
  const syncLabel = () => {
    lblEl.textContent = fxL ? fxL.textContent.trim() : '';
    bubbleT.textContent = readTime();
  };

  const place = (x, y) => {
    const w = stage.offsetWidth, h = stage.offsetHeight;
    x = Math.max(8, Math.min(x, innerWidth - w - 8));
    y = Math.max(8, Math.min(y, innerHeight - h - 8));
    stage.style.left = x + 'px';
    stage.style.top = y + 'px';
    try { localStorage.setItem(KEY_POS, JSON.stringify({ x, y })); } catch (e) {}
  };
  const placeBubble = (x, y) => {
    const w = bubble.offsetWidth, h = bubble.offsetHeight;
    x = Math.max(8, Math.min(x, innerWidth - w - 8));
    y = Math.max(8, Math.min(y, innerHeight - h - 8));
    bubble.style.left = x + 'px';
    bubble.style.top = y + 'px';
    try { localStorage.setItem(KEY_BPOS, JSON.stringify({ x, y })); } catch (e) {}
  };
  const applyFixedSize = () => {
    const w = Math.min(FIXED_W, innerWidth - 16);
    const h = Math.min(FIXED_H, innerHeight - 16);
    stage.style.width = w + 'px';
    stage.style.height = h + 'px';
    fitInner();
  };
  const restoreGeometry = () => {
    let p = null;
    try { p = JSON.parse(localStorage.getItem(KEY_POS) || 'null'); } catch (e) {}
    applyFixedSize();
    if (p && typeof p.x === 'number' && typeof p.y === 'number') place(p.x, p.y);
    else place(innerWidth - stage.offsetWidth - 16, innerHeight - stage.offsetHeight - 96);
  };
  const restoreBubblePos = () => {
    let p = null;
    try { p = JSON.parse(localStorage.getItem(KEY_BPOS) || 'null'); } catch (e) {}
    if (p && typeof p.x === 'number' && typeof p.y === 'number') placeBubble(p.x, p.y);
    else placeBubble(innerWidth - 146, innerHeight - 110);
  };

  let drag = null;
  bar.addEventListener('pointerdown', e => {
    if (e.button !== 0 || e.target.closest('button')) return;
    drag = { dx: e.clientX - stage.offsetLeft, dy: e.clientY - stage.offsetTop, id: e.pointerId };
    try { bar.setPointerCapture(e.pointerId); } catch (err) {}
    bar.classList.add('dragging');
  });
  bar.addEventListener('pointermove', e => {
    if (!drag || e.pointerId !== drag.id) return;
    place(e.clientX - drag.dx, e.clientY - drag.dy);
  });
  const endDrag = e => {
    if (!drag || e.pointerId !== drag.id) return;
    drag = null;
    bar.classList.remove('dragging');
  };
  bar.addEventListener('pointerup', endDrag);
  bar.addEventListener('pointercancel', endDrag);

  let bdrag = null;
  bubble.addEventListener('pointerdown', e => {
    if (e.button !== 0) return;
    bdrag = { dx: e.clientX - bubble.offsetLeft, dy: e.clientY - bubble.offsetTop, id: e.pointerId, moved: false, sx: e.clientX, sy: e.clientY };
    try { bubble.setPointerCapture(e.pointerId); } catch (err) {}
  });
  bubble.addEventListener('pointermove', e => {
    if (!bdrag || e.pointerId !== bdrag.id) return;
    if (!bdrag.moved && (Math.abs(e.clientX - bdrag.sx) > 5 || Math.abs(e.clientY - bdrag.sy) > 5)) {
      bdrag.moved = true;
      bubble.classList.add('dragging');
    }
    if (bdrag.moved) placeBubble(e.clientX - bdrag.dx, e.clientY - bdrag.dy);
  });
  const endBubbleDrag = e => {
    if (!bdrag || e.pointerId !== bdrag.id) return;
    const moved = bdrag.moved;
    bdrag = null;
    bubble.classList.remove('dragging');
    if (!moved) expand();
  };
  bubble.addEventListener('pointerup', endBubbleDrag);
  bubble.addEventListener('pointercancel', endBubbleDrag);

  let lastView = '#/home';

  const collapse = () => {
    bubble.classList.add('show');
    restoreBubblePos();
    stage.style.display = 'none';
  };
  const expand = () => {
    bubble.classList.remove('show');
    stage.style.display = '';
  };

  const engage = () => {
    document.body.appendChild(stage);
    stage.classList.add('fx-mini-float');
    restoreGeometry();
    syncLabel();
  };
  const disengage = () => {
    expand();
    stage.classList.remove('fx-mini-float');
    stage.style.left = stage.style.top = stage.style.width = stage.style.height = '';
    unfitInner();
    stageHome.insertBefore(stage, stageAnchor);
  };

  const refresh = () => {
    const show = !onFocusView() && getFlag();
    if (show && !isFloating()) engage();
    else if (!show && isFloating()) disengage();
  };

  openBtn.addEventListener('click', () => {
    setFlag(true);
    location.hash = lastView;
    refresh();
  });
  hideMini.addEventListener('click', collapse);
  openMini.addEventListener('click', () => {
    location.hash = '#/focus';
  });
  closeMini.addEventListener('click', () => {
    setFlag(false);
    refresh();
  });
  addEventListener('hashchange', () => {
    if (onFocusView()) {
      setFlag(false);
    } else {
      lastView = location.hash || '#/home';
    }
    refresh();
  });
  addEventListener('resize', () => {
    if (isFloating()) {
      applyFixedSize();
      place(stage.offsetLeft, stage.offsetTop);
    }
    if (isCollapsed()) placeBubble(bubble.offsetLeft, bubble.offsetTop);
  });
  addEventListener('nexa:lang', () => { labels(); syncLabel(); });
  setInterval(() => { if (isFloating() || isCollapsed()) syncLabel(); }, 500);

  labels();
  refresh();
})();
