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

  // ── Send Mode: 'ws' or 'dom' (toggled manually) ──
  var sendMode = 'ws'; // default to WS mode

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
    if (typeof require === 'function') {
      try {
        require(['comm'], function(comm) {
          if (comm && comm.socket) gameSocket = comm.socket;
        });
      } catch(e) {}
    }
  }
  findExistingSocket();

  function useWS() {
    return sendMode === 'ws' && gameSocket && gameSocket.readyState === WebSocket.OPEN;
  }

  // ── Send Key to DCSS ──
  function sendToCrawl(keyDef) {
    var ek = effectiveKey(keyDef);
    var kc = parseInt(keyDef.kc, 10);

    if (useWS()) {
      if (ctrl && !shift && ek.length === 1) {
        var ch = ek.toUpperCase().charCodeAt(0);
        if (ch >= 65 && ch <= 90) {
          wsSend('{"msg":"key","keycode":' + (ch - 64) + '}');
          return;
        }
      }
      if (ctrl && shift && kc in CRAWL_CTRL) {
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
      if (kc in CRAWL_SIMPLE) {
        wsSend('{"msg":"key","keycode":' + CRAWL_SIMPLE[kc] + '}');
        return;
      }
      if (ek.length === 1) {
        wsSend('{"msg":"input","text":' + JSON.stringify(ek) + '}');
        return;
      }
      if (ek === 'Enter') {
        wsSend('{"msg":"key","keycode":13}');
        return;
      }
    }

    // DOM mode (or WS fallback)
    dispatchDOMEvents('keydown', keyDef);
    if (ek.length === 1) {
      dispatchDOMEvents('keypress', keyDef);
    }
  }

  // Send a single character as keycode (for D-pad/action buttons)
  // IMPORTANT: use msg:"key" not msg:"input" — "input" buffers text and causes
  // DCSS to run-until-blocked (e.g. move to wall). "key" sends a single keypress.
  function sendChar(ch) {
    if (useWS()) {
      wsSend('{"msg":"key","keycode":' + ch.charCodeAt(0) + '}');
      showStatus('WS: ' + ch, '#0f0');
    } else {
      var fakeKey = { key: ch, code: '', kc: ch.charCodeAt(0) };
      dispatchDOMEvents('keydown', fakeKey);
      dispatchDOMEvents('keypress', fakeKey);
      showStatus('DOM: ' + ch, '#f90');
    }
  }

  // Send a keycode (for special keys like Tab, Escape)
  function sendKeycode(code) {
    if (useWS()) {
      wsSend('{"msg":"key","keycode":' + code + '}');
      showStatus('WS: kc=' + code, '#0f0');
    } else {
      // DOM mode: dispatch keydown with the keycode
      var keyMap = {9:'Tab',27:'Escape',13:'Enter',8:'Backspace'};
      var fakeKey = { key: keyMap[code] || '', code: '', kc: code };
      dispatchDOMEvents('keydown', fakeKey);
      showStatus('DOM: kc=' + code, '#f90');
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
    if (window.$ || window.jQuery) {
      var jq = window.$ || window.jQuery;
      try { jq(document).trigger(jq.Event(type, init)); } catch(e) {}
    }
  }

  // ── Full Keyboard Layout ──
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

  // ── D-Pad Layout (DCSS vi-keys: 8 directions + wait) ──
  var DPAD = [
    [ {label:'↖\ny',char:'y',desc:'↖'}, {label:'↑\nk',char:'k',desc:'↑'}, {label:'↗\nu',char:'u',desc:'↗'} ],
    [ {label:'←\nh',char:'h',desc:'←'}, {label:'·\nwait',char:'.',desc:'wait'}, {label:'→\nl',char:'l',desc:'→'} ],
    [ {label:'↙\nb',char:'b',desc:'↙'}, {label:'↓\nj',char:'j',desc:'↓'}, {label:'↘\nn',char:'n',desc:'↘'} ],
  ];

  // ── Action Buttons (DCSS essential commands) — 5 columns ──
  var ACTIONS = [
    [ {label:'Tab',keycode:9,desc:'Auto-fight'}, {label:'o',char:'o',desc:'Auto-explore'}, {label:'5',char:'5',desc:'Rest'}, {label:'>',char:'>',desc:'Descend'}, {label:'<',char:'<',desc:'Ascend'} ],
    [ {label:'i',char:'i',desc:'Inventory'}, {label:'g',char:'g',desc:'Pick up'}, {label:'d',char:'d',desc:'Drop'}, {label:'e',char:'e',desc:'Eat/Quaff'}, {label:'f',char:'f',desc:'Fire'} ],
    [ {label:'p',char:'p',desc:'Pray/Prev'}, {label:'z',char:'z',desc:'Zap'}, {label:'a',char:'a',desc:'Ability'}, {label:'x',char:'x',desc:'Examine'}, {label:'X',char:'X',desc:'Explore map'} ],
    [ {label:'Space',keycode:32,desc:'Space'}, {label:'Enter',keycode:13,desc:'Enter'}, {label:'Esc',keycode:27,desc:'Cancel'}, {label:'Ctrl',mod:'ctrl',desc:'Modifier'}, {label:'Shift',mod:'shift',desc:'Modifier'} ],
    [ {label:'@',char:'@',desc:'Status'}, {label:'\\',char:'\\',desc:'Known'}, {label:'%',char:'%',desc:'Skills'}, {label:'^',char:'^',desc:'Religion'}, {label:'?',char:'?',desc:'Help'} ],
  ];

  var shift=false, ctrl=false, alt=false, caps=false;
  var touches = new Map();
  var mouseBtn = null;

  // ── Zoom State ──
  var zoomLevel = 100;
  var ZOOM_MIN = 25, ZOOM_MAX = 300, ZOOM_STEP = 10;

  // ── CSS ──
  var css = document.createElement('style');
  css.textContent = '#sp-overlay{position:fixed !important;left:5px !important;right:5px !important;bottom:10px;'
    +'width:auto !important;z-index:999999;'
    +'background:rgba(10,10,10,.35);border-radius:12px;padding:4px 3px;'
    +'backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);font-family:system-ui,sans-serif;'
    +'touch-action:manipulation;-webkit-user-select:none;user-select:none;box-sizing:border-box !important;}'
    +'#sp-rows{display:flex;flex-direction:column;gap:3px;}'
    +'.sp-row{display:flex;gap:3px;justify-content:center;padding:0 2px;}'
    +'.sp-k{display:inline-flex;flex-direction:column;align-items:center;justify-content:center;height:72px;min-width:0;'
    +'flex:1;padding:0 2px;background:rgba(60,60,60,.45);border:1px solid rgba(120,120,120,.4);border-radius:6px;color:#eee;'
    +'font-size:24px;font-weight:500;cursor:pointer;touch-action:manipulation;'
    +'-webkit-tap-highlight-color:transparent;transition:background .08s;line-height:1;}'
    +'.sp-k .vi-arrow{font-size:13px;opacity:1;color:#7cf;line-height:1;margin-top:1px;text-shadow:0 0 4px rgba(100,180,255,.6);}'
    +'.sp-k:active,.sp-k.pressed{background:#6a9fff;border-color:#88b4ff;color:#fff;}'
    +'.sp-k.mod{background:#3a3a3a;}'
    +'.sp-k.mod.active{background:#d97706;border-color:#f59e0b;color:#fff;}'
    +'.sp-k.space{flex:3;}'
    +'.sp-k.w15{flex:1.5;}'
    +'.sp-k.w18{flex:1.8;}'
    +'.sp-k.w20{flex:2;}'
    +'.sp-k.w22{flex:2.2;}'
    // Toggle button bar (bottom-right)
    +'#sp-btn-bar{position:fixed;bottom:10px;right:10px;z-index:999998;display:flex;gap:6px;'
    +'align-items:center;}'
    +'.sp-ctrl-btn{width:44px;height:44px;border-radius:50%;border:2px solid #5af;color:#fff;'
    +'font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;'
    +'-webkit-tap-highlight-color:transparent;box-shadow:0 2px 8px rgba(0,0,0,.4);'
    +'background:rgba(37,99,235,.9);touch-action:manipulation;}'
    +'.sp-ctrl-btn.active{background:rgba(220,50,50,.9);border-color:#f66;}'
    +'.sp-ctrl-btn.mode-ws{background:rgba(0,140,60,.9);border-color:#0a6;}'
    +'.sp-ctrl-btn.mode-dom{background:rgba(180,100,0,.9);border-color:#f90;}'
    +'.sp-ctrl-btn.zoom{width:36px;height:36px;font-size:20px;font-weight:700;border-radius:8px;'
    +'background:rgba(60,60,60,.9);border:1px solid #666;}'
    +'#sp-zoom-label{color:#ccc;font-size:12px;font-family:monospace;background:rgba(0,0,0,.5);'
    +'padding:2px 6px;border-radius:4px;pointer-events:none;}'
    // Floating panels (shared)
    +'.sp-float-panel{position:fixed;z-index:2147483646;touch-action:manipulation;'
    +'-webkit-user-select:none;user-select:none;background:rgba(20,20,20,.75);'
    +'border-radius:12px;padding:4px;backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);}'
    // D-Pad grid — 3x3, big buttons
    +'#sp-dpad{display:grid;grid-template-columns:repeat(3,1fr);gap:4px;}'
    +'.sp-dp{display:flex;flex-direction:column;align-items:center;justify-content:center;width:68px;height:68px;'
    +'background:rgba(70,70,70,.7);border:1px solid rgba(150,150,150,.5);border-radius:12px;'
    +'color:#eee;font-size:14px;font-weight:700;cursor:pointer;touch-action:manipulation;'
    +'-webkit-tap-highlight-color:transparent;transition:background .08s;line-height:1.2;}'
    +'.sp-dp .arrow{font-size:24px;line-height:1;}'
    +'.sp-dp .letter{font-size:12px;opacity:.7;line-height:1;}'
    +'.sp-dp:active,.sp-dp.pressed{background:rgba(106,159,255,.8);border-color:#88b4ff;}'
    +'.sp-dp.center{background:rgba(80,80,50,.7);font-size:26px;}'
    // Action grid — 5 columns, big buttons
    +'#sp-actions{display:grid;grid-template-columns:repeat(5,1fr);gap:4px;}'
    +'.sp-act{display:flex;align-items:center;justify-content:center;width:60px;height:54px;'
    +'background:rgba(50,80,50,.7);border:1px solid rgba(100,180,100,.5);border-radius:10px;'
    +'color:#eee;font-size:14px;font-weight:600;cursor:pointer;touch-action:manipulation;'
    +'-webkit-tap-highlight-color:transparent;transition:background .08s;}'
    +'.sp-act:active,.sp-act.pressed{background:rgba(100,200,100,.8);border-color:#8f8;}'
    +'.sp-act.mod-btn{background:rgba(60,50,20,.7);border-color:rgba(180,150,50,.5);}'
    +'.sp-act.mod-btn.active{background:rgba(217,119,6,.8);border-color:#f59e0b;}'
    // Drag handle
    +'.sp-drag-handle{width:100%;height:20px;background:rgba(255,255,255,.12);border-radius:10px 10px 0 0;'
    +'cursor:grab;display:flex;align-items:center;justify-content:center;margin-bottom:4px;}'
    +'.sp-drag-handle::after{content:"";width:36px;height:4px;background:rgba(255,255,255,.35);'
    +'border-radius:2px;}'
    // Existing indicators
    +'#sp-indicator{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);'
    +'background:rgba(0,0,0,.7);color:#fff;padding:8px 18px;border-radius:8px;font-size:18px;'
    +'font-weight:600;z-index:1000000;pointer-events:none;opacity:0;transition:opacity .15s;}'
    +'#sp-indicator.show{opacity:1;}'
    +'#sp-status{position:fixed;top:10px;right:10px;z-index:999999;background:rgba(0,0,0,.7);'
    +'color:#0f0;padding:4px 8px;border-radius:4px;font-size:11px;font-family:monospace;'
    +'pointer-events:none;opacity:0;transition:opacity .3s;}'
    +'#sp-status.show{opacity:1;}'
    +'@media(orientation:landscape){.sp-k{height:56px;font-size:19px;}'
    +'#sp-overlay{padding:2px 3px;}'
    +'.sp-k .vi-arrow{font-size:11px;}'
    +'.sp-dp{width:56px;height:56px;}'
    +'.sp-dp .arrow{font-size:20px;}'
    +'.sp-dp .letter{font-size:10px;}'
    +'.sp-act{width:50px;height:44px;font-size:12px;}}';
  document.head.appendChild(css);

  // ── Status indicator ──
  var status = document.createElement('div');
  status.id = 'sp-status';
  status.setAttribute('style', 'position:fixed !important;top:10px !important;right:10px !important;z-index:2147483647 !important;'
    +'background:rgba(0,0,0,.7) !important;color:#0f0 !important;padding:4px 8px !important;border-radius:4px !important;'
    +'font-size:11px !important;font-family:monospace !important;pointer-events:none !important;'
    +'opacity:0 !important;transition:opacity .3s !important;visibility:visible !important;');
  document.body.appendChild(status);
  var statusTimer = null;
  function showStatus(msg, color) {
    status.textContent = msg;
    status.style.color = color || '#0f0';
    status.style.opacity = '1';
    clearTimeout(statusTimer);
    statusTimer = setTimeout(function() { status.style.opacity = '0'; }, 2000);
  }

  // ── Key indicator ──
  var indicator = document.createElement('div');
  indicator.id = 'sp-indicator';
  indicator.setAttribute('style', 'position:fixed !important;top:50% !important;left:50% !important;transform:translate(-50%,-50%) !important;'
    +'background:rgba(0,0,0,.7) !important;color:#fff !important;padding:8px 18px !important;border-radius:8px !important;'
    +'font-size:18px !important;font-weight:600 !important;z-index:2147483647 !important;pointer-events:none !important;'
    +'opacity:0 !important;transition:opacity .15s !important;visibility:visible !important;');
  document.body.appendChild(indicator);
  var indTimer = null;
  function showIndicator(key) {
    var map = {' ':'Space','Escape':'Esc','Backspace':'⌫','ArrowLeft':'←',
      'ArrowRight':'→','ArrowUp':'↑','ArrowDown':'↓','Control':'Ctrl','CapsLock':'Caps'};
    indicator.textContent = map[key] || key;
    indicator.style.opacity = '1';
    clearTimeout(indTimer);
    indTimer = setTimeout(function() { indicator.style.opacity = '0'; }, 300);
  }

  // ── Button Bar (bottom-right) — all inline styles to override page CSS ──
  var BTN_BASE = 'display:flex !important;align-items:center !important;justify-content:center !important;'
    +'cursor:pointer !important;touch-action:manipulation !important;-webkit-tap-highlight-color:transparent !important;'
    +'box-shadow:0 2px 8px rgba(0,0,0,.4) !important;color:#fff !important;font-family:system-ui,sans-serif !important;'
    +'margin:0 !important;padding:0 !important;line-height:1 !important;visibility:visible !important;opacity:1 !important;'
    +'position:relative !important;float:none !important;';
  var BTN_ROUND = BTN_BASE + 'width:44px !important;height:44px !important;min-width:44px !important;min-height:44px !important;'
    +'border-radius:50% !important;border:2px solid #5af !important;background:rgba(37,99,235,.9) !important;font-size:18px !important;';
  var BTN_ZOOM = BTN_BASE + 'width:36px !important;height:36px !important;min-width:36px !important;min-height:36px !important;'
    +'border-radius:8px !important;border:1px solid #666 !important;background:rgba(60,60,60,.9) !important;font-size:20px !important;font-weight:700 !important;';

  var btnBar = document.createElement('div');
  btnBar.id = 'sp-btn-bar';
  btnBar.setAttribute('style', 'position:fixed !important;bottom:10px !important;right:10px !important;z-index:2147483647 !important;'
    +'display:flex !important;gap:6px !important;align-items:center !important;visibility:visible !important;opacity:1 !important;'
    +'pointer-events:auto !important;transform:none !important;');

  var zoomOutBtn = document.createElement('button');
  zoomOutBtn.setAttribute('style', BTN_ZOOM);
  zoomOutBtn.textContent = '\u2212';
  zoomOutBtn.title = 'Zoom Out';

  var zoomLabel = document.createElement('span');
  zoomLabel.id = 'sp-zoom-label';
  zoomLabel.setAttribute('style', 'color:#ccc !important;font-size:12px !important;font-family:monospace !important;'
    +'background:rgba(0,0,0,.5) !important;padding:2px 6px !important;border-radius:4px !important;'
    +'pointer-events:none !important;visibility:visible !important;opacity:1 !important;display:inline-block !important;');
  zoomLabel.textContent = '100%';

  var zoomInBtn = document.createElement('button');
  zoomInBtn.setAttribute('style', BTN_ZOOM);
  zoomInBtn.textContent = '+';
  zoomInBtn.title = 'Zoom In';

  var zoomResetBtn = document.createElement('button');
  zoomResetBtn.setAttribute('style', BTN_ZOOM + 'font-size:13px !important;');
  zoomResetBtn.textContent = 'R';
  zoomResetBtn.title = 'Reset Zoom';

  var modeToggle = document.createElement('button');
  modeToggle.setAttribute('style', BTN_ROUND + 'background:rgba(0,140,60,.9) !important;border-color:#0a6 !important;font-size:12px !important;font-weight:700 !important;');
  modeToggle.textContent = 'WS';
  modeToggle.title = 'Mode: WebSocket (tap to switch)';

  var gamepadToggle = document.createElement('button');
  gamepadToggle.setAttribute('style', BTN_ROUND);
  gamepadToggle.textContent = '\uD83C\uDFAE';
  gamepadToggle.title = 'D-Pad + Actions';

  var kbToggle = document.createElement('button');
  kbToggle.setAttribute('style', BTN_ROUND);
  kbToggle.textContent = '\u2328';
  kbToggle.title = 'Full Keyboard';

  btnBar.appendChild(zoomOutBtn);
  btnBar.appendChild(zoomLabel);
  btnBar.appendChild(zoomInBtn);
  btnBar.appendChild(zoomResetBtn);
  btnBar.appendChild(modeToggle);
  btnBar.appendChild(gamepadToggle);
  btnBar.appendChild(kbToggle);
  document.body.appendChild(btnBar);

  // ── Mode Toggle Handler ──
  modeToggle.addEventListener('click', function(e) {
    e.stopPropagation();
    if (sendMode === 'ws') {
      sendMode = 'dom';
      modeToggle.textContent = 'DOM';
      modeToggle.setAttribute('style', BTN_ROUND + 'background:rgba(180,100,0,.9) !important;border-color:#f90 !important;font-size:12px !important;font-weight:700 !important;');
      modeToggle.title = 'Mode: DOM Events (tap to switch)';
      showStatus('Mode: DOM', '#f90');
    } else {
      sendMode = 'ws';
      modeToggle.textContent = 'WS';
      modeToggle.setAttribute('style', BTN_ROUND + 'background:rgba(0,140,60,.9) !important;border-color:#0a6 !important;font-size:12px !important;font-weight:700 !important;');
      modeToggle.title = 'Mode: WebSocket (tap to switch)';
      if (!gameSocket || gameSocket.readyState !== WebSocket.OPEN) {
        findExistingSocket();
      }
      if (gameSocket && gameSocket.readyState === WebSocket.OPEN) {
        showStatus('Mode: WS (connected)', '#0f0');
      } else {
        showStatus('Mode: WS (no socket yet)', '#ff0');
      }
    }
  });

  // ── Zoom Functions (CSS zoom — proper layout reflow + scrollable) ──
  function applyZoom() {
    // CSS zoom adjusts layout properly — scrolling works, no clipping
    document.documentElement.style.zoom = (zoomLevel / 100);
    zoomLabel.textContent = zoomLevel + '%';
  }

  zoomInBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    if (zoomLevel < ZOOM_MAX) {
      zoomLevel += ZOOM_STEP;
      applyZoom();
      showStatus('Zoom: ' + zoomLevel + '%', '#5af');
    }
  });
  zoomOutBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    if (zoomLevel > ZOOM_MIN) {
      zoomLevel -= ZOOM_STEP;
      applyZoom();
      showStatus('Zoom: ' + zoomLevel + '%', '#5af');
    }
  });
  zoomResetBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    zoomLevel = 100;
    document.documentElement.style.zoom = '';
    zoomLabel.textContent = '100%';
    showStatus('Zoom: Reset', '#5af');
  });

  // ── Keyboard container (draggable floating panel) ──
  var kb = document.createElement('div');
  kb.id = 'sp-overlay';
  kb.style.display = 'none';

  var kbDragHandle = document.createElement('div');
  kbDragHandle.className = 'sp-drag-handle';
  kb.appendChild(kbDragHandle);

  var rows = document.createElement('div');
  rows.id = 'sp-rows';
  kb.appendChild(rows);
  document.body.appendChild(kb);

  // ── D-Pad Panel (separate floating) ──
  var dpadPanel = document.createElement('div');
  dpadPanel.className = 'sp-float-panel';
  dpadPanel.id = 'sp-dpad-panel';
  dpadPanel.style.display = 'none';
  dpadPanel.style.bottom = '70px';
  dpadPanel.style.left = '10px';

  var dragHandle = document.createElement('div');
  dragHandle.className = 'sp-drag-handle';
  dpadPanel.appendChild(dragHandle);

  var dpadGrid = document.createElement('div');
  dpadGrid.id = 'sp-dpad';
  DPAD.forEach(function(row, ri) {
    row.forEach(function(def, ci) {
      var btn = document.createElement('button');
      btn.className = 'sp-dp';
      if (ri === 1 && ci === 1) btn.classList.add('center');
      var parts = def.label.split('\n');
      if (parts.length === 2) {
        btn.innerHTML = '<span class="arrow">' + parts[0] + '</span><span class="letter">' + parts[1] + '</span>';
      } else {
        btn.textContent = def.label;
      }
      btn.title = def.desc;
      btn.dataset.char = def.char;
      dpadGrid.appendChild(btn);
    });
  });
  dpadPanel.appendChild(dpadGrid);
  document.body.appendChild(dpadPanel);

  // ── Action Panel (separate floating) ──
  var actPanel = document.createElement('div');
  actPanel.className = 'sp-float-panel';
  actPanel.id = 'sp-act-panel';
  actPanel.style.display = 'none';
  actPanel.style.bottom = '70px';
  actPanel.style.right = '10px';

  var actDragHandle = document.createElement('div');
  actDragHandle.className = 'sp-drag-handle';
  actPanel.appendChild(actDragHandle);

  var actGrid = document.createElement('div');
  actGrid.id = 'sp-actions';
  ACTIONS.forEach(function(row) {
    row.forEach(function(def) {
      var btn = document.createElement('button');
      btn.className = 'sp-act';
      if (def.mod) {
        btn.classList.add('mod-btn');
        btn.dataset.mod = def.mod;
      }
      btn.textContent = def.label;
      btn.title = def.desc;
      if (def.char) btn.dataset.char = def.char;
      if (def.keycode !== undefined) btn.dataset.keycode = def.keycode;
      actGrid.appendChild(btn);
    });
  });
  actPanel.appendChild(actGrid);
  document.body.appendChild(actPanel);

  // ── D-Pad / Action button press handler ──
  function pressDpadBtn(btn) {
    showIndicator(btn.dataset.char || btn.textContent);
    if (btn.dataset.mod) {
      toggleMod(btn.dataset.mod);
      actPanel.querySelectorAll('.sp-act.mod-btn').forEach(function(b) {
        var m = b.dataset.mod;
        var a = false;
        if (m === 'ctrl') a = ctrl;
        else if (m === 'shift') a = shift;
        b.classList.toggle('active', a);
      });
      return;
    }
    if (btn.dataset.keycode) {
      var kc = parseInt(btn.dataset.keycode, 10);
      // If ctrl is active and we're sending a keycode-based key, handle specially
      if (ctrl && kc !== 27) {
        // For Tab with Ctrl, send Ctrl+I (keycode 9)
        sendKeycode(kc);
      } else {
        sendKeycode(kc);
      }
      // Reset modifiers after use (if not a modifier button itself)
      if (ctrl) { ctrl = false; updateModButtons(); }
      if (shift) { shift = false; updateModButtons(); }
    } else if (btn.dataset.char) {
      var ch = btn.dataset.char;
      // Apply modifiers
      if (shift && ch.length === 1 && ch >= 'a' && ch <= 'z') {
        ch = ch.toUpperCase();
      } else if (shift && ch === '.') {
        ch = '>'; // shift+. = > (descend)
      } else if (shift && ch === ',') {
        ch = '<'; // shift+, = < (ascend)
      }
      if (ctrl && ch.length === 1) {
        var code = ch.toUpperCase().charCodeAt(0);
        if (code >= 65 && code <= 90) {
          sendKeycode(code - 64);
          ctrl = false; updateModButtons();
          return;
        }
      }
      sendChar(ch);
      // Reset modifiers after use
      if (ctrl) { ctrl = false; updateModButtons(); }
      if (shift) { shift = false; updateModButtons(); }
    }
  }

  function updateModButtons() {
    updateMods();
    updateLabels();
    actPanel.querySelectorAll('.sp-act.mod-btn').forEach(function(b) {
      var m = b.dataset.mod;
      var a = false;
      if (m === 'ctrl') a = ctrl;
      else if (m === 'shift') a = shift;
      b.classList.toggle('active', a);
    });
  }

  // ── Shared touch/mouse handler for both panels ──
  var padTouches = new Map();
  var padMouseBtn = null;

  function attachPanelEvents(panel) {
    panel.addEventListener('touchstart', function(e) {
      var t0 = e.changedTouches[0];
      var el = document.elementFromPoint(t0.clientX, t0.clientY);
      if (el && (el.classList.contains('sp-drag-handle') || el.closest('.sp-drag-handle'))) return;
      e.preventDefault(); e.stopPropagation();
      for (var i = 0; i < e.changedTouches.length; i++) {
        var t = e.changedTouches[i];
        el = document.elementFromPoint(t.clientX, t.clientY);
        var btn = el && (el.closest('.sp-dp') || el.closest('.sp-act'));
        if (!btn) continue;
        btn.classList.add('pressed');
        padTouches.set(t.identifier, btn);
        pressDpadBtn(btn);
      }
    }, { passive: false, capture: true });

    panel.addEventListener('touchend', function(e) {
      e.preventDefault(); e.stopPropagation();
      for (var i = 0; i < e.changedTouches.length; i++) {
        var t = e.changedTouches[i];
        var btn = padTouches.get(t.identifier);
        if (btn) { btn.classList.remove('pressed'); padTouches.delete(t.identifier); }
      }
    }, { passive: false, capture: true });

    panel.addEventListener('touchcancel', function(e) {
      for (var i = 0; i < e.changedTouches.length; i++) {
        var t = e.changedTouches[i];
        var btn = padTouches.get(t.identifier);
        if (btn) { btn.classList.remove('pressed'); padTouches.delete(t.identifier); }
      }
    }, { passive: false });

    panel.addEventListener('mousedown', function(e) {
      var btn = e.target.closest('.sp-dp') || e.target.closest('.sp-act');
      if (!btn) return;
      e.preventDefault(); e.stopPropagation();
      btn.classList.add('pressed');
      padMouseBtn = btn;
      pressDpadBtn(btn);
    });
  }
  attachPanelEvents(dpadPanel);
  attachPanelEvents(actPanel);

  document.addEventListener('mouseup', function() {
    if (padMouseBtn) { padMouseBtn.classList.remove('pressed'); padMouseBtn = null; }
  });

  // ── Drag to Reposition (shared logic, independent states) ──
  function makeDraggable(handle, panel) {
    var ds = { active: false, startX: 0, startY: 0, origX: 0, origY: 0 };

    handle.addEventListener('touchstart', function(e) {
      e.preventDefault();
      var t = e.changedTouches[0];
      var rect = panel.getBoundingClientRect();
      ds.active = true;
      ds.startX = t.clientX; ds.startY = t.clientY;
      ds.origX = rect.left; ds.origY = rect.top;
    }, { passive: false });

    handle.addEventListener('mousedown', function(e) {
      e.preventDefault();
      var rect = panel.getBoundingClientRect();
      ds.active = true;
      ds.startX = e.clientX; ds.startY = e.clientY;
      ds.origX = rect.left; ds.origY = rect.top;
    });

    document.addEventListener('touchmove', function(e) {
      if (!ds.active) return;
      var t = e.changedTouches[0];
      panel.style.left = (ds.origX + t.clientX - ds.startX) + 'px';
      panel.style.top = (ds.origY + t.clientY - ds.startY) + 'px';
      panel.style.bottom = 'auto'; panel.style.right = 'auto';
    }, { passive: true });

    document.addEventListener('mousemove', function(e) {
      if (!ds.active) return;
      panel.style.left = (ds.origX + e.clientX - ds.startX) + 'px';
      panel.style.top = (ds.origY + e.clientY - ds.startY) + 'px';
      panel.style.bottom = 'auto'; panel.style.right = 'auto';
    });

    document.addEventListener('touchend', function() { ds.active = false; });
    document.addEventListener('mouseup', function() { ds.active = false; });
  }
  makeDraggable(dragHandle, dpadPanel);
  makeDraggable(actDragHandle, actPanel);

  // Keyboard: vertical-only drag (horizontal stays fixed full-width)
  (function() {
    var ds = { active: false, startY: 0, origY: 0 };
    kbDragHandle.addEventListener('touchstart', function(e) {
      e.preventDefault();
      var t = e.changedTouches[0];
      ds.active = true; ds.startY = t.clientY; ds.origY = kb.getBoundingClientRect().top;
    }, { passive: false });
    kbDragHandle.addEventListener('mousedown', function(e) {
      e.preventDefault();
      ds.active = true; ds.startY = e.clientY; ds.origY = kb.getBoundingClientRect().top;
    });
    document.addEventListener('touchmove', function(e) {
      if (!ds.active) return;
      var t = e.changedTouches[0];
      kb.style.top = (ds.origY + t.clientY - ds.startY) + 'px';
      kb.style.bottom = 'auto';
    }, { passive: true });
    document.addEventListener('mousemove', function(e) {
      if (!ds.active) return;
      kb.style.top = (ds.origY + e.clientY - ds.startY) + 'px';
      kb.style.bottom = 'auto';
    });
    document.addEventListener('touchend', function() { ds.active = false; });
    document.addEventListener('mouseup', function() { ds.active = false; });
  })();

  // ── Helper functions for full keyboard ──
  function effectiveKey(k) {
    var base = k.key;
    var s = k.s;
    var mod = k.mod;
    if (mod || base.length > 1) return base;
    if (shift && s) return s;
    if ((shift || caps) && base >= 'a' && base <= 'z') return base.toUpperCase();
    return base;
  }

  // vi-key arrow map for full keyboard
  var VI_ARROWS = {y:'\u2196',k:'\u2191',u:'\u2197',h:'\u2190',l:'\u2192',b:'\u2199',j:'\u2193',n:'\u2198'};

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
        var arrow = VI_ARROWS[k.key];
        if (arrow && !k.mod) {
          btn.innerHTML = '<span>' + label + '</span><span class="vi-arrow">' + arrow + '</span>';
          btn.dataset.vi = '1';
        } else {
          btn.textContent = label;
        }
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
        var label;
        if (k.s && shift) label = k.s;
        else if (k.key.length === 1 && k.key >= 'a' && k.key <= 'z')
          label = (shift || caps) ? k.key.toUpperCase() : k.key;
        else if (k.s && !shift) label = k.label || k.key;
        else label = null;
        if (label !== null) {
          var arrow = VI_ARROWS[k.key];
          if (arrow && btn.dataset.vi) {
            btn.innerHTML = '<span>' + label + '</span><span class="vi-arrow">' + arrow + '</span>';
          } else {
            btn.textContent = label;
          }
        }
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
      sendToCrawl(k);
      showStatus((sendMode === 'ws' ? 'WS' : 'DOM') + ': ' + ek,
                  sendMode === 'ws' ? '#0f0' : '#f90');
    } catch(e) {
      showStatus('ERR: ' + e.message, '#f00');
    }
  }

  // ── Full Keyboard Touch ──
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

  // ── Full Keyboard Mouse ──
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

  // ── Toggle: Gamepad (D-Pad + Actions — two panels) ──
  var dpadVisible = false;
  gamepadToggle.addEventListener('click', function(e) {
    e.stopPropagation();
    dpadVisible = !dpadVisible;
    dpadPanel.style.display = dpadVisible ? '' : 'none';
    actPanel.style.display = dpadVisible ? '' : 'none';
    gamepadToggle.setAttribute('style', dpadVisible
      ? BTN_ROUND + 'background:rgba(220,50,50,.9) !important;border-color:#f66 !important;'
      : BTN_ROUND);
  });

  // ── Toggle: Full Keyboard ──
  var kbVisible = false;
  kbToggle.addEventListener('click', function(e) {
    e.stopPropagation();
    kbVisible = !kbVisible;
    kb.style.display = kbVisible ? '' : 'none';
    kbToggle.setAttribute('style', kbVisible
      ? BTN_ROUND + 'background:rgba(220,50,50,.9) !important;border-color:#f66 !important;'
      : BTN_ROUND);
  });

  buildKeys();
  showStatus('ScreenPad v2 로드됨', '#5af');
})();
