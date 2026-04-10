import gsap from "gsap";
import { useEffect } from "react";

export const useMagneticButton = (ref) => {
  useEffect(() => {
    const node = ref.current;
    if (!node) {
      return;
    }

    const onMouseMove = (event) => {
      const bounds = node.getBoundingClientRect();
      const x = event.clientX - bounds.left - bounds.width / 2;
      const y = event.clientY - bounds.top - bounds.height / 2;

      gsap.to(node, {
        x: x * 0.2,
        y: y * 0.2,
        duration: 0.25,
        ease: "power2.out",
      });
    };

    const reset = () => {
      gsap.to(node, {
        x: 0,
        y: 0,
        duration: 0.3,
        ease: "power2.out",
      });
    };

    node.addEventListener("mousemove", onMouseMove);
    node.addEventListener("mouseleave", reset);

    return () => {
      node.removeEventListener("mousemove", onMouseMove);
      node.removeEventListener("mouseleave", reset);
    };
  }, [ref]);
};
