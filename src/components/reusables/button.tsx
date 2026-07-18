import type { ReactNode } from "react";
import classNames from "classnames";

interface ButtonProps {
  children: ReactNode;
  variant?: "primary" | "secondary" | "suplementary" | "default" | "disabled";
  size?: "sm" | "md" | "lg" | "full-half";
  type?: "button" | "submit" | "reset";
  href?: string;
  className?: string;
  disabled?: boolean;
  onClick?: (e?: any) => void;
}

const Button = ({
  size = "lg",
  variant,
  children,
  type,
  href,
  onClick,
  disabled,
  className,
}: ButtonProps) => {
  const Component = href ? "a" : "button";
  return (
    <Component
      href={href}
      type={type}
      onClick={onClick}
      className={classNames(
        `inline-flex items-center justify-center text-center h-[56px] shadow px-5 py-2 gap-2 border rounded-xl font-semibold text-xs md:text-sm ${className}`,
        {
          "w-full": size === "lg",
          "w-[75%]": size === "md",
          "w-[50%]": size === "sm",
          "w-full md:w-[50%]": size === "full-half",
          "text-[#fff] bg-[#ED1280] hover:opacity-75 disabled:cursor-not-allowed disabled:opacity-75":
            variant === "primary",
          "text-[#fff] bg-[#27AE60]": variant === "secondary",
          "text-[#121212B2] bg-[#4834D4] border-none": variant === "suplementary",
          "text-[#333D4D] bg-transparent border border-[#121212]": variant === "default",
          "text-[#95959D] bg-[#E3E3E5] disabled:opacity-90": variant === "disabled",
        }
      )}
      disabled={disabled}
    >
      {children}
    </Component>
  );
};

export default Button;