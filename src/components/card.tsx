import React from "react";

interface CardProps {
  children: React.ReactNode;
  sx?: React.CSSProperties;
  classNames?: string;
  showCard?: boolean;
  style?: React.CSSProperties;
  title?: string;
  fullWidth?: boolean;
}

export default function Card(props: CardProps) {
  const {
    classNames = "",
    sx,
    children,
    showCard = false,
    style = {},
    title,
    fullWidth = false,
  } = props;
  const combinedStyle: React.CSSProperties = {
    ...sx,
    ...style,
  };

  return (
    <div
      style={combinedStyle}
      className={`rounded-3xl bg-[#fff] ${fullWidth ? "" : "lg:w-[500px]"} px-3 shadow-md ${classNames} ${
        showCard ? "bg-[#fff]" : ""
      }`}
    >
      {title && (
        <h2 className="text-[16px] lg:text-[26px] border-[#000] border-b-[2px] py-6 font-semibold text-center">
          {title}
        </h2>
      )}

      <div className="p-4 md:px-4 ">{children}</div>
    </div>
  );
}