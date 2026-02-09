(function() {
  if (document.getElementById('sp-overlay')) return;

  // ── DCSS Crawl Key Codes ──
  var CRAWL_SIMPLE = {
    27:27, 8:8, 9:9, 46:-255, 45:-250, 35:-251, 40:-257,
    34:-260, 37:-258, 12:-259, 39:-256, 36:-252, 38:-254, 33:-261
  };
  var CRAWL_SHIFT = {
    9:-232, 45:-238, 35:-237, 40:-244, 34:-243, 37:-241, 12:-242,
    39:-239, 36:-235, 38:-233, 33:-246, 13:-225, 8:-226, 27:-227,
    46:-228, 32:-229
  };
  var CRAWL_CTRL = {
    45:-216, 35:-215, 40:-222, 34:-221, 37:-219, 12:-220,
    39:-217, 36:-213, 38:-211, 33:-224, 13:-203, 8:-204,
    27:-205, 46:-206, 32:-207
  };

  // ── Find WebSocket ──
  var gameSocket = null;

  // Strategy 1: Intercept WebSocket.prototype.send
  var origSend = WebSocket.prototype.send;
  WebSocket.prototype.send = function(data) {
    if (this.readyState === WebSocket.OPEN) {
      gameSocket = this;
    }
    return origSend.call(this, data);
  };

  // Strategy 2: Search existing WebSocket instances
  function findExistingSocket() {
    if (gameSocket && gameSocket.readyState === WebSocket.OPEN) return;
    // Check common global patterns
    var candidates = ['socket', 'ws', '_socket', 'websocket', 'conn'];
    for (var i = 0; i < candidates.length; i++) {
      try {
        var obj = window[candidates[i]];
        if (obj instanceof WebSocket && obj.readyState === WebSocket.OPEN) {
          gameSocket = obj;
          return;
        }
      } catch(e) {}
    }
    // Try RequireJS comm module
    if (typeof require === 'function') {
      try {
        require(['comm'], function(comm) {
          if (comm && comm.socket) gameSocket = comm.socket;
        });
      } catch(e) {}
    }
  }
  findExistingSocket();

  // ── Send Key to DCSS ──
  function sendToCrawl(keyDef) {
    var ek = effectiveKey(keyDef);
    var kc = parseInt(keyDef.kc, 10);

    // Try WebSocket direct message first
    if (gameSocket && gameSocket.readyState === WebSocket.OPEN) {
      // Ctrl+key: send control character code
      if (ctrl && !shift && ek.length === 1) {
        var ch = ek.toUpperCase().charCodeAt(0);
        if (ch >= 65 && ch <= 90) {
          wsSend('{"msg":"key","keycode":' + (ch - 64) + '}');
          return;
        }
      }

      // Special keys with modifiers
      if (ctrl && shift && kc in CRAWL_CTRL) {
        // ctrlshift not fully needed, just send ctrl version
        wsSend('{"msg":"key","keycode":' + CRAWL_CTRL[kc] + '}');
        return;
      }
      if (ctrl && kc in CRAWL_CTRL) {
        wsSend('{"msg":"key","keycode":' + CRAWL_CTRL[kc] + '}');
        return;
      }
      if (shift && kc in CRAWL_SHIFT) {
        wsSend('{"msg":"key","keycode":' + CRAWL_SHIFT[kc] + '}');
        return;
      }

      // Simple special keys (arrows, escape, backspace, etc.)
      if (kc in CRAWL_SIMPLE) {
        wsSend('{"msg":"key","keycode":' + CRAWL_SIMPLE[kc] + '}');
        return;
      }

      // Regular character input
      if (ek.length === 1) {
        wsSend('{"msg":"input","text":' + JSON.stringify(ek) + '}');
        return;
      }

      // Enter as keycode
      if (ek === 'Enter') {
        wsSend('{"msg":"key","keycode":13}');
        return;
      }
    }

    // Fallback: DOM event dispatch
    dispatchDOMEvents('keydown', keyDef);
    if (ek.length === 1) {
      dispatchDOMEvents('keypress', keyDef);
    }
  }

  function wsSend(data) {
    try {
      origSend.call(gameSocket, data);
    } catch(e) {
      try { gameSocket.send(data); } catch(e2) {}
    }
  }

  // ── DOM Event Fallback ──
  function dispatchDOMEvents(type, keyDef) {
    var ek = effectiveKey(keyDef);
    var kc = parseInt(keyDef.kc, 10);
    var init = {
      key: ek, code: keyDef.code,
      keyCode: type === 'keypress' ? ek.charCodeAt(0) : kc,
      which: type === 'keypress' ? ek.charCodeAt(0) : kc,
      charCode: type === 'keypress' ? ek.charCodeAt(0) : 0,
      bubbles: true, cancelable: true,
      shiftKey: shift, ctrlKey: ctrl, altKey: alt, metaKey: false
    };
    var targets = [document, window];
    if (document.body) targets.push(document.body);
    if (document.activeElement && document.activeElement !== document.body) {
      targets.push(document.activeElement);
    }
    document.querySelectorAll('canvas').forEach(function(c) { targets.push(c); });
    targets.forEach(function(t) {
      try { t.dispatchEvent(new KeyboardEvent(type, init)); } catch(e) {}
    });
    // jQuery trigger if available
    if (window.$ || window.jQuery) {
      var jq = window.$ || window.jQuery;
      try { jq(document).trigger(jq.Event(type, init)); } catch(e) {}
    }
  }

  // ── Layout ──
  var ROWS = [
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
      { key:"'",code:'Quote',kc:222,s:'"' },
      { key:'Enter',code:'Enter',kc:13,label:'Enter',w:1.5 },
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

  var shift=false, ctrl=false, alt=false, caps=false;
  var touches = new Map();
  var mouseBtn = null;

  // ── CSS ──
  var css = document.createElement('style');
  css.textContent = '#sp-overlay{position:fixed;bottom:0;left:0;right:0;z-index:999999;'
    +'background:rgba(30,30,30,.88);border-top:1px solid #444;padding:2px 2px env(safe-area-inset-bottom,2px);'
    +'backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);font-family:system-ui,sans-serif;'
    +'touch-action:manipulation;-webkit-user-select:none;user-select:none;}'
    +'#sp-rows{display:flex;flex-direction:column;gap:2px;}'
    +'.sp-row{display:flex;gap:2px;justify-content:center;}'
    +'.sp-k{display:inline-flex;align-items:center;justify-content:center;height:36px;min-width:28px;'
    +'padding:0 4px;background:#4a4a4a;border:1px solid #666;border-radius:5px;color:#eee;'
    +'font-size:12px;font-weight:500;cursor:pointer;flex-shrink:0;touch-action:manipulation;'
    +'-webkit-tap-highlight-color:transparent;transition:background .08s;}'
    +'.sp-k:active,.sp-k.pressed{background:#6a9fff;border-color:#88b4ff;color:#fff;}'
    +'.sp-k.mod{background:#3a3a3a;}'
    +'.sp-k.mod.active{background:#d97706;border-color:#f59e0b;color:#fff;}'
    +'.sp-k.space{flex:1;max-width:50%;}'
    +'.sp-k.w15{min-width:calc(28px*1.5);}'
    +'.sp-k.w18{min-width:calc(28px*1.8);}'
    +'.sp-k.w20{min-width:calc(28px*2);}'
    +'.sp-k.w22{min-width:calc(28px*2.2);}'
    +'#sp-toggle{position:fixed;bottom:10px;right:10px;z-index:999998;width:44px;height:44px;'
    +'border-radius:50%;background:rgba(37,99,235,.9);border:2px solid #5af;color:#fff;'
    +'font-size:22px;cursor:pointer;display:flex;align-items:center;justify-content:center;'
    +'-webkit-tap-highlight-color:transparent;box-shadow:0 2px 8px rgba(0,0,0,.4);}'
    +'#sp-toggle.kb-open{background:rgba(220,50,50,.9);border-color:#f66;}'
    +'#sp-indicator{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);'
    +'background:rgba(0,0,0,.7);color:#fff;padding:8px 18px;border-radius:8px;font-size:18px;'
    +'font-weight:600;z-index:1000000;pointer-events:none;opacity:0;transition:opacity .15s;}'
    +'#sp-indicator.show{opacity:1;}'
    +'#sp-status{position:fixed;top:10px;right:10px;z-index:999999;background:rgba(0,0,0,.7);'
    +'color:#0f0;padding:4px 8px;border-radius:4px;font-size:11px;font-family:monospace;'
    +'pointer-events:none;opacity:0;transition:opacity .3s;}'
    +'#sp-status.show{opacity:1;}'
    +'@media(orientation:landscape){.sp-k{height:30px;font-size:11px;min-width:24px;}'
    +'.sp-k.w15{min-width:calc(24px*1.5);}.sp-k.w18{min-width:calc(24px*1.8);}'
    +'.sp-k.w20{min-width:calc(24px*2);}.sp-k.w22{min-width:calc(24px*2.2);}'
    +'#sp-overlay{padding:1px 2px env(safe-area-inset-bottom,1px);}}'
    +'@media(max-width:480px){.sp-k{font-size:10px;min-width:22px;height:32px;padding:0 2px;}}';
  document.head.appendChild(css);

  // ── Status indicator ──
  var status = document.createElement('div');
  status.id = 'sp-status';
  document.body.appendChild(status);
  var statusTimer = null;
  function showStatus(msg, color) {
    status.textContent = msg;
    status.style.color = color || '#0f0';
    status.classList.add('show');
    clearTimeout(statusTimer);
    statusTimer = setTimeout(function() { status.classList.remove('show'); }, 2000);
  }

  // ── Key indicator ──
  var indicator = document.createElement('div');
  indicator.id = 'sp-indicator';
  document.body.appendChild(indicator);
  var indTimer = null;
  function showIndicator(key) {
    var map = {' ':'Space','Escape':'Esc','Backspace':'⌫','ArrowLeft':'←',
      'ArrowRight':'→','ArrowUp':'↑','ArrowDown':'↓','Control':'Ctrl','CapsLock':'Caps'};
    indicator.textContent = map[key] || key;
    indicator.classList.add('show');
    clearTimeout(indTimer);
    indTimer = setTimeout(function() { indicator.classList.remove('show'); }, 300);
  }

  // ── Toggle button ──
  var toggle = document.createElement('button');
  toggle.id = 'sp-toggle';
  toggle.textContent = '⌨';
  document.body.appendChild(toggle);

  // ── Keyboard container ──
  var kb = document.createElement('div');
  kb.id = 'sp-overlay';
  kb.style.display = 'none';
  var rows = document.createElement('div');
  rows.id = 'sp-rows';
  kb.appendChild(rows);
  document.body.appendChild(kb);

  function effectiveKey(k) {
    var base = k.key;
    var s = k.s;
    var mod = k.mod;
    if (mod || base.length > 1) return base;
    if (shift && s) return s;
    if ((shift || caps) && base >= 'a' && base <= 'z') return base.toUpperCase();
    return base;
  }

  function buildKeys() {
    rows.innerHTML = '';
    ROWS.forEach(function(rowDef) {
      var row = document.createElement('div');
      row.className = 'sp-row';
      rowDef.forEach(function(k) {
        var btn = document.createElement('button');
        btn.className = 'sp-k';
        btn.dataset.idx = JSON.stringify(k);
        if (k.mod) { btn.classList.add('mod'); btn.dataset.mod = k.mod; }
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
      try {
        var k = JSON.parse(btn.dataset.idx);
        if (k.s && shift) btn.textContent = k.s;
        else if (k.key.length === 1 && k.key >= 'a' && k.key <= 'z')
          btn.textContent = (shift || caps) ? k.key.toUpperCase() : k.key;
        else if (k.s && !shift) btn.textContent = k.label || k.key;
      } catch(e) {}
    });
  }

  function updateMods() {
    rows.querySelectorAll('.sp-k.mod').forEach(function(btn) {
      var m = btn.dataset.mod;
      var a = false;
      if (m === 'shift') a = shift;
      else if (m === 'ctrl') a = ctrl;
      else if (m === 'alt') a = alt;
      else if (m === 'caps') a = caps;
      btn.classList.toggle('active', a);
    });
  }

  function toggleMod(m) {
    if (m === 'shift') shift = !shift;
    else if (m === 'ctrl') ctrl = !ctrl;
    else if (m === 'alt') alt = !alt;
    else if (m === 'caps') caps = !caps;
    updateMods();
    updateLabels();
  }

  function pressKey(btn) {
    try {
      var k = JSON.parse(btn.dataset.idx);
      var ek = effectiveKey(k);
      showIndicator(ek);

      // Try to find socket if not found yet
      if (!gameSocket || gameSocket.readyState !== WebSocket.OPEN) {
        findExistingSocket();
      }

      sendToCrawl(k);

      if (gameSocket && gameSocket.readyState === WebSocket.OPEN) {
        showStatus('WS: ' + ek, '#0f0');
      } else {
        showStatus('DOM: ' + ek, '#f90');
      }
    } catch(e) {
      showStatus('ERR: ' + e.message, '#f00');
    }
  }

  // ── Touch ──
  rows.addEventListener('touchstart', function(e) {
    e.preventDefault(); e.stopPropagation();
    for (var i = 0; i < e.changedTouches.length; i++) {
      var t = e.changedTouches[i];
      var el = document.elementFromPoint(t.clientX, t.clientY);
      var btn = el && el.closest('.sp-k');
      if (!btn) continue;
      if (btn.dataset.mod) { toggleMod(btn.dataset.mod); }
      else { btn.classList.add('pressed'); touches.set(t.identifier, btn); pressKey(btn); }
    }
  }, { passive: false, capture: true });

  rows.addEventListener('touchend', function(e) {
    e.preventDefault(); e.stopPropagation();
    for (var i = 0; i < e.changedTouches.length; i++) {
      var t = e.changedTouches[i];
      var btn = touches.get(t.identifier);
      if (btn) { btn.classList.remove('pressed'); touches.delete(t.identifier); }
    }
  }, { passive: false, capture: true });

  rows.addEventListener('touchcancel', function(e) {
    for (var i = 0; i < e.changedTouches.length; i++) {
      var t = e.changedTouches[i];
      var btn = touches.get(t.identifier);
      if (btn) { btn.classList.remove('pressed'); touches.delete(t.identifier); }
    }
  }, { passive: false });

  // ── Mouse ──
  rows.addEventListener('mousedown', function(e) {
    var btn = e.target.closest('.sp-k');
    if (!btn) return;
    e.preventDefault(); e.stopPropagation();
    if (btn.dataset.mod) { toggleMod(btn.dataset.mod); return; }
    btn.classList.add('pressed');
    mouseBtn = btn;
    pressKey(btn);
  });
  document.addEventListener('mouseup', function() {
    if (!mouseBtn) return;
    mouseBtn.classList.remove('pressed');
    mouseBtn = null;
  });

  // ── Toggle ──
  var kbVisible = false;
  toggle.addEventListener('click', function(e) {
    e.stopPropagation();
    kbVisible = !kbVisible;
    kb.style.display = kbVisible ? '' : 'none';
    toggle.textContent = kbVisible ? '✕' : '⌨';
    toggle.classList.toggle('kb-open', kbVisible);
    if (kbVisible) {
      toggle.style.bottom = (kb.offsetHeight + 10) + 'px';
      if (gameSocket && gameSocket.readyState === WebSocket.OPEN) {
        showStatus('WebSocket 연결됨', '#0f0');
      } else {
        findExistingSocket();
        showStatus(gameSocket ? 'WebSocket 연결됨' : 'WebSocket 미발견 (DOM 모드)', '#f90');
      }
    } else {
      toggle.style.bottom = '10px';
    }
  });

  buildKeys();
  showStatus('ScreenPad 로드됨', '#5af');
})();
