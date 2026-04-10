import gsap from "gsap";
import { useLayoutEffect, useRef } from "react";

export const usePageTransition = (pathKey) => {
  const ref = useRef(null);

  useLayoutEffect(() => {
    if (!ref.current) {
      return;
    }

    gsap.fromTo(
      ref.current,
      { autoAlpha: 0, y: 20 },
      { autoAlpha: 1, y: 0, duration: 0.55, ease: "power3.out" }
    );
  }, [pathKey]);

  return ref;
};
