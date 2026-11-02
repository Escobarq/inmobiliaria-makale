const menuToggle = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('#main-nav');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

const setMenuState = (isOpen) => {
  menuToggle?.setAttribute('aria-expanded', String(isOpen));
  menuToggle?.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');
};

const closeMenu = ({ restoreFocus = false } = {}) => {
  mainNav?.classList.remove('is-open');
  setMenuState(false);
  if (restoreFocus) menuToggle?.focus();
};

menuToggle?.addEventListener('click', () => {
  const isOpen = mainNav.classList.toggle('is-open');
  setMenuState(isOpen);
  if (isOpen) mainNav.querySelector('a')?.focus();
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && mainNav?.classList.contains('is-open')) {
    closeMenu({ restoreFocus: true });
  }
});

document.querySelectorAll('.main-nav a').forEach((link) => {
  link.addEventListener('click', () => closeMenu());
});

document.querySelector('#property-search')?.addEventListener('submit', (event) => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const location = form.get('location')?.toString().trim();
  const feedback = document.querySelector('#search-feedback');
  if (!feedback) return;
  feedback.textContent = location
    ? `Mostrando opciones disponibles cerca de ${location}.`
    : 'Mostrando nuestras propiedades destacadas.';
  document.querySelector('#propiedades')?.scrollIntoView({
    behavior: prefersReducedMotion.matches ? 'auto' : 'smooth'
  });
});
