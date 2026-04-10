import { useEffect } from "react";
import { useAppStore } from "../store/appStore.js";

function ToastStack() {
  const toasts = useAppStore((state) => state.toasts);
  const removeToast = useAppStore((state) => state.removeToast);

  useEffect(() => {
    if (!toasts.length) {
      return;
    }

    const timer = setTimeout(() => {
      removeToast(toasts[0].id);
    }, 2800);

    return () => clearTimeout(timer);
  }, [toasts, removeToast]);

  return (
    <div className="fixed bottom-5 right-5 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`min-w-[220px] rounded-xl border px-4 py-3 text-sm font-medium text-white shadow-xl backdrop-blur ${
            toast.type === "error"
              ? "border-rose-300/40 bg-rose-500/80 shadow-rose-500/20"
              : "border-emerald-300/40 bg-emerald-500/80 shadow-emerald-500/20"
          }`}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}

export default ToastStack;
