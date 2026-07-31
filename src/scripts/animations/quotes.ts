import { gsap } from 'gsap';

export function initQuoteAnimations() {
  const ctx = gsap.context(() => {
    const quotes = document.querySelectorAll('.editorial-quote, .ending-statement');

    quotes.forEach((quote) => {
      const text = quote.querySelector('p');
      if (!text) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: quote,
          start: 'top 80%',
          end: 'top 55%',
          toggleActions: 'play none none reverse',
        },
      });

      tl.fromTo(
        text,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' }
      );

      // If we can detect line wrappers, reveal them with a stagger.
      const wrappedLines = quote.querySelectorAll('.quote-line');
      if (wrappedLines.length > 0) {
        tl.fromTo(
          wrappedLines,
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 0.7, stagger: 0.1, ease: 'power3.out' },
          0
        );
      }
    });
  });

  return ctx;
}
