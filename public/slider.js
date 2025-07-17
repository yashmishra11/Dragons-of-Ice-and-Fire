
const dragonImages = [
  '/images/Balerion.jpg',
  '/images/Caraxes.jpg',
  '/images/Vhagar.jpg',
  '/images/Syrax.jpg',
  '/images/Vermax.jpg',
  '/images/Moondancer.jpg'
];

const slider = document.getElementById('dragonSlider');
const indicators = document.getElementById('sliderIndicators');
let current = 0;

// Render images
dragonImages.forEach((src, idx) => {
  const img = document.createElement('img');
  img.src = src;
  img.className = 'slider-img' + (idx === 0 ? ' active' : '');
  img.alt = `Dragon ${idx + 1}`;
  slider.appendChild(img);

  const dot = document.createElement('button');
  dot.className = 'indicator-dot' + (idx === 0 ? ' active' : '');
  dot.onclick = () => showSlide(idx);
  indicators.appendChild(dot);
});

function showSlide(idx) {
  const imgs = slider.querySelectorAll('.slider-img');
  const dots = indicators.querySelectorAll('.indicator-dot');
  imgs.forEach((img, i) => {
    img.classList.toggle('active', i === idx);
  });
  dots.forEach((dot, i) => {
    dot.classList.toggle('active', i === idx);
  });
  current = idx;
}

document.getElementById('prevBtn').onclick = () => {
  showSlide((current - 1 + dragonImages.length) % dragonImages.length);
};
document.getElementById('nextBtn').onclick = () => {
  showSlide((current + 1) % dragonImages.length);
};

// Optional: swipe support for mobile
let startX = null;
slider.addEventListener('touchstart', e => {
  startX = e.touches[0].clientX;
});
slider.addEventListener('touchend', e => {
  if (startX === null) return;
  const endX = e.changedTouches[0].clientX;
  if (endX - startX > 50) {
    document.getElementById('prevBtn').click();
  } else if (startX - endX > 50) {
    document.getElementById('nextBtn').click();
  }
  startX = null;
});