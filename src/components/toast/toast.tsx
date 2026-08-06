import { CircleCheck, CircleX, Info, X } from "lucide-react";
import { ClipLoader } from "react-spinners";

export type ToastType = "success" | "error" | "info" | "loading";

interface ToastVariant {
  bg: string;
  textColor: string;
  accentColor: string;
  Icon: typeof CircleCheck | null;
}

// One place to restyle any toast type — swap colors/icons here and every
// toast using that type picks it up. Background stays white per design, but
// nothing stops a variant from overriding it.
export const TOAST_VARIANTS: Record<ToastType, ToastVariant> = {
  success: { bg: "#FFFFFF", textColor: "#1E7B3E", accentColor: "#1E7B3E", Icon: CircleCheck },
  error: { bg: "#FFFFFF", textColor: "#FF0101", accentColor: "#FF0101", Icon: CircleX },
  info: { bg: "#FFFFFF", textColor: "#0867AC", accentColor: "#0867AC", Icon: Info },
  loading: { bg: "#FFFFFF", textColor: "#1F1F1F", accentColor: "#ED1280", Icon: null },
};

export interface ToastProps {
  type: ToastType;
  message: string;
  onDismiss?: () => void;
}

export default function Toast({ type, message, onDismiss }: ToastProps) {
  const variant = TOAST_VARIANTS[type];
  const Icon = variant.Icon;

  return (
    <div
      role="status"
      className="toast-enter flex items-start gap-3 w-[320px] max-w-[calc(100vw-2rem)] rounded-2xl shadow-lg pl-4 pr-3 py-3.5"
      style={{ backgroundColor: variant.bg, borderLeft: `4px solid ${variant.accentColor}` }}
    >
      <span className="shrink-0 mt-0.5 flex items-center justify-center w-5 h-5">
        {type === "loading" ? (
          <ClipLoader size={16} color={variant.accentColor} />
        ) : (
          Icon && <Icon className="w-5 h-5" style={{ color: variant.accentColor }} strokeWidth={2} />
        )}
      </span>

      <p
        className="flex-1 text-[13px] font-medium leading-snug pt-0.5"
        style={{ color: variant.textColor }}
      >
        {message}
      </p>

      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss notification"
          className="shrink-0 -mr-1 -mt-1 p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <X className="w-3.5 h-3.5" strokeWidth={2} />
        </button>
      )}
    </div>
  );
}
