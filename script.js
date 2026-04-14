const canvas = document.getElementById('mandalaCanvas');
const ctx = canvas.getContext('2d');

function initCanvas(preserveContent = false) {
  const container = canvas.parentElement;
  const size = Math.min(container.clientWidth - 48, 700);

  let savedImage = null;
  if (preserveContent && canvas.width > 0) {
    savedImage = canvas.toDataURL();
  }

  canvas.width = size;
  canvas.height = size;

  const overlay = document.querySelector('.canvas-overlay');
  overlay.style.width = size + 'px';
  overlay.style.height = size + 'px';

  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (savedImage) {
    const img = new Image();
    img.onload = () => ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    img.src = savedImage;
  }
}

window.addEventListener('load', () => initCanvas(false));

let resizeTimeout;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => initCanvas(true), 150);
});
