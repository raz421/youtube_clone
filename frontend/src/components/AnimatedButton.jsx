import { useRef } from "react";
import { useMagneticButton } from "../hooks/useMagneticButton.js";

function AnimatedButton({ children, className = "", ...props }) {
  const ref = useRef(null);
  useMagneticButton(ref);

  return (
    <button
      ref={ref}
      className={`rounded-lg border border-brand-base/60 bg-brand-base px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-base/20 transition-all duration-300 hover:border-brand-base hover:shadow-xl hover:shadow-brand-base/40 hover:scale-105 active:scale-95 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export default AnimatedButton;
