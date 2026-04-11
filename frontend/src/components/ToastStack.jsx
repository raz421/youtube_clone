import { useEffect } from "react";
import { useAppStore } from "../store/appStore.js";

const TOAST_LIFETIME_MS = 1600;

function ToastStack() {
  const toasts = useAppStore((state) => state.toasts);
  const removeToast = useAppStore((state) => state.removeToast);

  useEffect(() => {
    if (!toasts.length) {
      return;
    }

    const timer = setTimeout(() => {
      removeToast(toasts[0].id);
    }, TOAST_LIFETIME_MS);

    return () => clearTimeout(timer);
  }, [toasts, removeToast]);

  return (
    <div className="fixed bottom-5 right-5 z-50 w-[calc(100vw-2rem)] max-w-sm space-y-2.5">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`group relative overflow-hidden rounded-xl border bg-[rgba(12,12,18,0.9)] px-4 py-3 shadow-[0_16px_35px_rgba(0,0,0,0.45)] backdrop-blur-xl transition-all duration-300 ${
            toast.type === "error"
              ? "border-rose-400/45"
              : "border-emerald-300/40"
          }`}
        >
          <div
            className={`absolute inset-y-0 left-0 w-1 ${
              toast.type === "error" ? "bg-rose-400" : "bg-emerald-400"
            }`}
          />

          <div className="flex items-start gap-3 pl-2">
            <span
              className={`mt-1 h-2.5 w-2.5 rounded-full ${
                toast.type === "error" ? "bg-rose-400" : "bg-emerald-400"
              }`}
            />

            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/70">
                {toast.type === "error" ? "Error" : "Success"}
              </p>
              <p className="mt-1 text-sm font-medium leading-snug text-white">
                {toast.message}
              </p>
            </div>

            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              aria-label="Dismiss notification"
              className="-mr-1 rounded-md px-2 py-1 text-xs text-white/60 transition hover:bg-white/10 hover:text-white"
            >
              x
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ToastStack;
