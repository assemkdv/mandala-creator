const canvas = document.getElementById('mandalaCanvas');
const ctx = canvas.getContext('2d');

let isDrawing = false;
let segments = 8;
let brushSize = 5;
let currentColor = '#e8638a';
let lastX = 0;
let lastY = 0;

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

function getCenter() {
    return { x: canvas.width / 2, y: canvas.height / 2 };
}

function rotate(dx, dy, a) {
    return [dx * Math.cos(a) - dy * Math.sin(a), dx * Math.sin(a) + dy * Math.cos(a)];
}

function drawSymmetricalLine(x1, y1, x2, y2) {
    const { x: cx, y: cy } = getCenter();
    const segmentAngle = (2 * Math.PI) / segments;

    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = currentColor;

    const dx1 = x1 - cx, dy1 = y1 - cy;
    const dx2 = x2 - cx, dy2 = y2 - cy;

    for (let i = 0; i < segments; i++) {
        const a = segmentAngle * i;

        // Normal
        const [rx1, ry1] = rotate(dx1, dy1, a);
        const [rx2, ry2] = rotate(dx2, dy2, a);
        ctx.beginPath();
        ctx.moveTo(rx1 + cx, ry1 + cy);
        ctx.lineTo(rx2 + cx, ry2 + cy);
        ctx.stroke();

        // Mirror (flip Y)
        const [mx1, my1] = rotate(dx1, -dy1, a);
        const [mx2, my2] = rotate(dx2, -dy2, a);
        ctx.beginPath();
        ctx.moveTo(mx1 + cx, my1 + cy);
        ctx.lineTo(mx2 + cx, my2 + cy);
        ctx.stroke();
    }
}

function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    const src = e.touches ? e.touches[0] : e;
    return [src.clientX - rect.left, src.clientY - rect.top];
}

canvas.addEventListener('mousedown', e => {
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

// Controls
document.getElementById('segments').addEventListener('input', e => {
    segments = parseInt(e.target.value);
    document.getElementById('segmentsValue').textContent = segments;
});
document.getElementById('brushSize').addEventListener('input', e => {
    brushSize = parseInt(e.target.value);
    document.getElementById('brushSizeValue').textContent = brushSize;
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

updateActiveColor(currentColor);