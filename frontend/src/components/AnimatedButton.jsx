import { useRef } from "react";
import { useMagneticButton } from "../hooks/useMagneticButton.js";

function AnimatedButton({ children, className = "", ...props }) {
  const ref = useRef(null);
  useMagneticButton(ref);

  return (
    <button
      ref={ref}
      className={`vv-button-primary px-6 py-2 text-sm font-semibold ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export default AnimatedButton;
