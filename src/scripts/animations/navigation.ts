import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { getLenis } from '../smooth-scroll';

const sections = [
  { id: 'introduction', number: '00', label: 'Introduction' },
  { id: 'chapter-one', number: '01', label: 'The Beast' },
  { id: 'chapter-two', number: '02', label: 'Fear' },
  { id: 'chapter-three', number: '03', label: 'Awareness' },
  { id: 'chapter-four', number: '04', label: 'The Other Path' },
  { id: 'chapter-five', number: '05', label: 'True Strength' },
  { id: 'chapter-six', number: '06', label: 'The Endless Path' },
];

let headerHeight = 76;
let header: Element | null = null;
let sectionElements: Map<string, HTMLElement> = new Map();

export function initNavigation() {
  header = document.querySelector('.site-header');
  const currentNumberEl = document.querySelector('.site-nav__chapter-number');
  const currentNameEl = document.querySelector('.site-nav__chapter-name');
  const navLinks = document.querySelectorAll('[data-nav-item]');
  const mobileNavLinks = document.querySelectorAll('[data-mobile-nav-item]');

  gsap.registerPlugin(ScrollTrigger);

  function updateHeaderHeight() {
    headerHeight = (header?.clientHeight ?? 76) + 16;
  }

  function setActive(id: string) {
    navLinks.forEach((link) => {
      const linkId = link.getAttribute('data-nav-item');
      const isActive = linkId === id;
      link.setAttribute('aria-current', isActive ? 'location' : 'false');
    });

    mobileNavLinks.forEach((link) => {
      const linkId = link.getAttribute('data-mobile-nav-item');
      const isActive = linkId === id;
      link.setAttribute('aria-current', isActive ? 'location' : 'false');
    });

    const section = sections.find((s) => s.id === id);
    if (section && currentNumberEl && currentNameEl) {
      currentNumberEl.textContent = section.number;
      currentNameEl.textContent = section.label;
    }
  }

  function getSectionElement(id: string) {
    if (!sectionElements.has(id)) {
      const el = document.getElementById(id);
      if (el) sectionElements.set(id, el);
    }
    return sectionElements.get(id);
  }

  function handleHashChange() {
    const hash = window.location.hash.replace('#', '');
    if (!hash) {
      setActive('introduction');
      return;
    }
    const section = sections.find((s) => s.id === hash);
    if (section) {
      setActive(hash);
      scrollToSection(hash, false);
    }
  }

  updateHeaderHeight();
  window.addEventListener('resize', updateHeaderHeight, { passive: true });

  sections.forEach(({ id }) => {
    const el = getSectionElement(id);
    if (!el) return;

    ScrollTrigger.create({
      trigger: el,
      start: `top ${headerHeight}px`,
      end: `bottom ${headerHeight}px`,
      onEnter: () => setActive(id),
      onEnterBack: () => setActive(id),
    });
  });

  // Single anchor navigation handler for all internal links.
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (event) => {
      const href = anchor.getAttribute('href');
      if (!href) return;

      const targetId = href.replace('#', '');
      const target = getSectionElement(targetId);
      if (!target) return;

      event.preventDefault();
      closeMobileMenu();

      // Update history and active state immediately.
      window.history.pushState(null, '', href);
      setActive(targetId);

      scrollToSection(targetId, true);
    });
  });

  // Handle initial hash and browser back/forward.
  handleHashChange();
  window.addEventListener('popstate', handleHashChange);

  return {
    refresh() {
      updateHeaderHeight();
      ScrollTrigger.refresh();
    },
  };
}

export function scrollToSection(id: string, animate = true) {
  const target = document.getElementById(id);
  if (!target) return;

  updateHeaderHeight();
  const top = target.getBoundingClientRect().top + window.scrollY - headerHeight;
  const lenis = getLenis();
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (lenis && !reducedMotion && animate) {
    lenis.scrollTo(top, {
      duration: 1.2,
      immediate: false,
    });
  } else {
    window.scrollTo({
      top,
      behavior: reducedMotion || !animate ? 'auto' : 'smooth',
    });
  }
}

function updateHeaderHeight() {
  headerHeight = ((header?.clientHeight ?? 76) + 16);
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

export function checkNavigationOverflow() {
  const nav = document.querySelector('.site-nav__links');
  if (!nav) return false;
  return nav.scrollWidth > nav.clientWidth;
}
