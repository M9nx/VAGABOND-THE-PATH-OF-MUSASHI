import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { initHeroAnimations } from './animations/hero';
import { initChapterHeadingAnimations } from './animations/chapter-headings';
import { initImageRevealAnimations } from './animations/image-reveals';
import { initQuoteAnimations } from './animations/quotes';
import { initNavigation } from './animations/navigation';

export function initializeAnimations() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    // Static page is already fully visible; navigation is handled by CSS.
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
