import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { initializeSmoothScroll } from './smooth-scroll';
import { initHeroAnimations } from './animations/hero';
import { initChapterHeadingAnimations } from './animations/chapter-headings';
import { initImageRevealAnimations } from './animations/image-reveals';
import { initQuoteAnimations } from './animations/quotes';
import { initNavigation, initMobileNavigation, checkNavigationOverflow } from './animations/navigation';

let initialized = false;

export function initializeAnimations() {
  if (initialized) return;
  initialized = true;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;

  // Mobile navigation must work regardless of motion preference.
  initMobileNavigation();

  // Lenis: skip for reduced-motion. Coarse pointers use native scroll when
  // Lenis feels worse on touch; desktop fine-pointer keeps cinematic scrolling.
  const smoothScroll = !prefersReducedMotion && !isCoarsePointer
    ? initializeSmoothScroll()
    : null;

  if (smoothScroll) {
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

  const refreshTriggers = () => {
    navApi?.refresh();
  };

  if (document.readyState === 'complete') {
    refreshTriggers();
  } else {
    window.addEventListener('load', refreshTriggers, { once: true });
  }

  // Fonts and late media can shift layout; refresh once after settle.
  if (document.fonts?.ready) {
    document.fonts.ready.then(() => {
      refreshTriggers();
    });
  }

  const heroVideo = document.querySelector<HTMLVideoElement>('.hero__video');
  if (heroVideo) {
    const onVideoReady = () => refreshTriggers();
    if (heroVideo.readyState >= 1) {
      onVideoReady();
    } else {
      heroVideo.addEventListener('loadedmetadata', onVideoReady, { once: true });
    }
  }

  if (import.meta.env.DEV) {
    const reportOverflow = () => {
      if (checkNavigationOverflow()) {
        // eslint-disable-next-line no-console
        console.warn(
          `[nav] Desktop chapter links overflow at ${window.innerWidth}px — raise compact breakpoint.`
        );
      }
    };

    reportOverflow();
    window.addEventListener('resize', reportOverflow, { passive: true });
  }
}
