import { gsap } from 'gsap';

export function initImageRevealAnimations() {
  const ctx = gsap.context(() => {
    const images = document.querySelectorAll('.editorial-image');

    images.forEach((image, index) => {
      const wrapper = image.querySelector('.editorial-image__wrapper');
      const img = image.querySelector('img');
      const overlay = image.querySelector('.editorial-image__overlay');
      const caption = image.querySelector('.image-caption');

      if (!wrapper) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: image,
          start: 'top 85%',
          end: 'top 55%',
          toggleActions: 'play none none reverse',
        },
      });

      // Mask reveal using clip-path on the wrapper only so captions stay free.
      tl.fromTo(
        wrapper,
        { clipPath: 'inset(0 100% 0 0)' },
        {
          clipPath: 'inset(0 0% 0 0)',
          duration: 1,
          ease: 'power3.inOut',
        },
        0
      );

      // Subtle scale-out on the inner image.
      if (img) {
        tl.fromTo(
          img,
          { scale: 1.06 },
          { scale: 1, duration: 1.2, ease: 'power3.out' },
          0
        );
      }

      // Fade yellow overlay during entry where present.
      if (overlay) {
        tl.fromTo(
          overlay,
          { opacity: 0 },
          { opacity: 0.9, duration: 0.8, ease: 'power2.out' },
          0.3
        );
      }

      // Stagger captions slightly.
      if (caption) {
        tl.fromTo(
          caption,
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' },
          0.5 + (index % 3) * 0.05
        );
      }

      // Very subtle vertical parallax for selected large images on desktop.
      if (image.classList.contains('editorial-image--fullscreen')) {
        const mm = gsap.matchMedia();
        mm.add('(min-width: 901px)', () => {
          gsap.to(img, {
            yPercent: -4,
            ease: 'none',
            scrollTrigger: {
              trigger: image,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          });
        });
      }
    });
  });

  return ctx;
}
