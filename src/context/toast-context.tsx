import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import Toast from "../components/toast/toast";
import type { ToastType } from "../components/toast/toast";

interface ToastItem {
  id: number;
  type: ToastType;
  message: string;
}

interface ShowToastOptions {
  // ms before auto-dismiss. Pass 0 to keep it on screen until dismissed —
  // used by default for "loading" toasts that get update()'d into a result.
  duration?: number;
}

interface ToastContextValue {
  show: (type: ToastType, message: string, options?: ShowToastOptions) => number;
  success: (message: string, options?: ShowToastOptions) => number;
  error: (message: string, options?: ShowToastOptions) => number;
  info: (message: string, options?: ShowToastOptions) => number;
  loading: (message: string) => number;
  // Turn an existing (usually "loading") toast into a success/error result —
  // e.g. const id = toast.loading("Signing in..."); ... toast.update(id, "success", "Welcome back!")
  update: (id: number, type: ToastType, message: string, options?: ShowToastOptions) => void;
  dismiss: (id: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);
const DEFAULT_DURATION = 4000;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(0);
  const timers = useRef<Record<number, ReturnType<typeof setTimeout>>>({});

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    clearTimeout(timers.current[id]);
    delete timers.current[id];
  }, []);

  const scheduleDismiss = useCallback(
    (id: number, duration: number) => {
      clearTimeout(timers.current[id]);
      if (duration <= 0) return;
      timers.current[id] = setTimeout(() => dismiss(id), duration);
    },
    [dismiss]
  );

  const resolveDuration = (type: ToastType, options?: ShowToastOptions) =>
    options?.duration ?? (type === "loading" ? 0 : DEFAULT_DURATION);

  const show = useCallback(
    (type: ToastType, message: string, options?: ShowToastOptions) => {
      const id = ++nextId.current;
      setToasts((prev) => [...prev, { id, type, message }]);
      scheduleDismiss(id, resolveDuration(type, options));
      return id;
    },
    [scheduleDismiss]
  );

  const update = useCallback(
    (id: number, type: ToastType, message: string, options?: ShowToastOptions) => {
      setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, type, message } : t)));
      scheduleDismiss(id, resolveDuration(type, options));
    },
    [scheduleDismiss]
  );

  const value = useMemo<ToastContextValue>(
    () => ({
      show,
      success: (message, options) => show("success", message, options),
      error: (message, options) => show("error", message, options),
      info: (message, options) => show("info", message, options),
      loading: (message) => show("loading", message, { duration: 0 }),
      update,
      dismiss,
    }),
    [show, update, dismiss]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed top-4 right-4 z-[999] flex flex-col gap-3 items-end pointer-events-none">
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <Toast type={t.type} message={t.message} onDismiss={() => dismiss(t.id)} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx;
}
