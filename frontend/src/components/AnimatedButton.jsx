import { useRef } from "react";
import { useMagneticButton } from "../hooks/useMagneticButton.js";

function AnimatedButton({ children, className = "", ...props }) {
  const ref = useRef(null);
  useMagneticButton(ref);

  return (
    <button
      ref={ref}
      className={`rounded-full border border-white/20 bg-white/10 px-5 py-2 text-sm font-medium text-brand-ink shadow-glow transition hover:bg-white/20 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export default AnimatedButton;
