// Canvas setup
const canvas = document.getElementById('mandalaCanvas');
const ctx = canvas.getContext('2d');
const centerDot = document.querySelector('.center-dot');

// State variables
let isDrawing = false;
let segments = 8;
let brushSize = 5;
let currentColor = '#ff6b9d';
let lastX = 0;
let lastY = 0;

// Initialize canvas size
function initCanvas() {
    const container = canvas.parentElement;
    const size = Math.min(container.clientWidth - 40, 700);
    canvas.width = size;
    canvas.height = size;
    
    // Center the overlay dot
    const overlay = document.querySelector('.canvas-overlay');
    overlay.style.width = size + 'px';
    overlay.style.height = size + 'px';
    
    // Set canvas background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// Initialize on load
window.addEventListener('load', () => {
    initCanvas();
});

window.addEventListener('resize', () => {
    initCanvas();
});

// Get center of canvas
function getCenter() {
    return {
        x: canvas.width / 2,
        y: canvas.height / 2
    };
}

// Convert point to angle and distance from center
function toPolar(x, y) {
    const center = getCenter();
    const dx = x - center.x;
    const dy = y - center.y;
    const angle = Math.atan2(dy, dx);
    const distance = Math.sqrt(dx * dx + dy * dy);
    return { angle, distance };
}

// Convert polar coordinates back to cartesian
function fromPolar(angle, distance) {
    const center = getCenter();
    return {
        x: center.x + Math.cos(angle) * distance,
        y: center.y + Math.sin(angle) * distance
    };
}

// Draw symmetrical points
function drawSymmetrical(x, y) {
    const center = getCenter();
    const { angle, distance } = toPolar(x, y);
    const segmentAngle = (2 * Math.PI) / segments;

    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = currentColor;

    // Draw in all segments
    for (let i = 0; i < segments; i++) {
        const newAngle = angle + (i * segmentAngle);
        const point = fromPolar(newAngle, distance);
        
        if (i === 0) {
            ctx.beginPath();
            ctx.moveTo(point.x, point.y);
        } else {
            ctx.lineTo(point.x, point.y);
        }
    }
    ctx.stroke();
}

// Draw line between two points symmetrically
function drawSymmetricalLine(x1, y1, x2, y2) {
    const center = getCenter();
    const polar1 = toPolar(x1, y1);
    const polar2 = toPolar(x2, y2);
    const segmentAngle = (2 * Math.PI) / segments;

    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = currentColor;

    // Draw in all segments
    for (let i = 0; i < segments; i++) {
        const angle1 = polar1.angle + (i * segmentAngle);
        const angle2 = polar2.angle + (i * segmentAngle);
        const point1 = fromPolar(angle1, polar1.distance);
        const point2 = fromPolar(angle2, polar2.distance);

        ctx.beginPath();
        ctx.moveTo(point1.x, point1.y);
        ctx.lineTo(point2.x, point2.y);
        ctx.stroke();
    }
}

// Mouse events
canvas.addEventListener('mousedown', (e) => {
    isDrawing = true;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    lastX = x;
    lastY = y;
    
    drawSymmetrical(x, y);
});

canvas.addEventListener('mousemove', (e) => {
    if (!isDrawing) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    drawSymmetricalLine(lastX, lastY, x, y);
    
    lastX = x;
    lastY = y;
});

canvas.addEventListener('mouseup', () => {
    isDrawing = false;
});

canvas.addEventListener('mouseleave', () => {
    isDrawing = false;
});

// Touch events for mobile
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    isDrawing = true;
    lastX = x;
    lastY = y;
    
    drawSymmetrical(x, y);
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (!isDrawing) return;
    
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    drawSymmetricalLine(lastX, lastY, x, y);
    
    lastX = x;
    lastY = y;
});

canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    isDrawing = false;
});

// Controls
const segmentsSlider = document.getElementById('segments');
const segmentsValue = document.getElementById('segmentsValue');
const brushSizeSlider = document.getElementById('brushSize');
const brushSizeValue = document.getElementById('brushSizeValue');
const colorPicker = document.getElementById('colorPicker');
const colorButtons = document.querySelectorAll('.color-btn');
const clearBtn = document.getElementById('clearBtn');
const downloadBtn = document.getElementById('downloadBtn');

// Segments control
segmentsSlider.addEventListener('input', (e) => {
    segments = parseInt(e.target.value);
    segmentsValue.textContent = segments;
});

// Brush size control
brushSizeSlider.addEventListener('input', (e) => {
    brushSize = parseInt(e.target.value);
    brushSizeValue.textContent = brushSize;
});

// Color picker
colorPicker.addEventListener('input', (e) => {
    currentColor = e.target.value;
    updateActiveColorButton(currentColor);
});

// Color buttons
colorButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        currentColor = btn.dataset.color;
        colorPicker.value = currentColor;
        updateActiveColorButton(currentColor);
    });
});

function updateActiveColorButton(color) {
    colorButtons.forEach(btn => {
        if (btn.dataset.color === color) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

// Clear canvas
clearBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear your beautiful mandala? 🌸')) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
});

// Download canvas
downloadBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = `mandala-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
});

// Initialize active color button
updateActiveColorButton(currentColor);



