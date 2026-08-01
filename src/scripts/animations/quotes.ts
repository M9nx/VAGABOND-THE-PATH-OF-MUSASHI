import { gsap } from 'gsap';

export function initQuoteAnimations() {
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

        const quotes = document.querySelectorAll('.editorial-quote, .ending-statement');

        quotes.forEach((quote) => {
          const text = quote.querySelector('p');
          if (!text) return;

          gsap.fromTo(
            text,
            { opacity: 0, y: isMobile ? 14 : 30 },
            {
              opacity: 1,
              y: 0,
              duration: isMobile ? 0.7 : 0.9,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: quote,
                start: 'top 85%',
                toggleActions: 'play none none reverse',
              },
            }
          );
        });
      }
    );
  });

  return ctx;
}
