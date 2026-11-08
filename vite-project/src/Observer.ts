import { useEffect, useRef, useState } from "react";

interface ObserverProps {
  repeat?: boolean;
  threshold?: number;
}

export function Observe<T extends HTMLElement = HTMLDivElement>({
  repeat = false,
  threshold = 0.5,
}: ObserverProps = {}) {
  const [showCase, setShowStat] = useState(false);
  const elRef = useRef<T | null>(null);

  useEffect(() => {
    const element = elRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          setShowStat(true);
          if (!repeat) {
            observer.unobserve(element);
          }
        } else if (repeat) {
          setShowStat(false);
        }
      },
      {
        threshold,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, repeat]);

  return { elRef, isInView: showCase };
}