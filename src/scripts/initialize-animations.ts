import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { initializeSmoothScroll } from './smooth-scroll';
import { initHeroAnimations } from './animations/hero';
import { initChapterHeadingAnimations } from './animations/chapter-headings';
import { initImageRevealAnimations } from './animations/image-reveals';
import { initQuoteAnimations } from './animations/quotes';
import { initNavigation, initMobileNavigation, checkNavigationOverflow } from './animations/navigation';

export function initializeAnimations() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;

  // Mobile navigation must work regardless of motion preference.
  initMobileNavigation();

  // Only enable Lenis for users without reduced motion and without coarse pointer.
  const lenis = !prefersReducedMotion && !isCoarsePointer ? initializeSmoothScroll() : null;

  if (lenis) {
    document.documentElement.setAttribute('data-smooth-scroll', 'true');
  } else {
    document.documentElement.removeAttribute('data-smooth-scroll');
  }

  gsap.registerPlugin(ScrollTrigger);

  if (!prefersReducedMotion) {
    initHeroAnimations();
    initChapterHeadingAnimations();
    initImageRevealAnimations();
    initQuoteAnimations();
  }

  const navApi = initNavigation();

  // Refresh ScrollTrigger after critical assets settle.
  const refreshTriggers = () => {
    navApi?.refresh();
  };

  if (document.readyState === 'complete') {
    refreshTriggers();
  } else {
    window.addEventListener('load', refreshTriggers, { once: true });
  }

  // Development-only overflow check for choosing the breakpoint.
  if (import.meta.env.DEV) {
    window.addEventListener('resize', () => {
      const overflow = checkNavigationOverflow();
      // eslint-disable-next-line no-console
      if (overflow) console.warn('Navigation overflow detected at current viewport width');
    }, { passive: true });
  }
}
