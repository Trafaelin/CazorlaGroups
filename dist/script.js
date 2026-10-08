const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('#navegacion');
function closeMenu() { nav.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); }
toggle.addEventListener('click', () => { const expanded = toggle.getAttribute('aria-expanded') === 'true'; toggle.setAttribute('aria-expanded', String(!expanded)); nav.classList.toggle('open', !expanded); });
nav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => { if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') { closeMenu(); toggle.focus(); } });
document.querySelector('#year').textContent = new Date().getFullYear();

// Keep the page fully readable when motion is disabled or JavaScript is absent.
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const revealElements = [...document.querySelectorAll('.hero-copy > *, .hero-photo, .studio > *, .principle-grid > *, .multidisciplinary .section > *, .discipline-grid > *, .team > h2, .team-member, .clients > *, .client-grid > *, .section-heading > *, .areas-grid > details, .profile-photo, .profile-copy > *, .approach-copy > *, .conference, .contact > *, footer > p')];
let revealObserver;
function showElement(element) {
  element.classList.add('is-visible');
  revealObserver?.unobserve(element);
}
function setupReveals() {
  if (reducedMotion.matches || !('IntersectionObserver' in window)) return;
  revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => { if (entry.isIntersecting) showElement(entry.target); });
  }, { threshold: 0.08, rootMargin: '0px 0px -24px 0px' });
  revealElements.forEach(element => {
    // Stagger only siblings; keep delays short even in long lists.
    const index = [...element.parentElement.children].indexOf(element);
    element.style.setProperty('--reveal-delay', `${Math.min(index % 3, 2) * 75}ms`);
    element.classList.add('reveal-ready');
    revealObserver.observe(element);
  });
}
setupReveals();
document.addEventListener('focusin', event => {
  const element = event.target.closest('.reveal-ready');
  if (element) showElement(element);
});

const areaAnimations = new Map();
const areaTargets = new WeakMap();
document.querySelectorAll('.areas-grid > details').forEach(details => {
  const summary = details.querySelector('summary');
  const content = details.querySelector('.area-content');
  summary.addEventListener('click', event => {
    if (reducedMotion.matches || typeof content.animate !== 'function') return;
    event.preventDefault();
    const existing = areaAnimations.get(details);
    const opening = !(areaTargets.get(details) ?? details.open);
    const fromHeight = details.open ? content.getBoundingClientRect().height : 0;
    const fromOpacity = details.open ? getComputedStyle(content).opacity : '0';
    existing?.cancel();
    if (opening) {
      document.querySelectorAll('.areas-grid > details').forEach(other => {
        if (other === details) return;
        areaAnimations.get(other)?.cancel();
        areaAnimations.delete(other);
        areaTargets.delete(other);
        other.open = false;
        other.querySelector('.area-content').style.removeProperty('overflow');
      });
    }
    areaTargets.set(details, opening);
    details.open = true;
    content.style.overflow = 'hidden';
    const animation = content.animate([
      { height: `${fromHeight}px`, opacity: fromOpacity },
      { height: `${opening ? content.scrollHeight : 0}px`, opacity: opening ? 1 : 0 }
    ], { duration: 320, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'both' });
    areaAnimations.set(details, animation);
    animation.finished.then(() => {
      if (areaAnimations.get(details) !== animation) return;
      if (!opening && content.contains(document.activeElement)) summary.focus();
      details.open = opening;
      animation.cancel();
      content.style.removeProperty('overflow');
      areaAnimations.delete(details);
      areaTargets.delete(details);
    }).catch(() => {});
  });
});
reducedMotion.addEventListener('change', event => {
  if (!event.matches) return;
  revealObserver?.disconnect();
  revealElements.forEach(showElement);
  areaAnimations.forEach((animation, details) => {
    animation.cancel();
    details.open = areaTargets.get(details) ?? details.open;
    details.querySelector('.area-content').style.removeProperty('overflow');
    areaTargets.delete(details);
  });
  areaAnimations.clear();
});

// Remove the decorative introduction once its transition ends.
const brandIntro = document.querySelector('#brand-intro');
if (brandIntro) {
  const finishIntro = () => { brandIntro.remove(); document.documentElement.classList.remove('intro-loading'); };
  if (reducedMotion.matches) finishIntro();
  else {
    brandIntro.addEventListener('animationend', event => { if (event.animationName === 'intro-exit') finishIntro(); });
    document.addEventListener('keydown', finishIntro, { once: true });
  }
}
