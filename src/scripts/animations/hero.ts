import { gsap } from 'gsap';

export function initHeroAnimations() {
  const ctx = gsap.context(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.fromTo(
      '.hero__eyebrow',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8 },
      0.2
    );

    tl.fromTo(
      '.hero__title',
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 1.2 },
      0.4
    );

    tl.fromTo(
      '.hero__subtitle',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8 },
      0.9
    );

    tl.fromTo(
      '.hero__question',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8 },
      1.1
    );

    tl.fromTo(
      '.hero__footer',
      { opacity: 0 },
      { opacity: 1, duration: 0.6 },
      1.3
    );

    // Subtle video scale / parallax on scroll, disabled on mobile for performance.
    const video = document.querySelector('.hero__video') as HTMLElement | null;
    if (video) {
      const mm = gsap.matchMedia();
      mm.add('(min-width: 901px)', () => {
        gsap.to(video, {
          scale: 1.05,
          yPercent: 6,
          ease: 'none',
          scrollTrigger: {
            trigger: '.hero',
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        });
      });
    }

    // Scroll indicator.
    gsap.to('.hero__scroll-link', {
      y: 8,
      repeat: -1,
      yoyo: true,
      duration: 1.2,
      ease: 'power1.inOut',
    });
  });

  return ctx;
}
