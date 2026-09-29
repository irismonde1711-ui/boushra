"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function useScrollReveal(selector, { y = 30, stagger = 0.08, start = "top 85%" } = {}) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const targets = selector ? ref.current.querySelectorAll(selector) : [ref.current];
    if (!targets.length) return;

    const ctx = gsap.context(() => {
      gsap.from(targets, {
        opacity: 0,
        y,
        duration: 0.8,
        ease: "power2.out",
        stagger,
        scrollTrigger: { trigger: ref.current, start, once: true },
      });
    }, ref);

    return () => ctx.revert();
  }, [selector, y, stagger, start]);

  return ref;
}
