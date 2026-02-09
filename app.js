// ── Keyboard Layout Data ──
const KEYBOARD_LAYOUT = [
  // Row 0: F-keys (toggleable)
  { fn: true, keys: [
    { key: 'Escape', code: 'Escape', keyCode: 27, label: 'Esc', width: 1.5 },
    { key: 'F1', code: 'F1', keyCode: 112 },
    { key: 'F2', code: 'F2', keyCode: 113 },
    { key: 'F3', code: 'F3', keyCode: 114 },
    { key: 'F4', code: 'F4', keyCode: 115 },
    { key: 'F5', code: 'F5', keyCode: 116 },
    { key: 'F6', code: 'F6', keyCode: 117 },
    { key: 'F7', code: 'F7', keyCode: 118 },
    { key: 'F8', code: 'F8', keyCode: 119 },
    { key: 'F9', code: 'F9', keyCode: 120 },
    { key: 'F10', code: 'F10', keyCode: 121 },
    { key: 'F11', code: 'F11', keyCode: 122 },
    { key: 'F12', code: 'F12', keyCode: 123 },
  ]},
  // Row 1: Number row
  { keys: [
    { key: '`', code: 'Backquote', keyCode: 192, shift: '~' },
    { key: '1', code: 'Digit1', keyCode: 49, shift: '!' },
    { key: '2', code: 'Digit2', keyCode: 50, shift: '@' },
    { key: '3', code: 'Digit3', keyCode: 51, shift: '#' },
    { key: '4', code: 'Digit4', keyCode: 52, shift: '$' },
    { key: '5', code: 'Digit5', keyCode: 53, shift: '%' },
    { key: '6', code: 'Digit6', keyCode: 54, shift: '^' },
    { key: '7', code: 'Digit7', keyCode: 55, shift: '&' },
    { key: '8', code: 'Digit8', keyCode: 56, shift: '*' },
    { key: '9', code: 'Digit9', keyCode: 57, shift: '(' },
    { key: '0', code: 'Digit0', keyCode: 48, shift: ')' },
    { key: '-', code: 'Minus', keyCode: 189, shift: '_' },
    { key: '=', code: 'Equal', keyCode: 187, shift: '+' },
    { key: 'Backspace', code: 'Backspace', keyCode: 8, label: '⌫', width: 1.5 },
  ]},
  // Row 2: QWERTY
  { keys: [
    { key: 'Tab', code: 'Tab', keyCode: 9, width: 1.5 },
    { key: 'q', code: 'KeyQ', keyCode: 81 },
    { key: 'w', code: 'KeyW', keyCode: 87 },
    { key: 'e', code: 'KeyE', keyCode: 69 },
    { key: 'r', code: 'KeyR', keyCode: 82 },
    { key: 't', code: 'KeyT', keyCode: 84 },
    { key: 'y', code: 'KeyY', keyCode: 89 },
    { key: 'u', code: 'KeyU', keyCode: 85 },
    { key: 'i', code: 'KeyI', keyCode: 73 },
    { key: 'o', code: 'KeyO', keyCode: 79 },
    { key: 'p', code: 'KeyP', keyCode: 80 },
    { key: '[', code: 'BracketLeft', keyCode: 219, shift: '{' },
    { key: ']', code: 'BracketRight', keyCode: 221, shift: '}' },
    { key: '\\', code: 'Backslash', keyCode: 220, shift: '|', width: 1.2 },
  ]},
  // Row 3: Home row
  { keys: [
    { key: 'CapsLock', code: 'CapsLock', keyCode: 20, label: 'Caps', width: 1.8, modifier: 'caps' },
    { key: 'a', code: 'KeyA', keyCode: 65 },
    { key: 's', code: 'KeyS', keyCode: 83 },
    { key: 'd', code: 'KeyD', keyCode: 68 },
    { key: 'f', code: 'KeyF', keyCode: 70 },
    { key: 'g', code: 'KeyG', keyCode: 71 },
    { key: 'h', code: 'KeyH', keyCode: 72 },
    { key: 'j', code: 'KeyJ', keyCode: 74 },
    { key: 'k', code: 'KeyK', keyCode: 75 },
    { key: 'l', code: 'KeyL', keyCode: 76 },
    { key: ';', code: 'Semicolon', keyCode: 186, shift: ':' },
    { key: "'", code: 'Quote', keyCode: 222, shift: '"' },
    { key: 'Enter', code: 'Enter', keyCode: 13, label: 'Enter', width: 2 },
  ]},
  // Row 4: Shift row
  { keys: [
    { key: 'Shift', code: 'ShiftLeft', keyCode: 16, label: '⇧', width: 2.2, modifier: 'shift' },
    { key: 'z', code: 'KeyZ', keyCode: 90 },
    { key: 'x', code: 'KeyX', keyCode: 88 },
    { key: 'c', code: 'KeyC', keyCode: 67 },
    { key: 'v', code: 'KeyV', keyCode: 86 },
    { key: 'b', code: 'KeyB', keyCode: 66 },
    { key: 'n', code: 'KeyN', keyCode: 78 },
    { key: 'm', code: 'KeyM', keyCode: 77 },
    { key: ',', code: 'Comma', keyCode: 188, shift: '<' },
    { key: '.', code: 'Period', keyCode: 190, shift: '>' },
    { key: '/', code: 'Slash', keyCode: 191, shift: '?' },
    { key: 'Shift', code: 'ShiftRight', keyCode: 16, label: '⇧', width: 2.2, modifier: 'shift' },
  ]},
  // Row 5: Bottom row
  { keys: [
    { key: 'Control', code: 'ControlLeft', keyCode: 17, label: 'Ctrl', width: 1.5, modifier: 'ctrl' },
    { key: 'Alt', code: 'AltLeft', keyCode: 18, label: 'Alt', width: 1.5, modifier: 'alt' },
    { key: ' ', code: 'Space', keyCode: 32, label: 'Space', space: true },
    { key: 'ArrowLeft', code: 'ArrowLeft', keyCode: 37, label: '←' },
    { key: 'ArrowUp', code: 'ArrowUp', keyCode: 38, label: '↑' },
    { key: 'ArrowDown', code: 'ArrowDown', keyCode: 40, label: '↓' },
    { key: 'ArrowRight', code: 'ArrowRight', keyCode: 39, label: '→' },
  ]},
];

// ── State ──
let shiftActive = false;
let ctrlActive = false;
let altActive = false;
let capsActive = false;
let fnVisible = false;
let zoomLevel = 100; // percent

// Track active touches → key elements
const activeTouches = new Map();
// Track mouse-down key
let mouseDownBtn = null;

// Key indicator hide timer
let indicatorTimer = null;

// ── DOM References (deferred to init) ──
let gameFrame, frameWrap, keyboard, kbRows, kbToggle;
let fnToggleBtn, opacityToggleBtn, kbCloseBtn;
let opacityControl, opacitySlider;
let urlBar, urlToggle, urlForm, urlInput, urlHistoryList;
let keyIndicator;
let zoomInBtn, zoomOutBtn, zoomResetBtn, zoomLabel;

// ── Build Keyboard ──
function buildKeyboard() {
  kbRows.innerHTML = '';
  KEYBOARD_LAYOUT.forEach((rowDef) => {
    const row = document.createElement('div');
    row.className = 'kb-row';
    if (rowDef.fn) {
      row.classList.add('fn-row');
      if (fnVisible) row.classList.add('visible');
    }

    rowDef.keys.forEach((keyDef) => {
      const btn = document.createElement('button');
      btn.className = 'kb-key';
      btn.setAttribute('data-code', keyDef.code);
      btn.setAttribute('data-key', keyDef.key);
      btn.setAttribute('data-keycode', keyDef.keyCode);
      if (keyDef.shift) btn.setAttribute('data-shift', keyDef.shift);

      // Label
      const label = keyDef.label || keyDef.key;
      btn.textContent = isUpperCase(keyDef) ? label.toUpperCase() : label;

      // Width classes
      if (keyDef.width) {
        const w = keyDef.width;
        if (w <= 1.2) btn.classList.add('w-1-2');
        else if (w <= 1.5) btn.classList.add('w-1-5');
        else if (w <= 1.8) btn.classList.add('w-1-8');
        else if (w <= 2.0) btn.classList.add('w-2');
        else if (w <= 2.2) btn.classList.add('w-2-2');
        else btn.classList.add('w-2-5');
      }

      // Space bar
      if (keyDef.space) btn.classList.add('space');

      // Modifier
      if (keyDef.modifier) {
        btn.classList.add('modifier');
        btn.setAttribute('data-modifier', keyDef.modifier);
      }

      row.appendChild(btn);
    });

    kbRows.appendChild(row);
  });
  updateModifierVisuals();
  updateKeyLabels();
}

function isUpperCase(keyDef) {
  return keyDef.key.length === 1 && keyDef.key >= 'a' && keyDef.key <= 'z' && (shiftActive || capsActive);
}

function updateKeyLabels() {
  kbRows.querySelectorAll('.kb-key').forEach((btn) => {
    const baseKey = btn.getAttribute('data-key');
    const shiftChar = btn.getAttribute('data-shift');
    if (shiftChar && shiftActive) {
      btn.textContent = shiftChar;
    } else if (baseKey.length === 1 && baseKey >= 'a' && baseKey <= 'z') {
      btn.textContent = (shiftActive || capsActive) ? baseKey.toUpperCase() : baseKey;
    } else if (shiftChar && !shiftActive) {
      btn.textContent = baseKey;
    }
  });
}

function updateModifierVisuals() {
  kbRows.querySelectorAll('.kb-key.modifier').forEach((btn) => {
    const mod = btn.getAttribute('data-modifier');
    let active = false;
    if (mod === 'shift') active = shiftActive;
    else if (mod === 'ctrl') active = ctrlActive;
    else if (mod === 'alt') active = altActive;
    else if (mod === 'caps') active = capsActive;
    btn.classList.toggle('active', active);
  });
}

// ── Key Event Dispatch ──
function sendKey(type, keyDef) {
  const effectiveKey = getEffectiveKey(keyDef);
  const eventInit = {
    key: effectiveKey,
    code: keyDef.code,
    keyCode: keyDef.keyCode,
    which: keyDef.keyCode,
    bubbles: true,
    cancelable: true,
    shiftKey: shiftActive,
    ctrlKey: ctrlActive,
    altKey: altActive,
    metaKey: false,
  };

  // Show visual indicator
  if (type === 'keydown') {
    showKeyIndicator(effectiveKey);
  }

  // Dispatch into iframe (best-effort, silently fail if cross-origin)
  try {
    const win = gameFrame.contentWindow;
    if (win) {
      const doc = win.document;
      if (doc && doc.body) {
        const targets = [win, doc, doc.body, doc.documentElement];
        const activeEl = doc.activeElement;
        if (activeEl && !targets.includes(activeEl)) {
          targets.push(activeEl);
        }
        targets.forEach((t) => {
          if (t) {
            try { t.dispatchEvent(new KeyboardEvent(type, eventInit)); } catch (_) {}
          }
        });
      }
    }
  } catch (_) {
    // Cross-origin or empty iframe — silently ignore
  }

  // Always dispatch on main document + window
  document.dispatchEvent(new KeyboardEvent(type, eventInit));
  window.dispatchEvent(new KeyboardEvent(type, eventInit));

  // Standalone text output
  if (type === 'keydown') {
    const output = document.getElementById('text-output');
    if (output && !output.classList.contains('hidden')) {
      appendToTextOutput(output, eventInit);
    }
  }
}

function getEffectiveKey(keyDef) {
  if (keyDef.modifier || keyDef.key.length > 1) return keyDef.key;
  const baseKey = keyDef.key;
  if (shiftActive && keyDef.shift) return keyDef.shift;
  if ((shiftActive || capsActive) && baseKey >= 'a' && baseKey <= 'z') return baseKey.toUpperCase();
  return baseKey;
}

function showKeyIndicator(key) {
  // Friendly label for display
  const displayMap = {
    ' ': 'Space', 'Escape': 'Esc', 'Backspace': '⌫',
    'ArrowLeft': '←', 'ArrowRight': '→', 'ArrowUp': '↑', 'ArrowDown': '↓',
    'Control': 'Ctrl', 'CapsLock': 'Caps',
  };
  const display = displayMap[key] || key;
  keyIndicator.textContent = display;
  keyIndicator.classList.add('show');
  clearTimeout(indicatorTimer);
  indicatorTimer = setTimeout(() => {
    keyIndicator.classList.remove('show');
  }, 300);
}

// ── Touch Handling (multi-touch) ──
function handleTouchStart(e) {
  e.preventDefault();
  for (let i = 0; i < e.changedTouches.length; i++) {
    const touch = e.changedTouches[i];
    const btn = document.elementFromPoint(touch.clientX, touch.clientY);
    const key = btn && btn.closest('.kb-key');
    if (!key) continue;

    const modifier = key.getAttribute('data-modifier');
    if (modifier) {
      toggleModifier(modifier);
    } else {
      key.classList.add('pressed');
      activeTouches.set(touch.identifier, key);
      const keyDef = getKeyDefFromBtn(key);
      sendKey('keydown', keyDef);
    }
  }
}

function handleTouchEnd(e) {
  e.preventDefault();
  for (let i = 0; i < e.changedTouches.length; i++) {
    const touch = e.changedTouches[i];
    const key = activeTouches.get(touch.identifier);
    if (!key) continue;
    key.classList.remove('pressed');
    const keyDef = getKeyDefFromBtn(key);
    sendKey('keyup', keyDef);
    activeTouches.delete(touch.identifier);
  }
}

function handleTouchCancel(e) {
  handleTouchEnd(e);
}

// ── Mouse fallback for desktop testing ──
function handleMouseDown(e) {
  const btn = e.target.closest('.kb-key');
  if (!btn) return;
  e.preventDefault();

  const modifier = btn.getAttribute('data-modifier');
  if (modifier) {
    toggleModifier(modifier);
    return;
  }

  btn.classList.add('pressed');
  mouseDownBtn = btn;
  const keyDef = getKeyDefFromBtn(btn);
  sendKey('keydown', keyDef);
}

function handleGlobalMouseUp(e) {
  if (!mouseDownBtn) return;
  mouseDownBtn.classList.remove('pressed');
  const keyDef = getKeyDefFromBtn(mouseDownBtn);
  sendKey('keyup', keyDef);
  mouseDownBtn = null;
}

function getKeyDefFromBtn(btn) {
  return {
    key: btn.getAttribute('data-key'),
    code: btn.getAttribute('data-code'),
    keyCode: parseInt(btn.getAttribute('data-keycode'), 10),
    shift: btn.getAttribute('data-shift') || undefined,
    modifier: btn.getAttribute('data-modifier') || undefined,
  };
}

function toggleModifier(mod) {
  if (mod === 'shift') shiftActive = !shiftActive;
  else if (mod === 'ctrl') ctrlActive = !ctrlActive;
  else if (mod === 'alt') altActive = !altActive;
  else if (mod === 'caps') capsActive = !capsActive;
  updateModifierVisuals();
  updateKeyLabels();
}

// ── Layout: resize iframe to fit between URL bar & keyboard ──
function updateLayout() {
  const urlBarH = urlBar.offsetHeight;
  const kbH = keyboard.classList.contains('hidden') ? 0 : keyboard.offsetHeight;

  frameWrap.style.top = urlBarH + 'px';
  frameWrap.style.bottom = kbH + 'px';

  // Move float controls above keyboard
  const floatControls = document.getElementById('float-controls');
  floatControls.style.bottom = (kbH + 10) + 'px';

  // Move opacity control above float controls
  opacityControl.style.bottom = (kbH + 56) + 'px';

  // Re-apply zoom with new dimensions
  applyZoom();
}

// ── Keyboard Visibility ──
function toggleKeyboard() {
  const isVisible = !keyboard.classList.contains('hidden');
  keyboard.classList.toggle('hidden', isVisible);
  kbToggle.classList.toggle('active', !isVisible);
  if (isVisible) {
    opacityControl.classList.add('hidden');
  }
  // Wait a frame so offsetHeight is updated
  requestAnimationFrame(updateLayout);
}

// ── F-key Row Toggle ──
function toggleFnRow() {
  fnVisible = !fnVisible;
  fnToggleBtn.classList.toggle('active', fnVisible);
  kbRows.querySelectorAll('.fn-row').forEach((row) => {
    row.classList.toggle('visible', fnVisible);
  });
  requestAnimationFrame(updateLayout);
}

// ── Zoom ──
function setZoom(level) {
  zoomLevel = Math.max(25, Math.min(300, level));
  zoomLabel.textContent = zoomLevel + '%';
  localStorage.setItem('screenpad-zoom', zoomLevel);
  applyZoom();
}

function applyZoom() {
  const scale = zoomLevel / 100;
  if (scale === 1) {
    gameFrame.style.width = '100%';
    gameFrame.style.height = '100%';
    gameFrame.style.transform = 'none';
    return;
  }
  // Use actual pixel dimensions from the wrapper
  const rect = frameWrap.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return;
  const iframeW = Math.round(rect.width / scale);
  const iframeH = Math.round(rect.height / scale);
  gameFrame.style.width = iframeW + 'px';
  gameFrame.style.height = iframeH + 'px';
  gameFrame.style.transform = `scale(${scale})`;
  gameFrame.style.transformOrigin = '0 0';
}

function initZoom() {
  const saved = localStorage.getItem('screenpad-zoom');
  if (saved) {
    zoomLevel = parseInt(saved, 10) || 100;
  }
  // Applied via updateLayout → applyZoom
}

// ── Opacity ──
function initOpacity() {
  const saved = localStorage.getItem('screenpad-opacity');
  if (saved) {
    opacitySlider.value = saved;
  }
  applyOpacity();
}

function applyOpacity() {
  const val = opacitySlider.value / 100;
  keyboard.style.background = `rgba(30, 30, 30, ${val})`;
  localStorage.setItem('screenpad-opacity', opacitySlider.value);
}

// ── URL Bar ──
function loadURL(url) {
  if (!url) return;
  if (!/^https?:\/\//i.test(url)) {
    url = 'https://' + url;
  }
  urlInput.value = url;
  saveToHistory(url);
  urlBar.classList.add('collapsed');
  urlToggle.textContent = '▼';

  // Hide standalone text output
  const output = document.getElementById('text-output');
  if (output) output.classList.add('hidden');

  // Load directly in iframe (no proxy server needed)
  gameFrame.src = url;
  gameFrame.onload = () => {
    gameFrame.contentWindow.focus();
  };

  requestAnimationFrame(updateLayout);
}

function appendToTextOutput(output, eventInit) {
  const key = eventInit.key;
  if (key === 'Backspace') {
    output.value = output.value.slice(0, -1);
  } else if (key === 'Enter') {
    output.value += '\n';
  } else if (key === 'Tab') {
    output.value += '  ';
  } else if (key === ' ') {
    output.value += ' ';
  } else if (key.length === 1) {
    output.value += key;
  }
  // Auto-scroll to bottom
  output.scrollTop = output.scrollHeight;
}

function saveToHistory(url) {
  let history = getHistory();
  history = history.filter((u) => u !== url);
  history.unshift(url);
  if (history.length > 10) history = history.slice(0, 10);
  localStorage.setItem('screenpad-history', JSON.stringify(history));
  renderHistory();
}

function getHistory() {
  try {
    return JSON.parse(localStorage.getItem('screenpad-history') || '[]');
  } catch {
    return [];
  }
}

function renderHistory() {
  urlHistoryList.innerHTML = '';
  getHistory().forEach((url) => {
    const item = document.createElement('button');
    item.className = 'history-item';
    try {
      item.textContent = new URL(url).hostname;
    } catch {
      item.textContent = url.slice(0, 30);
    }
    item.title = url;
    item.addEventListener('click', () => {
      urlInput.value = url;
      loadURL(url);
    });
    urlHistoryList.appendChild(item);
  });
}

// ── Init ──
function init() {
  // Grab DOM references
  gameFrame = document.getElementById('game-frame');
  frameWrap = document.getElementById('frame-wrap');
  keyboard = document.getElementById('keyboard');
  kbRows = document.getElementById('kb-rows');
  kbToggle = document.getElementById('kb-toggle');
  fnToggleBtn = document.getElementById('fn-toggle');
  opacityToggleBtn = document.getElementById('opacity-toggle');
  kbCloseBtn = document.getElementById('kb-close');
  opacityControl = document.getElementById('opacity-control');
  opacitySlider = document.getElementById('opacity-slider');
  urlBar = document.getElementById('url-bar');
  urlToggle = document.getElementById('url-toggle');
  urlForm = document.getElementById('url-form');
  urlInput = document.getElementById('url-input');
  urlHistoryList = document.getElementById('url-history-list');
  keyIndicator = document.getElementById('key-indicator');
  zoomInBtn = document.getElementById('zoom-in');
  zoomOutBtn = document.getElementById('zoom-out');
  zoomResetBtn = document.getElementById('zoom-reset');
  zoomLabel = document.getElementById('zoom-label');

  buildKeyboard();
  initOpacity();
  initZoom();
  renderHistory();

  // Keyboard touch events
  kbRows.addEventListener('touchstart', handleTouchStart, { passive: false });
  kbRows.addEventListener('touchend', handleTouchEnd, { passive: false });
  kbRows.addEventListener('touchcancel', handleTouchCancel, { passive: false });

  // Mouse fallback — mouseup on document so it fires even if pointer leaves the key
  kbRows.addEventListener('mousedown', handleMouseDown);
  document.addEventListener('mouseup', handleGlobalMouseUp);

  // Keyboard toggle
  kbToggle.addEventListener('click', toggleKeyboard);
  kbCloseBtn.addEventListener('click', toggleKeyboard);

  // F-key toggle
  fnToggleBtn.addEventListener('click', toggleFnRow);

  // Opacity
  opacityToggleBtn.addEventListener('click', () => {
    opacityControl.classList.toggle('hidden');
  });
  opacitySlider.addEventListener('input', applyOpacity);

  // Zoom controls — use touchend + click for reliable mobile response
  function addTapHandler(btn, fn) {
    let touched = false;
    btn.addEventListener('touchend', (e) => {
      e.preventDefault();
      touched = true;
      fn();
    }, { passive: false });
    btn.addEventListener('click', (e) => {
      if (touched) { touched = false; return; }
      fn();
    });
  }
  addTapHandler(zoomInBtn, () => setZoom(zoomLevel + 10));
  addTapHandler(zoomOutBtn, () => setZoom(zoomLevel - 10));
  addTapHandler(zoomResetBtn, () => setZoom(100));

  // URL bar toggle
  urlToggle.addEventListener('click', () => {
    urlBar.classList.toggle('collapsed');
    urlToggle.textContent = urlBar.classList.contains('collapsed') ? '▼' : '▲';
    requestAnimationFrame(updateLayout);
  });

  urlForm.addEventListener('submit', (e) => {
    e.preventDefault();
    loadURL(urlInput.value.trim());
    urlInput.blur();
  });

  // Hide keyboard when focusing URL input (so native keyboard doesn't overlap)
  urlInput.addEventListener('focus', () => {
    keyboard.classList.add('hidden');
    kbToggle.classList.remove('active');
    requestAnimationFrame(updateLayout);
  });

  // Recalculate layout on resize / orientation change
  window.addEventListener('resize', updateLayout);
  window.addEventListener('orientationchange', () => {
    setTimeout(updateLayout, 200);
  });

  // Initial layout
  requestAnimationFrame(updateLayout);

  // Register service worker for PWA / offline support
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js');
  }

  // Debug logging (localhost only)
  if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
    ['keydown', 'keyup'].forEach((type) => {
      document.addEventListener(type, (e) => {
        if (e.isTrusted) return;
        console.log(`[ScreenPad] ${type}: key="${e.key}" code="${e.code}" shift=${e.shiftKey} ctrl=${e.ctrlKey} alt=${e.altKey}`);
      });
    });
  }
}

document.addEventListener('DOMContentLoaded', init);
