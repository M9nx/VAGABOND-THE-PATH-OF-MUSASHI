import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { initHeroAnimations } from './animations/hero';
import { initChapterHeadingAnimations } from './animations/chapter-headings';
import { initImageRevealAnimations } from './animations/image-reveals';
import { initQuoteAnimations } from './animations/quotes';
import { initNavigation, initMobileNavigation } from './animations/navigation';

export function initializeAnimations() {
  // Mobile navigation must work regardless of motion preference.
  initMobileNavigation();

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    // Static page is already fully visible; track active chapter only.
    initNavigation();
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  initHeroAnimations();
  initChapterHeadingAnimations();
  initImageRevealAnimations();
  initQuoteAnimations();
  initNavigation();

  // Refresh ScrollTrigger after images and fonts settle.
  if (document.readyState === 'complete') {
    ScrollTrigger.refresh();
  } else {
    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  }
}
