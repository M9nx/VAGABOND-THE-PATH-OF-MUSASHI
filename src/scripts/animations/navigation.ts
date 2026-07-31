import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const sections = [
  { id: 'home', number: '00', label: 'Prologue' },
  { id: 'introduction', number: '00', label: 'Prologue' },
  { id: 'chapter-one', number: '01', label: 'The Beast' },
  { id: 'chapter-two', number: '02', label: 'Fear' },
  { id: 'chapter-three', number: '03', label: 'Awareness' },
  { id: 'chapter-four', number: '04', label: 'The Other Path' },
  { id: 'chapter-five', number: '05', label: 'True Strength' },
  { id: 'chapter-six', number: '06', label: 'The Endless Path' },
];

export function initNavigation() {
  const header = document.querySelector('.site-header');
  const currentNumberEl = document.querySelector('.site-nav__chapter-number');
  const currentNameEl = document.querySelector('.site-nav__chapter-name');
  const navLinks = document.querySelectorAll('[data-nav-item]');
  const mobileNavLinks = document.querySelectorAll('[data-mobile-nav-item]');

  gsap.registerPlugin(ScrollTrigger);

  function setActive(id: string) {
    navLinks.forEach((link) => {
      const linkId = link.getAttribute('data-nav-item');
      link.setAttribute('aria-current', linkId === id ? 'true' : 'false');
    });

    mobileNavLinks.forEach((link) => {
      const linkId = link.getAttribute('data-mobile-nav-item');
      link.setAttribute('aria-current', linkId === id ? 'true' : 'false');
    });

    const section = sections.find((s) => s.id === id);
    if (section && currentNumberEl && currentNameEl) {
      currentNumberEl.textContent = section.number;
      currentNameEl.textContent = section.label;
    }
  }

  const headerHeight = (header?.clientHeight ?? 76) + 20;

  sections.forEach(({ id }) => {
    const el = document.getElementById(id);
    if (!el) return;

    ScrollTrigger.create({
      trigger: el,
      start: `top ${headerHeight}px`,
      end: `bottom ${headerHeight}px`,
      onEnter: () => setActive(id),
      onEnterBack: () => setActive(id),
    });
  });

  // Anchor navigation handling.
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (event) => {
      const href = anchor.getAttribute('href');
      if (!href) return;

      const target = document.querySelector(href);
      if (target instanceof HTMLElement) {
        event.preventDefault();
        const offset = (header?.clientHeight ?? 76) + 16;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }

      // Close mobile menu if open.
      closeMobileMenu();
    });
  });
}

let mobileNavState: {
  mobileNav: HTMLElement;
  toggleButton: Element;
  lastFocusedElement: Element | null;
} | null = null;

function closeMobileMenu() {
  if (!mobileNavState) return;

  const { mobileNav, toggleButton, lastFocusedElement } = mobileNavState;

  mobileNav.classList.remove('is-open');
  mobileNav.setAttribute('aria-hidden', 'true');
  toggleButton.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';

  if (lastFocusedElement instanceof HTMLElement) {
    lastFocusedElement.focus();
  }
}

export function initMobileNavigation() {
  const toggleButton = document.querySelector('.site-nav__menu-button');
  const mobileNav = document.getElementById('mobile-nav');
  const closeButton = mobileNav?.querySelector('.mobile-nav__close');

  if (!toggleButton || !mobileNav) return;

  mobileNavState = {
    mobileNav,
    toggleButton,
    lastFocusedElement: null,
  };

  function openMenu() {
    if (!mobileNavState) return;
    mobileNavState.lastFocusedElement = document.activeElement;

    mobileNavState.mobileNav.classList.add('is-open');
    mobileNavState.mobileNav.setAttribute('aria-hidden', 'false');
    mobileNavState.toggleButton.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';

    const firstLink = mobileNavState.mobileNav.querySelector('a');
    if (firstLink instanceof HTMLElement) {
      firstLink.focus();
    }
  }

  toggleButton.addEventListener('click', openMenu);

  closeButton?.addEventListener('click', closeMobileMenu);

  mobileNav.addEventListener('click', (event) => {
    if (event.target === mobileNav) {
      closeMobileMenu();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeMobileMenu();
      return;
    }

    if (event.key !== 'Tab') return;

    const focusable = mobileNav.querySelectorAll<HTMLElement>('a, button');
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
}
