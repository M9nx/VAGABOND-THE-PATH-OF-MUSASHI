import { gsap } from 'gsap';

export function initChapterHeadingAnimations() {
  const ctx = gsap.context(() => {
    const mm = gsap.matchMedia();

    mm.add(
      {
        isMobile: '(max-width: 640px), (pointer: coarse)',
        isReduced: '(prefers-reduced-motion: reduce)',
      },
      (context) => {
        const { isMobile, isReduced } = context.conditions ?? {};
        if (isReduced) return;

        const headers = document.querySelectorAll('.chapter__header');
        const axis = isMobile ? 'y' : 'x';
        const distance = isMobile ? 14 : 20;

        headers.forEach((header) => {
          const number = header.querySelector('.chapter__number');
          const label = header.querySelector('.chapter__label');
          const title = header.querySelector('.chapter__title');
          const meta = header.querySelector('.chapter-meta');

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: header,
              start: 'top 82%',
              toggleActions: 'play none none reverse',
            },
          });

          if (number) {
            tl.fromTo(number, { opacity: 0, [axis]: -distance }, { opacity: 1, [axis]: 0, duration: 0.65, ease: 'power3.out' }, 0);
          }

          if (label) {
            tl.fromTo(label, { opacity: 0, [axis]: -distance }, { opacity: 1, [axis]: 0, duration: 0.55, ease: 'power3.out' }, 0.08);
          }

          if (title) {
            tl.fromTo(title, { opacity: 0, y: isMobile ? 16 : 28 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, 0.12);
          }

          if (meta) {
            tl.fromTo(meta, { opacity: 0, y: isMobile ? 10 : 18 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, 0.28);
          }
        });
      }
    );
  });

  return ctx;
}
