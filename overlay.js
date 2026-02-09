(function() {
  if (document.getElementById('sp-overlay')) return;

  // ── Layout ──
  const ROWS = [
    [
      { key:'Escape',code:'Escape',kc:27,label:'Esc',w:1.5 },
      { key:'1',code:'Digit1',kc:49,s:'!' },{ key:'2',code:'Digit2',kc:50,s:'@' },
      { key:'3',code:'Digit3',kc:51,s:'#' },{ key:'4',code:'Digit4',kc:52,s:'$' },
      { key:'5',code:'Digit5',kc:53,s:'%' },{ key:'6',code:'Digit6',kc:54,s:'^' },
      { key:'7',code:'Digit7',kc:55,s:'&' },{ key:'8',code:'Digit8',kc:56,s:'*' },
      { key:'9',code:'Digit9',kc:57,s:'(' },{ key:'0',code:'Digit0',kc:48,s:')' },
      { key:'Backspace',code:'Backspace',kc:8,label:'⌫',w:1.5 },
    ],
    [
      { key:'Tab',code:'Tab',kc:9,w:1.5 },
      { key:'q',code:'KeyQ',kc:81 },{ key:'w',code:'KeyW',kc:87 },
      { key:'e',code:'KeyE',kc:69 },{ key:'r',code:'KeyR',kc:82 },
      { key:'t',code:'KeyT',kc:84 },{ key:'y',code:'KeyY',kc:89 },
      { key:'u',code:'KeyU',kc:85 },{ key:'i',code:'KeyI',kc:73 },
      { key:'o',code:'KeyO',kc:79 },{ key:'p',code:'KeyP',kc:80 },
      { key:'[',code:'BracketLeft',kc:219,s:'{' },
      { key:']',code:'BracketRight',kc:221,s:'}' },
    ],
    [
      { key:'CapsLock',code:'CapsLock',kc:20,label:'Caps',w:1.8,mod:'caps' },
      { key:'a',code:'KeyA',kc:65 },{ key:'s',code:'KeyS',kc:83 },
      { key:'d',code:'KeyD',kc:68 },{ key:'f',code:'KeyF',kc:70 },
      { key:'g',code:'KeyG',kc:71 },{ key:'h',code:'KeyH',kc:72 },
      { key:'j',code:'KeyJ',kc:74 },{ key:'k',code:'KeyK',kc:75 },
      { key:'l',code:'KeyL',kc:76 },{ key:';',code:'Semicolon',kc:186,s:':' },
      { key:'Enter',code:'Enter',kc:13,label:'Enter',w:2 },
    ],
    [
      { key:'Shift',code:'ShiftLeft',kc:16,label:'⇧',w:2.2,mod:'shift' },
      { key:'z',code:'KeyZ',kc:90 },{ key:'x',code:'KeyX',kc:88 },
      { key:'c',code:'KeyC',kc:67 },{ key:'v',code:'KeyV',kc:86 },
      { key:'b',code:'KeyB',kc:66 },{ key:'n',code:'KeyN',kc:78 },
      { key:'m',code:'KeyM',kc:77 },{ key:',',code:'Comma',kc:188,s:'<' },
      { key:'.',code:'Period',kc:190,s:'>' },{ key:'/',code:'Slash',kc:191,s:'?' },
      { key:'Shift',code:'ShiftRight',kc:16,label:'⇧',w:2.2,mod:'shift' },
    ],
    [
      { key:'Control',code:'ControlLeft',kc:17,label:'Ctrl',w:1.5,mod:'ctrl' },
      { key:'Alt',code:'AltLeft',kc:18,label:'Alt',w:1.5,mod:'alt' },
      { key:' ',code:'Space',kc:32,label:'Space',space:true },
      { key:'ArrowLeft',code:'ArrowLeft',kc:37,label:'←' },
      { key:'ArrowUp',code:'ArrowUp',kc:38,label:'↑' },
      { key:'ArrowDown',code:'ArrowDown',kc:40,label:'↓' },
      { key:'ArrowRight',code:'ArrowRight',kc:39,label:'→' },
    ],
  ];

  let shift=false, ctrl=false, alt=false, caps=false;
  const touches = new Map();
  let mouseBtn = null;

  // ── CSS ──
  const css = document.createElement('style');
  css.textContent = `
#sp-overlay{position:fixed;bottom:0;left:0;right:0;z-index:999999;background:rgba(30,30,30,.88);
border-top:1px solid #444;padding:2px 2px env(safe-area-inset-bottom,2px);
backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);font-family:system-ui,sans-serif;
touch-action:manipulation;-webkit-user-select:none;user-select:none;}
#sp-rows{display:flex;flex-direction:column;gap:2px;}
.sp-row{display:flex;gap:2px;justify-content:center;}
.sp-k{display:inline-flex;align-items:center;justify-content:center;height:36px;min-width:28px;
padding:0 4px;background:#4a4a4a;border:1px solid #666;border-radius:5px;color:#eee;
font-size:12px;font-weight:500;cursor:pointer;flex-shrink:0;touch-action:manipulation;
-webkit-tap-highlight-color:transparent;transition:background .08s;}
.sp-k:active,.sp-k.pressed{background:#6a9fff;border-color:#88b4ff;color:#fff;}
.sp-k.mod{background:#3a3a3a;}
.sp-k.mod.active{background:#d97706;border-color:#f59e0b;color:#fff;}
.sp-k.space{flex:1;max-width:50%;}
.sp-k.w15{min-width:calc(28px*1.5);}
.sp-k.w18{min-width:calc(28px*1.8);}
.sp-k.w20{min-width:calc(28px*2);}
.sp-k.w22{min-width:calc(28px*2.2);}
#sp-toggle{position:fixed;bottom:10px;right:10px;z-index:999998;width:44px;height:44px;
border-radius:50%;background:rgba(37,99,235,.9);border:2px solid #5af;color:#fff;
font-size:22px;cursor:pointer;display:flex;align-items:center;justify-content:center;
-webkit-tap-highlight-color:transparent;box-shadow:0 2px 8px rgba(0,0,0,.4);}
#sp-toggle.kb-open{background:rgba(220,50,50,.9);border-color:#f66;}
#sp-indicator{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);
background:rgba(0,0,0,.7);color:#fff;padding:8px 18px;border-radius:8px;font-size:18px;
font-weight:600;z-index:1000000;pointer-events:none;opacity:0;transition:opacity .15s;}
#sp-indicator.show{opacity:1;}
@media(orientation:landscape){.sp-k{height:30px;font-size:11px;min-width:24px;}
.sp-k.w15{min-width:calc(24px*1.5);}.sp-k.w18{min-width:calc(24px*1.8);}
.sp-k.w20{min-width:calc(24px*2);}.sp-k.w22{min-width:calc(24px*2.2);}
#sp-overlay{padding:1px 2px env(safe-area-inset-bottom,1px);}}
@media(max-width:480px){.sp-k{font-size:10px;min-width:22px;height:32px;padding:0 2px;}}
`;
  document.head.appendChild(css);

  // ── Indicator ──
  const indicator = document.createElement('div');
  indicator.id = 'sp-indicator';
  document.body.appendChild(indicator);
  let indTimer = null;

  // ── Toggle button ──
  const toggle = document.createElement('button');
  toggle.id = 'sp-toggle';
  toggle.textContent = '⌨';
  document.body.appendChild(toggle);

  // ── Keyboard container ──
  const kb = document.createElement('div');
  kb.id = 'sp-overlay';
  kb.style.display = 'none';
  const rows = document.createElement('div');
  rows.id = 'sp-rows';
  kb.appendChild(rows);
  document.body.appendChild(kb);

  function buildKeys() {
    rows.innerHTML = '';
    ROWS.forEach(function(rowDef) {
      const row = document.createElement('div');
      row.className = 'sp-row';
      rowDef.forEach(function(k) {
        const btn = document.createElement('button');
        btn.className = 'sp-k';
        btn.setAttribute('data-key', k.key);
        btn.setAttribute('data-code', k.code);
        btn.setAttribute('data-kc', k.kc);
        if (k.s) btn.setAttribute('data-s', k.s);
        if (k.mod) { btn.classList.add('mod'); btn.setAttribute('data-mod', k.mod); }
        if (k.space) btn.classList.add('space');
        if (k.w) {
          if (k.w <= 1.5) btn.classList.add('w15');
          else if (k.w <= 1.8) btn.classList.add('w18');
          else if (k.w <= 2) btn.classList.add('w20');
          else btn.classList.add('w22');
        }
        var label = k.label || k.key;
        if (k.key.length === 1 && k.key >= 'a' && k.key <= 'z' && (shift || caps))
          label = label.toUpperCase();
        btn.textContent = label;
        row.appendChild(btn);
      });
      rows.appendChild(row);
    });
    updateLabels();
    updateMods();
  }

  function updateLabels() {
    rows.querySelectorAll('.sp-k').forEach(function(btn) {
      var base = btn.getAttribute('data-key');
      var s = btn.getAttribute('data-s');
      if (s && shift) { btn.textContent = s; }
      else if (base.length === 1 && base >= 'a' && base <= 'z') {
        btn.textContent = (shift || caps) ? base.toUpperCase() : base;
      } else if (s && !shift) { btn.textContent = base; }
    });
  }

  function updateMods() {
    rows.querySelectorAll('.sp-k.mod').forEach(function(btn) {
      var m = btn.getAttribute('data-mod');
      var a = false;
      if (m === 'shift') a = shift;
      else if (m === 'ctrl') a = ctrl;
      else if (m === 'alt') a = alt;
      else if (m === 'caps') a = caps;
      btn.classList.toggle('active', a);
    });
  }

  function effectiveKey(btn) {
    var base = btn.getAttribute('data-key');
    var s = btn.getAttribute('data-s');
    var mod = btn.getAttribute('data-mod');
    if (mod || base.length > 1) return base;
    if (shift && s) return s;
    if ((shift || caps) && base >= 'a' && base <= 'z') return base.toUpperCase();
    return base;
  }

  function fire(type, btn) {
    var ek = effectiveKey(btn);
    var kc = parseInt(btn.getAttribute('data-kc'), 10);
    var init = {
      key: ek, code: btn.getAttribute('data-code'),
      keyCode: kc, which: kc,
      bubbles: true, cancelable: true,
      shiftKey: shift, ctrlKey: ctrl, altKey: alt, metaKey: false
    };

    if (type === 'keydown') showIndicator(ek);

    // Dispatch on document, window, body, active element, and all canvas
    [window, document, document.body, document.documentElement].forEach(function(t) {
      if (t) try { t.dispatchEvent(new KeyboardEvent(type, init)); } catch(e) {}
    });
    var ae = document.activeElement;
    if (ae && ae !== document.body && ae !== document.documentElement) {
      try { ae.dispatchEvent(new KeyboardEvent(type, init)); } catch(e) {}
    }
    document.querySelectorAll('canvas').forEach(function(c) {
      try { c.dispatchEvent(new KeyboardEvent(type, init)); } catch(e) {}
    });

    // Also fire keypress for games that listen for it
    if (type === 'keydown' && ek.length === 1) {
      var pressInit = {
        key: ek, code: btn.getAttribute('data-code'),
        keyCode: ek.charCodeAt(0), which: ek.charCodeAt(0), charCode: ek.charCodeAt(0),
        bubbles: true, cancelable: true,
        shiftKey: shift, ctrlKey: ctrl, altKey: alt, metaKey: false
      };
      [window, document, document.body].forEach(function(t) {
        if (t) try { t.dispatchEvent(new KeyboardEvent('keypress', pressInit)); } catch(e) {}
      });
    }
  }

  function showIndicator(key) {
    var map = {' ':'Space','Escape':'Esc','Backspace':'⌫','ArrowLeft':'←',
      'ArrowRight':'→','ArrowUp':'↑','ArrowDown':'↓','Control':'Ctrl','CapsLock':'Caps'};
    indicator.textContent = map[key] || key;
    indicator.classList.add('show');
    clearTimeout(indTimer);
    indTimer = setTimeout(function() { indicator.classList.remove('show'); }, 300);
  }

  function toggleMod(m) {
    if (m === 'shift') shift = !shift;
    else if (m === 'ctrl') ctrl = !ctrl;
    else if (m === 'alt') alt = !alt;
    else if (m === 'caps') caps = !caps;
    updateMods();
    updateLabels();
  }

  // ── Touch ──
  rows.addEventListener('touchstart', function(e) {
    e.preventDefault();
    for (var i = 0; i < e.changedTouches.length; i++) {
      var t = e.changedTouches[i];
      var el = document.elementFromPoint(t.clientX, t.clientY);
      var btn = el && el.closest('.sp-k');
      if (!btn) continue;
      var mod = btn.getAttribute('data-mod');
      if (mod) { toggleMod(mod); }
      else { btn.classList.add('pressed'); touches.set(t.identifier, btn); fire('keydown', btn); }
    }
  }, { passive: false });

  rows.addEventListener('touchend', function(e) {
    e.preventDefault();
    for (var i = 0; i < e.changedTouches.length; i++) {
      var t = e.changedTouches[i];
      var btn = touches.get(t.identifier);
      if (!btn) continue;
      btn.classList.remove('pressed');
      fire('keyup', btn);
      touches.delete(t.identifier);
    }
  }, { passive: false });

  rows.addEventListener('touchcancel', function(e) {
    for (var i = 0; i < e.changedTouches.length; i++) {
      var t = e.changedTouches[i];
      var btn = touches.get(t.identifier);
      if (btn) { btn.classList.remove('pressed'); fire('keyup', btn); touches.delete(t.identifier); }
    }
  }, { passive: false });

  // ── Mouse ──
  rows.addEventListener('mousedown', function(e) {
    var btn = e.target.closest('.sp-k');
    if (!btn) return;
    e.preventDefault();
    var mod = btn.getAttribute('data-mod');
    if (mod) { toggleMod(mod); return; }
    btn.classList.add('pressed');
    mouseBtn = btn;
    fire('keydown', btn);
  });
  document.addEventListener('mouseup', function() {
    if (!mouseBtn) return;
    mouseBtn.classList.remove('pressed');
    fire('keyup', mouseBtn);
    mouseBtn = null;
  });

  // ── Toggle ──
  var kbVisible = false;
  toggle.addEventListener('click', function() {
    kbVisible = !kbVisible;
    kb.style.display = kbVisible ? '' : 'none';
    toggle.textContent = kbVisible ? '✕' : '⌨';
    toggle.classList.toggle('kb-open', kbVisible);
    if (kbVisible) toggle.style.bottom = (kb.offsetHeight + 10) + 'px';
    else toggle.style.bottom = '10px';
  });

  buildKeys();
})();
