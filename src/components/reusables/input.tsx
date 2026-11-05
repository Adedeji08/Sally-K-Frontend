import classNames from "classnames";
import { useEffect, useState, forwardRef } from "react";
import type {
  ChangeEvent,
  ClipboardEvent,
  KeyboardEvent,
  HTMLInputTypeAttribute,
} from "react";

interface InputProps {
  label?: string;
  placeholder?: string;
  className?: string;
  type?: HTMLInputTypeAttribute;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  onPaste?: (event: ClipboardEvent<HTMLInputElement>) => void;
  onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void; 
  onRightIconClick?: () => void; 
  name?: string;
  value?: string | number;
  error?: string;
  readOnly?: boolean;
  variant?: "primary" | "secondary";
  placeholderPosition?: "left" | "center";
  ref?: any;
  icon?: any;
  rightIcon?: any;
  prefix?: string | React.ReactNode;
  useOCRFont?: boolean;
  autoComplete?: string;
  required?: boolean;
  min?: number;
  // New prop for subtext
  subtext?: string;
  // Optional prop to customize subtext appearance
  subtextVariant?: "default" | "muted" | "info" | "warning";
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      placeholder,
      className,
      type,
      onChange,
      onPaste,
      onKeyDown,
      onRightIconClick,
      name,
      value,
      error,
      readOnly = false,
      variant = "primary",
      placeholderPosition = "left",
      icon,
      rightIcon,
      prefix,
      useOCRFont = false,
      autoComplete = "on",
      required = false,
      min = 0,
      // New prop with default
      subtext = "",
      // Subtext variant with default
      subtextVariant = "default",
    }: InputProps,
    ref
  ) => {
    const [isEmpty, setIsEmpty] = useState(true);
    const [numberError, setNumberError] = useState(false);

    useEffect(() => {
      const empty = value === undefined || value === "" || value === null;
      setIsEmpty(empty);

      if (type === "number" && !empty) {
        const numValue = Number(value);
        setNumberError(numValue <= min);
      }
    }, [value, type, min]);

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
      let inputValue = event.target.value;

      if (type === "number") {
        inputValue = inputValue.replace(/[^0-9.]/g, "");
        if (inputValue !== "") {
          const numValue = Number(inputValue);
          setNumberError(numValue <= min);
        } else {
          setNumberError(false);
        }
      }

      setIsEmpty(inputValue.trim() === "");

      if (onChange) {
        event.target.value = inputValue;
        onChange(event);
      }
    };

    const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
      const inputValue = event.target.value;
      setIsEmpty(inputValue.trim() === "");
      if (type === "number" && inputValue !== "") {
        setNumberError(Number(inputValue) <= min);
      }
    };

    const showError =
      error ||
      (required && isEmpty) ||
      (type === "number" && (numberError || value === 0));

    // Define subtext styles based on variant
    const getSubtextStyles = () => {
      switch (subtextVariant) {
        case "muted":
          return "text-gray-500";
        case "info":
          return "text-blue-600";
        case "warning":
          return "text-amber-600";
        case "default":
        default:
          return "text-gray-700";
      }
    };

    return (
      <div className={`flex flex-col gap-2 md:gap-1 ${className}`}>
        {label && <label className="text-[14px] font-bold text-[#121212]">{label}</label>}

        <div className="relative flex items-center">
          {icon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {icon}
            </span>
          )}

          {prefix && (
            <span
              className={`absolute ${
                icon ? "left-10" : "left-4"
              } top-1/2 -translate-y-1/2 text-gray-500 select-none text-sm whitespace-nowrap`}
            >
              {prefix}
            </span>
          )}

          {/* RIGHT ICON */}
          {rightIcon && (
            <button
              type="button"
              onClick={onRightIconClick}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-full"
            >
              {rightIcon}
            </button>
          )}

          <input
            ref={ref as any}
            id={label}
            placeholder={placeholder}
            className={classNames(
              "w-full h-[56px] rounded-xl p-4 bg-[#F2E8ED] outline-none text-[12px] md:text-[14px] transition gradient-ring",
              {
                "text-style": useOCRFont,
                "bg-[#F9FAFB] rounded-full": variant === "secondary",
                "border-[#FF0101]": showError,
                "border-[#E5E7EB]": !showError,
                "text-left placeholder:text-left":
                  placeholderPosition === "left",
                "text-center placeholder:text-center":
                  placeholderPosition === "center",
                "pl-10": !!icon && !prefix,
                "pr-10": !!rightIcon,
              }
            )}
            style={
              // Prefix width varies with its text, so pad the input to fit it
              // exactly (ch = width of one character in the input's font)
              // instead of a fixed guess that clips or crowds longer prefixes.
              prefix
                ? {
                    paddingLeft: `calc(${icon ? "2.5rem" : "1rem"} + ${
                      typeof prefix === "string" ? prefix.length : 8
                    }ch + 0.4rem)`,
                  }
                : undefined
            }
            onChange={handleInputChange}
            onBlur={handleBlur}
            onPaste={onPaste}
            onKeyDown={onKeyDown}
            value={value}
            type={type === "number" ? "text" : type}
            name={name}
            readOnly={readOnly}
            autoComplete={autoComplete}
          />
        </div>

        {/* Show subtext if provided */}
        {subtext && !showError && (
          <span className={`text-[12px] text-[#65799A] mt-1 ${getSubtextStyles()}`}>
            {subtext}
          </span>
        )}

        {/* Show error if exists (takes priority over subtext) */}
        {showError && (
          <span className="text-[#FF0101] text-[12px] mt-1">
            {type === "number" && (numberError || value === 0)
              ? `Value must be greater than ${min}`
              : error || "This field is required"}
          </span>
        )}
      </div>
    );
  }
);

export default Input;