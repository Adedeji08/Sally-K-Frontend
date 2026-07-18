import classNames from "classnames";
import { useState } from "react";
import type { ChangeEvent } from "react";

interface TextareaProps {
  label?: string;
  placeholder?: string;
  className?: string;
  onChange?: (event: ChangeEvent<HTMLTextAreaElement>) => void;
  name?: string;
  value?: string;
  error?: string;
  readOnly?: boolean;
  variant?: "primary" | "secondary";
  required?: boolean;
}

export default function Textarea({
  label,
  placeholder,
  className,
  onChange,
  name,
  value,
  error,
  readOnly = false,
  variant = "primary",
  required = false,
}: TextareaProps) {
  const [isEmptyAndTouched, setIsEmptyAndTouched] = useState(false);

  const handleTextareaChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    // Check if textarea is empty after typing
    setIsEmptyAndTouched(event.target.value.trim() === '');

    if (onChange) {
      onChange(event);
    }
  };

  const handleBlur = (event: React.FocusEvent<HTMLTextAreaElement>) => {
    // Mark as empty and touched when textarea loses focus and is empty
    setIsEmptyAndTouched(event.target.value.trim() === '');
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && (
        <div className="lg:text-[14px] text-[12px] text-[#4a4a4a] font-semibold md:text-[14px]">
          {label}
        </div>
      )}

      <textarea
        placeholder={placeholder}
        className={classNames(
          "text-field w-full h-[90px] px-5 pt-2 rounded-md outline-none border transition gradient-ring",
          {
            "bg-[#FFF]": variant === "secondary", 
            "bg-[#] border-[1px] solid": variant === "primary", 
            "border-[#FF0101]": required && (isEmptyAndTouched || (value === undefined || value === '')),
            "border-[#E5E7EB]": !(required && (isEmptyAndTouched || (value === undefined || value === ''))),
            error: error
          }
        )}
        onChange={handleTextareaChange}
        onBlur={handleBlur}
        value={value}
        name={name}
        readOnly={readOnly}
      />

      {error && (
        <span className="error-text text-[#FF0101] text-[14px]">{error}</span>
      )}
      
      {/* {required && (isEmptyAndTouched || (value === undefined || value === '')) && (
        <span className="error-text text-[#FF0101] text-[14px]">This field is required</span>
      )} */}
    </div>
  );
}