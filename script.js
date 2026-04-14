const undoStack = [];
const redoStack = [];
const canvas = document.getElementById('mandalaCanvas');
const ctx = canvas.getContext('2d');

let isDrawing = false;
let segments = 8;
let brushSize = 5;
let currentColor = '#e8638a';
let lastX = 0;
let lastY = 0;
let opacity = 1;
let brushShape = 'circle';

// ── Undo / Redo ───────────────────────────────────────────────────────────────
function saveState() {
  undoStack.push(canvas.toDataURL());
  if (undoStack.length > 20) undoStack.shift();
  redoStack.length = 0;
}

function undo() {
  if (undoStack.length === 0) return;
  redoStack.push(canvas.toDataURL());
  const img = new Image();
  img.onload = () => ctx.drawImage(img, 0, 0);
  img.src = undoStack.pop();
}

function redo() {
  if (redoStack.length === 0) return;
  undoStack.push(canvas.toDataURL());
  const img = new Image();
  img.onload = () => ctx.drawImage(img, 0, 0);
  img.src = redoStack.pop();
}

// ── Canvas init ───────────────────────────────────────────────────────────────
function initCanvas() {
  const container = canvas.parentElement;
  const size = Math.min(container.clientWidth - 48, 700);
  canvas.width = size;
  canvas.height = size;

  const overlay = document.querySelector('.canvas-overlay');
  overlay.style.width = size + 'px';
  overlay.style.height = size + 'px';

  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

window.addEventListener('load', initCanvas);
window.addEventListener('resize', initCanvas);

// ── Helpers ───────────────────────────────────────────────────────────────────
function getCenter() {
  return { x: canvas.width / 2, y: canvas.height / 2 };
}

function rotate(dx, dy, a) {
  return [dx * Math.cos(a) - dy * Math.sin(a), dx * Math.sin(a) + dy * Math.cos(a)];
}

// ── Drawing ───────────────────────────────────────────────────────────────────
function drawSymmetricalLine(x1, y1, x2, y2) {
  const { x: cx, y: cy } = getCenter();
  const segmentAngle = (2 * Math.PI) / segments;

  ctx.lineCap = brushShape === 'square' ? 'square' : 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = currentColor;

  const dx1 = x1 - cx, dy1 = y1 - cy;
  const dx2 = x2 - cx, dy2 = y2 - cy;

  for (let i = 0; i < segments; i++) {
    const a = segmentAngle * i;

    const [rx1, ry1] = rotate(dx1, dy1, a);
    const [rx2, ry2] = rotate(dx2, dy2, a);
    drawStroke(rx1 + cx, ry1 + cy, rx2 + cx, ry2 + cy);

    const [mx1, my1] = rotate(dx1, -dy1, a);
    const [mx2, my2] = rotate(dx2, -dy2, a);
    drawStroke(mx1 + cx, my1 + cy, mx2 + cx, my2 + cy);
  }

  // Always reset globalAlpha so nothing else is affected
  ctx.globalAlpha = 1;
}

function drawStroke(x1, y1, x2, y2) {
  if (brushShape === 'soft') {
    // Feathered outer glow passes
    for (let s = 3; s >= 1; s--) {
      ctx.globalAlpha = (opacity * 0.15) / s;
      ctx.lineWidth = brushSize * (1 + s * 0.8);
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
    // Sharp center line
    ctx.globalAlpha = opacity;
    ctx.lineWidth = brushSize * 0.5;
  } else {
    ctx.globalAlpha = opacity;
    ctx.lineWidth = brushSize;
  }

  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

// ── Input helpers ─────────────────────────────────────────────────────────────
function getPos(e) {
  const rect = canvas.getBoundingClientRect();
  const src = e.touches ? e.touches[0] : e;
  return [src.clientX - rect.left, src.clientY - rect.top];
}

// ── Canvas events ─────────────────────────────────────────────────────────────
canvas.addEventListener('mousedown', e => {
  saveState();
  isDrawing = true;
  [lastX, lastY] = getPos(e);
});

canvas.addEventListener('mousemove', e => {
  if (!isDrawing) return;
  const [x, y] = getPos(e);
  drawSymmetricalLine(lastX, lastY, x, y);
  [lastX, lastY] = [x, y];
});

canvas.addEventListener('mouseup', () => isDrawing = false);
canvas.addEventListener('mouseleave', () => isDrawing = false);

canvas.addEventListener('touchstart', e => {
  e.preventDefault();
  saveState();
  isDrawing = true;
  [lastX, lastY] = getPos(e);
}, { passive: false });

canvas.addEventListener('touchmove', e => {
  e.preventDefault();
  if (!isDrawing) return;
  const [x, y] = getPos(e);
  drawSymmetricalLine(lastX, lastY, x, y);
  [lastX, lastY] = [x, y];
}, { passive: false });

canvas.addEventListener('touchend', e => {
  e.preventDefault();
  isDrawing = false;
});

// ── Controls ──────────────────────────────────────────────────────────────────
document.getElementById('segments').addEventListener('input', e => {
  segments = parseInt(e.target.value);
  document.getElementById('segmentsValue').textContent = segments;
});

document.getElementById('brushSize').addEventListener('input', e => {
  brushSize = parseInt(e.target.value);
  document.getElementById('brushSizeValue').textContent = brushSize;
});

document.getElementById('opacity').addEventListener('input', e => {
  opacity = parseFloat(e.target.value);
  document.getElementById('opacityValue').textContent = Math.round(opacity * 100) + '%';
});

document.querySelectorAll('.brush-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.brush-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    brushShape = btn.dataset.shape;
  });
});

const colorPicker = document.getElementById('colorPicker');
const colorButtons = document.querySelectorAll('.color-btn');

colorPicker.addEventListener('input', e => {
  currentColor = e.target.value;
  updateActiveColor(currentColor);
});

colorButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    currentColor = btn.dataset.color;
    colorPicker.value = currentColor;
    updateActiveColor(currentColor);
  });
});

function updateActiveColor(color) {
  colorButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.color === color));
}

document.getElementById('clearBtn').addEventListener('click', () => {
  if (confirm('Clear the canvas?')) {
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
});

document.getElementById('downloadBtn').addEventListener('click', () => {
  const link = document.createElement('a');
  link.download = `mandala-${Date.now()}.png`;
  link.href = canvas.toDataURL();
  link.click();
});

document.getElementById('undoBtn').addEventListener('click', undo);
document.getElementById('redoBtn').addEventListener('click', redo);

document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); undo(); }
  if ((e.ctrlKey || e.metaKey) && e.key === 'y') { e.preventDefault(); redo(); }
});

updateActiveColor(currentColor);