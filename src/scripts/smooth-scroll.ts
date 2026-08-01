import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

let lenisInstance: Lenis | null = null;
let tickerCallback: ((time: number) => void) | null = null;

export type SmoothScrollController = {
  lenis: Lenis;
  destroy: () => void;
};

export function initializeSmoothScroll(): SmoothScrollController | null {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    return null;
  }

  if (lenisInstance && tickerCallback) {
    return {
      lenis: lenisInstance,
      destroy: destroySmoothScroll,
    };
  }

  lenisInstance = new Lenis({
    duration: 1.1,
    smoothWheel: true,
    syncTouch: false,
    wheelMultiplier: 0.9,
    touchMultiplier: 1,
  });

  lenisInstance.on('scroll', ScrollTrigger.update);

  tickerCallback = (time: number) => {
    lenisInstance?.raf(time * 1000);
  };

  gsap.ticker.add(tickerCallback);
  gsap.ticker.lagSmoothing(0);

  return {
    lenis: lenisInstance,
    destroy: destroySmoothScroll,
  };
}

export function getLenis() {
  return lenisInstance;
}

export function destroySmoothScroll() {
  if (tickerCallback) {
    gsap.ticker.remove(tickerCallback);
    tickerCallback = null;
  }

  if (lenisInstance) {
    lenisInstance.destroy();
    lenisInstance = null;
  }
}
