"use client";
import { useRef, useEffect, useState, type ReactNode, type CSSProperties } from "react";

interface Props {
  children: ReactNode;
  delay?: number;
  className?: string;
  style?: CSSProperties;
}

export function ScrollReveal({ children, delay = 0, className = "", style }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.08, rootMargin: "0px 0px -60px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        ...style,
        opacity: visible ? 1 : 0,
        transform: visible ? "none" : "translateY(55px) scale(0.96)",
        filter: visible ? "none" : "blur(8px)",
        transition: [
          `opacity 0.95s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
          `transform 0.95s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
          `filter 0.95s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
        ].join(", "),
        willChange: "opacity, transform, filter",
      }}
    >
      {children}
    </div>
  );
}
