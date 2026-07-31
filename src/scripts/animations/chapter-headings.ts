import { gsap } from 'gsap';

export function initChapterHeadingAnimations() {
  const ctx = gsap.context(() => {
    const headers = document.querySelectorAll('.chapter__header');

    headers.forEach((header) => {
      const number = header.querySelector('.chapter__number');
      const label = header.querySelector('.chapter__label');
      const title = header.querySelector('.chapter__title');
      const meta = header.querySelector('.chapter-meta');

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: header,
          start: 'top 80%',
          end: 'top 55%',
          toggleActions: 'play none none reverse',
        },
      });

      if (number) {
        tl.fromTo(
          number,
          { opacity: 0, x: -20 },
          { opacity: 1, x: 0, duration: 0.7, ease: 'power3.out' },
          0
        );
      }

      if (label) {
        tl.fromTo(
          label,
          { opacity: 0, x: -20 },
          { opacity: 1, x: 0, duration: 0.6, ease: 'power3.out' },
          0.1
        );
      }

      if (title) {
        tl.fromTo(
          title,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' },
          0.15
        );
      }

      if (meta) {
        tl.fromTo(
          meta,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' },
          0.35
        );
      }
    });
  });

  return ctx;
}
