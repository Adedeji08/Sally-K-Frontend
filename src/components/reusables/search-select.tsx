// components/search-select.tsx
import { useEffect, useState, useRef } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import type { ReactNode } from "react";

interface SelectOption {
  value: string;
  label: string;
  icon?: ReactNode;
}

interface SelectProps {
  label: string;
  name: string;                  
  options: SelectOption[];
  className?: string;
  onChange: (selectedValue: string) => void;
  value?: string;
  error?: string;
  icon?: ReactNode;
  disabled?: boolean;
   readOnly?: boolean;
}

export default function SearchSelect({
  label,
  name,                            // ← Received but not used in DOM yet
  options,
  className,
  onChange,
   readOnly = false,
  value,
  error,
  icon,
  disabled = false,
}: SelectProps) {
  const [inputValue, setInputValue] = useState("");
  const [selectedValue, setSelectedValue] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<"top" | "bottom">("bottom");
  const selectRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLUListElement>(null);

  // Sync internal state with controlled value
  useEffect(() => {
    setSelectedValue(value ?? "");
  }, [value]);

  // Handle dropdown positioning
  useEffect(() => {
    if (open && selectRef.current) {
      const selectRect = selectRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - selectRect.bottom;
      const spaceAbove = selectRect.top;
      const dropdownHeight = 300;

      if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
        setDropdownPosition("top");
      } else {
        setDropdownPosition("bottom");
      }
    }
  }, [open]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setInputValue("");
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(inputValue.toLowerCase())
  );

  const selectedOption = options.find(opt => opt.value === selectedValue);

  return (
    <div className={`${className} w-full`} ref={selectRef}>
      <label 
        htmlFor={name} // ← Optional: connect label to name if you add hidden input
        className={`text-[14px] font-bold text-[#121212] block mb-2 ${disabled ? 'text-gray-400' : ''}`}
      >
        {label}
      </label>

      <div className="relative w-full">
        <div
          onClick={() => !disabled && setOpen(!open)}
          className={`w-full h-[56px] border rounded flex items-center justify-between border-[#12121233] p-4 outline-none text-[12px] md:text-[14px]
            ${disabled ? 'cursor-not-allowed bg-gray-50' : 'cursor-pointer bg-white'}
            ${!selectedOption && "text-gray-500"}
            ${open && !disabled ? "border-blue-500 ring-2 ring-blue-200" : ""}`}
          role="button"
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-disabled={disabled}
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {icon && <span className={`${disabled ? 'text-gray-400' : 'text-gray-600'} flex-shrink-0`}>{icon}</span>}
            <span className={`truncate ${disabled ? 'text-gray-400' : ''}`}>
              {selectedOption ? selectedOption.label : `Select ${label}`}
            </span>
          </div>

          {open ? (
            <X
              size={18}
              className={`flex-shrink-0 ${disabled ? 'text-gray-400' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={(e) => {
                if (!disabled) {
                  e.stopPropagation();
                  setOpen(false);
                  setInputValue("");
                }
              }}
            />
          ) : (
            <ChevronDown
              size={20}
              className={`flex-shrink-0 ${disabled ? 'text-gray-400' : 'text-gray-500'} transition-transform ${open ? "rotate-180" : ""}`}
            />
          )}
        </div>

        {/* Dropdown Menu */}
        {!disabled && open && (
          <ul
            ref={dropdownRef}
            className={`absolute z-50 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden transition-all duration-200
              ${dropdownPosition === "top" ? "bottom-full mb-1" : "top-full mt-1"}
              ${open
                ? "max-h-80 opacity-100 visible"
                : "max-h-0 opacity-0 invisible border-0"
              }
              left-0 right-0 w-full min-w-[200px]`}
            role="listbox"
            style={{
              maxHeight: open ? '320px' : '0',
            }}
          >
            {/* Search Input */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-2">
              <div className="flex items-center gap-2 px-2 bg-gray-50 rounded">
                <Search size={18} className="text-gray-400 flex-shrink-0" />
                <input
                  type="text"
                  value={inputValue}
                  readOnly={readOnly}
                  autoFocus={true}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={`Search ${label.toLowerCase()}...`}
                  className="w-full py-2 bg-transparent outline-none placeholder:text-gray-400 text-sm"
                  onClick={(e) => e.stopPropagation()}
                />
                {inputValue && (
                  <X
                    size={18}
                    className="text-gray-400 hover:text-gray-600 cursor-pointer flex-shrink-0"
                    onClick={() => setInputValue("")}
                  />
                )}
              </div>
            </div>

            {/* Options List */}
            <div className="overflow-y-auto max-h-64">
              {filteredOptions.length > 0 ? (
                filteredOptions?.map((option) => (
                  <li
                    key={option.value}
                    className={`p-3 text-sm flex items-center gap-3 hover:bg-[#96A1AC1F] cursor-pointer transition-colors
                      ${option.value === selectedValue ? "bg-blue-50 text-[#121212] font-medium" : "text-gray-700"}
                    `}
                    onClick={() => {
                      setSelectedValue(option.value);
                      onChange(option.value);
                      setOpen(false);
                      setInputValue("");
                    }}
                    role="option"
                    aria-selected={option.value === selectedValue}
                  >
                    {option.icon && (
                      <span className="text-gray-500 flex-shrink-0">
                        {option.icon}
                      </span>
                    )}
                    <span className="truncate">{option.label}</span>
                  </li>
                ))
              ) : (
                <li className="p-3 text-sm text-gray-500 text-center">
                  No options found
                </li>
              )}
            </div>
          </ul>
        )}
      </div>

      {error && (
        <span className="error-text text-red-500 text-sm mt-1 block">
          {error}
        </span>
      )}

      {/* Mobile backdrop */}
      {open && !disabled && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => {
            setOpen(false);
            setInputValue("");
          }}
        />
      )}
    </div>
  );
}