import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { getLenis } from '../smooth-scroll';

const sections = [
  { id: 'home', number: '00', label: 'Prologue', nav: false },
  { id: 'introduction', number: '00', label: 'Introduction', nav: true },
  { id: 'chapter-one', number: '01', label: 'The Beast', nav: true },
  { id: 'chapter-two', number: '02', label: 'Fear', nav: true },
  { id: 'chapter-three', number: '03', label: 'Awareness', nav: true },
  { id: 'chapter-four', number: '04', label: 'The Other Path', nav: true },
  { id: 'chapter-five', number: '05', label: 'True Strength', nav: true },
  { id: 'chapter-six', number: '06', label: 'The Endless Path', nav: true },
] as const;

let headerHeight = 76;
let header: HTMLElement | null = null;
const sectionElements = new Map<string, HTMLElement>();
let scrollTriggers: ScrollTrigger[] = [];
let lockedActiveId: string | null = null;

function updateHeaderHeight() {
  headerHeight = (header?.clientHeight ?? 76) + 16;
  document.documentElement.style.setProperty('--header-offset', `${headerHeight}px`);
}

function getSectionElement(id: string) {
  if (!sectionElements.has(id)) {
    const el = document.getElementById(id);
    if (el) sectionElements.set(id, el);
  }
  return sectionElements.get(id);
}

function resolveActiveFromScroll() {
  if (lockedActiveId) return;

  const probe = headerHeight + 2;
  let current: (typeof sections)[number]['id'] = sections[0].id;

  for (const { id } of sections) {
    const el = getSectionElement(id);
    if (!el) continue;
    if (el.getBoundingClientRect().top <= probe) {
      current = id;
    }
  }

  setActive(current);
}

function setActive(id: string) {
  if (lockedActiveId && id !== lockedActiveId) return;

  const navLinks = document.querySelectorAll('[data-nav-item]');
  const mobileNavLinks = document.querySelectorAll('[data-mobile-nav-item]');
  const currentNumberEl = document.querySelector('.site-nav__chapter-number');
  const currentNameEl = document.querySelector('.site-nav__chapter-name');

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

export function scrollToSection(id: string, animate = true) {
  const target = getSectionElement(id) ?? document.getElementById(id);
  if (!target) return;

  updateHeaderHeight();

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const lenis = getLenis();
  const offset = -headerHeight;

  const unlock = () => {
    lockedActiveId = null;
    resolveActiveFromScroll();
  };

  if (lenis && !reducedMotion && animate) {
    lockedActiveId = sections.some((s) => s.id === id) ? id : lockedActiveId;
    lenis.scrollTo(target, {
      offset,
      duration: 1.2,
      immediate: false,
      onComplete: unlock,
    });
    return;
  }

  lockedActiveId = sections.some((s) => s.id === id) ? id : lockedActiveId;
  const top = target.getBoundingClientRect().top + window.scrollY - headerHeight;
  window.scrollTo({
    top,
    behavior: reducedMotion || !animate ? 'auto' : 'smooth',
  });

  window.setTimeout(unlock, reducedMotion || !animate ? 0 : 500);
}

let mobileNavState: {
  mobileNav: HTMLElement;
  toggleButton: HTMLElement;
  lastFocusedElement: Element | null;
} | null = null;

function closeMobileMenu() {
  if (!mobileNavState) return;

  const { mobileNav, toggleButton, lastFocusedElement } = mobileNavState;

  mobileNav.classList.remove('is-open');
  mobileNav.setAttribute('aria-hidden', 'true');
  toggleButton.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
  document.documentElement.classList.remove('mobile-nav-open');

  if (lastFocusedElement instanceof HTMLElement) {
    lastFocusedElement.focus();
  }
}

export function initNavigation() {
  header = document.querySelector('.site-header');

  gsap.registerPlugin(ScrollTrigger);

  function handleHashChange() {
    const hash = window.location.hash.replace('#', '');
    if (!hash || hash === 'main-content') {
      lockedActiveId = null;
      setActive('home');
      return;
    }

    const section = sections.find((s) => s.id === hash);
    if (section) {
      lockedActiveId = hash;
      setActive(hash);
      scrollToSection(hash, false);
    }
  }

  updateHeaderHeight();
  window.addEventListener('resize', () => {
    updateHeaderHeight();
    ScrollTrigger.refresh();
    resolveActiveFromScroll();
  }, { passive: true });

  scrollTriggers.forEach((trigger) => trigger.kill());
  scrollTriggers = [];

  // One controller only — resolve the section under the header probe line.
  const trigger = ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate: resolveActiveFromScroll,
    onRefresh: resolveActiveFromScroll,
  });
  scrollTriggers.push(trigger);

  document.addEventListener('click', (event) => {
    const anchor = (event.target as Element | null)?.closest?.('a[href^="#"]');
    if (!(anchor instanceof HTMLAnchorElement)) return;

    const href = anchor.getAttribute('href');
    if (!href || href === '#') return;

    const targetId = href.slice(1);
    const target = getSectionElement(targetId) ?? document.getElementById(targetId);
    if (!target) return;

    event.preventDefault();
    closeMobileMenu();

    window.history.pushState(null, '', href);

    if (sections.some((s) => s.id === targetId)) {
      lockedActiveId = targetId;
      setActive(targetId);
    }

    scrollToSection(targetId, true);
  });

  handleHashChange();
  window.addEventListener('popstate', handleHashChange);
  resolveActiveFromScroll();

  return {
    refresh() {
      updateHeaderHeight();
      ScrollTrigger.refresh();
      resolveActiveFromScroll();
    },
    destroy() {
      scrollTriggers.forEach((t) => t.kill());
      scrollTriggers = [];
    },
  };
}

export function initMobileNavigation() {
  const toggleButton = document.querySelector('.site-nav__menu-button');
  const mobileNav = document.getElementById('mobile-nav');
  const closeButton = mobileNav?.querySelector('.mobile-nav__close');

  if (!(toggleButton instanceof HTMLElement) || !(mobileNav instanceof HTMLElement)) {
    return;
  }

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
    document.documentElement.classList.add('mobile-nav-open');

    const firstLink = mobileNavState.mobileNav.querySelector('a');
    if (firstLink instanceof HTMLElement) {
      firstLink.focus();
    }

    ScrollTrigger.refresh();
  }

  toggleButton.addEventListener('click', () => {
    const expanded = toggleButton.getAttribute('aria-expanded') === 'true';
    if (expanded) {
      closeMobileMenu();
    } else {
      openMenu();
    }
  });

  closeButton?.addEventListener('click', closeMobileMenu);

  mobileNav.addEventListener('click', (event) => {
    if (event.target === mobileNav) {
      closeMobileMenu();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (!mobileNavState?.mobileNav.classList.contains('is-open')) return;

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

/**
 * Development helper: true when desktop chapter links overflow their container.
 */
export function checkNavigationOverflow() {
  const nav = document.querySelector('.site-nav__links');
  if (!nav) return false;

  const style = window.getComputedStyle(nav);
  if (style.display === 'none') return false;

  return nav.scrollWidth > nav.clientWidth + 1;
}
