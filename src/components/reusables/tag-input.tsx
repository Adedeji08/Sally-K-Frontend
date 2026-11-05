import { useRef, useState } from "react";
import type { ClipboardEvent, KeyboardEvent } from "react";
import { X } from "lucide-react";

interface TagInputProps {
  label?: string;
  placeholder?: string;
  className?: string;
  value: string[];
  onChange: (values: string[]) => void;
  error?: string;
  subtext?: string;
  // Render a small colour dot in each tag when the text is a valid CSS colour
  // ("red", "navy", "#1F2A44"). Anything else ("wine", "nude") gets a neutral dot.
  showSwatch?: boolean;
  suggestions?: string[];
}

const SEPARATORS = /[,\n]/;

function isCssColor(value: string): boolean {
  return typeof CSS !== "undefined" && CSS.supports("color", value);
}

export default function TagInput({
  label,
  placeholder = "Type and press Enter",
  className,
  value,
  onChange,
  error,
  subtext,
  showSwatch = false,
  suggestions = [],
}: TagInputProps) {
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const addTags = (raw: string[]) => {
    const next = [...value];
    for (const item of raw) {
      const tag = item.trim().toLowerCase();
      if (tag && !next.includes(tag)) next.push(tag);
    }
    if (next.length !== value.length) onChange(next);
  };

  const removeTag = (tag: string) => onChange(value.filter((t) => t !== tag));

  const commitDraft = () => {
    if (!draft.trim()) return;
    addTags(draft.split(SEPARATORS));
    setDraft("");
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      commitDraft();
    } else if (event.key === "Backspace" && !draft && value.length) {
      removeTag(value[value.length - 1]);
    }
  };

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    const text = event.clipboardData.getData("text");
    if (!SEPARATORS.test(text)) return;
    event.preventDefault();
    addTags(text.split(SEPARATORS));
  };

  const remainingSuggestions = suggestions.filter((s) => !value.includes(s.toLowerCase()));

  return (
    <div className={`flex flex-col gap-2 md:gap-1 ${className ?? ""}`}>
      {label && <label className="text-[14px] font-bold text-[#121212]">{label}</label>}

      <div
        onClick={() => inputRef.current?.focus()}
        className={`min-h-[56px] w-full flex flex-wrap items-center gap-2 rounded-xl px-3 py-2.5 bg-[#F2E8ED] cursor-text transition gradient-ring border ${
          error ? "border-[#FF0101]" : "border-transparent"
        }`}
      >
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1.5 bg-white rounded-full pl-2 pr-1 py-1 text-[12px] md:text-[13px] font-medium text-[#333333] shadow-sm capitalize"
          >
            {showSwatch && (
              <span
                className="w-3.5 h-3.5 rounded-full border border-[#12121220] shrink-0"
                style={{ backgroundColor: isCssColor(tag) ? tag : "#E5E7EB" }}
              />
            )}
            {tag}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeTag(tag);
              }}
              className="w-5 h-5 rounded-full flex items-center justify-center text-[#95959D] hover:text-[#ED1280] hover:bg-[#F2E8ED] transition-colors"
              aria-label={`Remove ${tag}`}
            >
              <X className="w-3 h-3" strokeWidth={2.5} />
            </button>
          </span>
        ))}

        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          onBlur={commitDraft}
          placeholder={value.length ? "" : placeholder}
          className="flex-1 min-w-[120px] bg-transparent outline-none text-[12px] md:text-[14px] py-1 px-1 placeholder:text-[#95959D]"
          autoComplete="off"
        />
      </div>

      {remainingSuggestions.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 mt-1">
          <span className="text-[12px] text-[#65799A] mr-0.5">Quick add:</span>
          {remainingSuggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => addTags([s])}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#E5E7EB] px-2.5 py-1 text-[12px] text-[#4a4a4a] capitalize hover:border-[#ED1280] hover:text-[#ED1280] transition-colors"
            >
              {showSwatch && (
                <span
                  className="w-2.5 h-2.5 rounded-full border border-[#12121220]"
                  style={{ backgroundColor: isCssColor(s) ? s : "#E5E7EB" }}
                />
              )}
              {s}
            </button>
          ))}
        </div>
      )}

      {subtext && !error && <span className="text-[12px] text-[#65799A] mt-1">{subtext}</span>}
      {error && <span className="text-[#FF0101] text-[12px] mt-1">{error}</span>}
    </div>
  );
}
