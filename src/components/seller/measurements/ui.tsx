import type { ReactNode } from "react";
import { CalendarClock, Mars, Venus } from "lucide-react";
import type { Gender } from "../../../types/measurement";
import { DUE_TONE_CLASS, GENDER_STYLE, dueLabel, initials } from "../../../types/measurement";

export function ClientAvatar({ name, gender, size = "md" }: { name: string; gender: Gender; size?: "sm" | "md" | "lg" }) {
  const dims = size === "lg" ? "w-16 h-16 text-xl" : size === "sm" ? "w-9 h-9 text-[12px]" : "w-11 h-11 text-sm";
  return (
    <span className={`${dims} rounded-full flex items-center justify-center font-semibold shrink-0 ${GENDER_STYLE[gender].avatar}`}>
      {initials(name) || "?"}
    </span>
  );
}

export function GenderPill({ gender, label }: { gender: Gender; label: string }) {
  const Icon = gender === "FEMALE" ? Venus : Mars;
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${GENDER_STYLE[gender].pill}`}>
      <Icon className="w-3 h-3" strokeWidth={2.5} />
      {label}
    </span>
  );
}

export function DueChip({ date }: { date: string }) {
  const { text, tone } = dueLabel(date);
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${DUE_TONE_CLASS[tone]}`}>
      <CalendarClock className="w-3 h-3" strokeWidth={2.5} />
      {text}
    </span>
  );
}

export function ConfirmModal({
  title,
  body,
  confirmLabel,
  busy,
  onConfirm,
  onClose,
}: {
  title: string;
  body: ReactNode;
  confirmLabel: string;
  busy?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4" onClick={onClose}>
      <div className="w-full max-w-[380px] bg-white rounded-3xl shadow-xl p-6 text-center" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-[16px] font-semibold text-[#121212] mb-1">{title}</h2>
        <p className="text-[13px] text-[#65799A] mb-6">{body}</p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-full text-sm font-semibold text-[#4a4a4a] border border-[#E5E7EB] hover:bg-[#F7F2F4] transition-colors"
          >
            Keep it
          </button>
          <button
            onClick={onConfirm}
            disabled={busy}
            className="flex-1 px-4 py-2.5 rounded-full text-sm font-semibold text-white bg-rose-500 hover:bg-rose-600 transition-colors disabled:opacity-60"
          >
            {busy ? "Deleting..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
