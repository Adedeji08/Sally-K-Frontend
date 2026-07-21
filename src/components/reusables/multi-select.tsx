import { useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";

interface MultiSelectOption {
  value: string;
  label: string;
}

interface MultiSelectProps {
  label?: string;
  options: MultiSelectOption[];
  className?: string;
  value: string[];
  onChange: (values: string[]) => void;
  error?: string;
  placeholder?: string;
}

export default function MultiSelect({
  label,
  options,
  className,
  value,
  onChange,
  error,
  placeholder = "Select",
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOption = (optionValue: string) => {
    onChange(
      value.includes(optionValue)
        ? value.filter((v) => v !== optionValue)
        : [...value, optionValue]
    );
  };

  const displayedLabel = value.length
    ? options
        .filter((o) => value.includes(o.value))
        .map((o) => o.label)
        .join(", ")
    : placeholder;

  return (
    <div className={`relative flex flex-col gap-2 md:gap-3 ${className ?? ""}`} ref={dropdownRef}>
      {label && (
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      <div className="relative">
        <div
          onClick={() => setIsOpen((prev) => !prev)}
          className="text-field w-full h-[56px] border border-[#12121233] p-4 rounded-xl outline-none text-[12px] md:text-[14px] transition gradient-ring cursor-pointer"
        >
          <span
            className={`text-[12px] md:text-[14px] font-medium truncate block ${
              value.length ? "text-[#333333]" : "text-[#95959D]"
            }`}
          >
            {displayedLabel}
          </span>
        </div>

        {isOpen && (
          <ul className="absolute z-10 w-full bg-white border border-[#E5E7EB] py-2 rounded-md shadow-lg shadow-[#03071214] max-h-52 overflow-y-auto text-[12px] md:text-[13px]">
            {options.map((option) => {
              const checked = value.includes(option.value);
              return (
                <li
                  key={option.value}
                  onClick={() => toggleOption(option.value)}
                  className="flex items-center justify-between py-2.5 px-4 hover:bg-gray-100 cursor-pointer gap-2"
                >
                  <span className="text-[#333333]">{option.label}</span>
                  <span
                    className={`w-4 h-4 rounded flex items-center justify-center border shrink-0 ${
                      checked ? "bg-[#ED1280] border-[#ED1280]" : "border-[#12121233]"
                    }`}
                  >
                    {checked && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {error && <span className="error-text text-[#FF0101] text-[14px]">{error}</span>}
    </div>
  );
}
