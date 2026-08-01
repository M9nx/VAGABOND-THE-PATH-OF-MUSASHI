import { gsap } from 'gsap';

export function initHeroAnimations() {
  const ctx = gsap.context(() => {
    const mm = gsap.matchMedia();

    mm.add(
      {
        isDesktop: '(min-width: 901px) and (pointer: fine) and (min-height: 600px)',
        isReduced: '(prefers-reduced-motion: reduce)',
        isMobile: '(max-width: 900px), (pointer: coarse), (max-height: 500px)',
      },
      (context) => {
        const { isDesktop, isReduced, isMobile } = context.conditions ?? {};
        if (isReduced) return;

        const titleY = isMobile ? 18 : 40;
        const supportY = isMobile ? 10 : 20;

        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

        tl.fromTo('.hero__eyebrow', { opacity: 0, y: supportY }, { opacity: 1, y: 0, duration: 0.7 }, 0.15);
        tl.fromTo('.hero__title', { opacity: 0, y: titleY }, { opacity: 1, y: 0, duration: isMobile ? 0.85 : 1.2 }, 0.3);
        tl.fromTo('.hero__subtitle', { opacity: 0, y: supportY }, { opacity: 1, y: 0, duration: 0.7 }, 0.75);
        tl.fromTo('.hero__question', { opacity: 0, y: supportY }, { opacity: 1, y: 0, duration: 0.7 }, 0.9);
        tl.fromTo('.hero__footer', { opacity: 0 }, { opacity: 1, duration: 0.5 }, 1.1);

        gsap.to('.hero__scroll-link', {
          y: isMobile ? 4 : 8,
          repeat: -1,
          yoyo: true,
          duration: 1.2,
          ease: 'power1.inOut',
        });

        if (isDesktop) {
          const video = document.querySelector('.hero__video');
          if (video) {
            gsap.to(video, {
              scale: 1.04,
              yPercent: 4,
              ease: 'none',
              scrollTrigger: {
                trigger: '.hero',
                start: 'top top',
                end: 'bottom top',
                scrub: 0.6,
              },
            });
          }
        }
      }
    );
  });

  return ctx;
}
