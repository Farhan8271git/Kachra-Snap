import { useEffect, useRef, useState } from 'react';

export default function Reveal({
  as: Component = 'div',
  children,
  className = '',
  delay = 0,
  threshold = 0,
}) {
  const ref = useRef(null);
  const mediaQuery = '(prefers-reduced-motion: reduce)';
  const [reducedMotion, setReducedMotion] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia(mediaQuery).matches
  );
  const [visible, setVisible] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia(mediaQuery).matches
  );

  useEffect(() => {
    const media = window.matchMedia(mediaQuery);
    const updateReducedMotion = (event) => setReducedMotion(event.matches);
    media.addEventListener('change', updateReducedMotion);

    if (media.matches) {
      return () => media.removeEventListener('change', updateReducedMotion);
    }

    if (typeof IntersectionObserver === 'undefined' || !ref.current) {
      window.setTimeout(() => setVisible(true), 0);
      return () => media.removeEventListener('change', updateReducedMotion);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin: '0px' }
    );

    const fallback = setTimeout(() => setVisible(true), 1000);
    observer.observe(ref.current);

    return () => {
      clearTimeout(fallback);
      observer.disconnect();
      media.removeEventListener('change', updateReducedMotion);
    };
  }, [threshold]);

  return (
    <Component
      ref={ref}
      className={[
        'transition-all duration-500 ease-out motion-reduce:transition-none',
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4',
        className,
      ].join(' ')}
      style={{ transitionDelay: reducedMotion ? '0ms' : `${Math.max(0, delay)}ms` }}
    >
      {children}
    </Component>
  );
}
