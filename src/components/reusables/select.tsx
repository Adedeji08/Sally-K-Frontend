import React, { useState, useEffect, useRef } from "react";

interface Option {
  value: string;
  label: string;
  icon?: any; // Icon component type
}

interface SelectProps {
  label?: string;
  name?: string;
  options: Option[];
  className?: string;
  onChange: (selectedValue: string) => void;
  value?: string;
  displayValue?: (value: string) => string;
  error?: string;
  message?: string;
  icon?: any; // <-- Added icon prop for label icon
}

export default function Select({
  label,
  options,
  className,
  onChange,
  value,
  displayValue,
  error,
  message,
  icon // Destructure label icon
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [, setSelectedValue] = useState(value || "");
  const [selectedLabel, setSelectedLabel] = useState("");
  const [selectedIcon, setSelectedIcon] = useState<React.ReactNode>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleOptionClick = (option: Option) => {
    setSelectedValue(option.value);
    setSelectedLabel(option.label);
    setSelectedIcon(
      option.icon ? <option.icon className="text-green-500" /> : null
    );
    onChange(option.value);
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Update selection when value changes externally
  useEffect(() => {
    const selected = options.find((option) => option.value === value);
    setSelectedValue(value || "");
    setSelectedLabel(selected?.label || "");
    setSelectedIcon(
      selected?.icon ? <selected.icon className="text-green-500" /> : null
    );
  }, [value, options]);

  const displayedValue = displayValue
    ? displayValue(value || "")
    : selectedLabel;

  return (
    <div
      className={`relative flex flex-col  gap-2 md:gap-3 ${className}`}
      ref={dropdownRef}
    >
      {label && (
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

       {icon && (
        <span className="absolute left-3 top-[55px] -translate-y-1/2 text-gray-400">
          {icon}
        </span>
      )}

      <div className="relative">
        <div
          onClick={toggleDropdown}
          className="text-field w-full pl-10 h-[56px] border border-[#12121233] p-4 rounded-xl outline-none text-[12px] md:text-[14px] transition gradient-ring"
        >
          <span className="text-[12px] md:text-[14px] text-[#333333] font-medium flex items-center gap-2">
            {selectedIcon && (
              <span className="w-4 h-4 flex items-center justify-center">
                {selectedIcon}
              </span>
            )}
            {displayedValue || "Select"}
          </span>
        </div>

        {isOpen && (
          <ul className="absolute z-10 w-full bg-white border border-[#E5E7EB] py-3 rounded-md shadow-lg shadow-[#03071214]  max-h-40 overflow-y-auto text-[12px] md:text-[12px]">
            {options?.map((option) => {
              const IconComponent = option.icon;
              return (
                <li
                  key={option.value}
                  onClick={() => handleOptionClick(option)}
                  className="flex items-center py-2 px-5 hover:bg-gray-200 cursor-pointer gap-2"
                >
                  {IconComponent && (
                    <span className="w-4 h-4 flex items-center justify-center">
                      <IconComponent className="text-green-500" />
                    </span>
                  )}
                  {option.label}
                </li>
              );
            })}

            {message && (
              <div className="mt-1 text-sm text-[#667085] border-t border-gray-300 py-5 px-8">
                {message}
              </div>
            )}
          </ul>
        )}
      </div>

      {error && (
        <span className="error-text text-[#FF0101] text-[14px]">{error}</span>
      )}
    </div>
  );
}
