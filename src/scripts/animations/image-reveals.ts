import { gsap } from 'gsap';

export function initImageRevealAnimations() {
  const ctx = gsap.context(() => {
    const mm = gsap.matchMedia();

    mm.add(
      {
        isDesktop: '(min-width: 901px) and (pointer: fine) and (min-height: 600px)',
        isTablet: '(min-width: 641px) and (max-width: 900px)',
        isMobile: '(max-width: 640px), (pointer: coarse)',
        isReduced: '(prefers-reduced-motion: reduce)',
      },
      (context) => {
        const { isDesktop, isTablet, isMobile, isReduced } = context.conditions ?? {};
        if (isReduced) return;

        const images = document.querySelectorAll('.editorial-image');

        images.forEach((image, index) => {
          const wrapper = image.querySelector('.editorial-image__wrapper');
          const img = image.querySelector('img');
          const overlay = image.querySelector('.editorial-image__overlay');
          const caption = image.querySelector('.image-caption');
          if (!wrapper) return;

          const distance = isMobile ? 10 : isTablet ? 16 : 30;
          const duration = isMobile ? 0.7 : 1;

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: image,
              start: 'top 88%',
              end: 'top 60%',
              toggleActions: 'play none none reverse',
            },
          });

          if (isMobile) {
            tl.fromTo(wrapper, { opacity: 0, y: distance }, { opacity: 1, y: 0, duration, ease: 'power2.out', immediateRender: false }, 0);
          } else {
            tl.fromTo(
              wrapper,
              { clipPath: 'inset(0 100% 0 0)' },
              { clipPath: 'inset(0 0% 0 0)', duration, ease: 'power3.inOut', immediateRender: false },
              0
            );

            if (img) {
              tl.fromTo(
                img,
                { scale: isTablet ? 1.03 : 1.06 },
                { scale: 1, duration: duration + 0.2, ease: 'power3.out', immediateRender: false },
                0
              );
            }
          }

          if (overlay) {
            tl.fromTo(overlay, { opacity: 0 }, { opacity: 0.9, duration: 0.7, ease: 'power2.out' }, 0.2);
          }

          if (caption) {
            tl.fromTo(
              caption,
              { opacity: 0, y: isMobile ? 8 : 12 },
              { opacity: 1, y: 0, duration: 0.55, ease: 'power3.out' },
              0.4 + (index % 3) * 0.04
            );
          }

          if (isDesktop && image.classList.contains('editorial-image--fullscreen') && img) {
            gsap.to(img, {
              yPercent: -3,
              ease: 'none',
              scrollTrigger: {
                trigger: image,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 0.8,
              },
            });
          }
        });
      }
    );
  });

  return ctx;
}
