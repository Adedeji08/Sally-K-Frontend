import { useState } from "react";

interface SalesChartPoint {
  label: string;
  value: number;
}

interface SalesChartProps {
  data: SalesChartPoint[];
  valuePrefix?: string;
}

const GRID_LINES = [0, 25, 50, 75, 100];

export default function SalesChart({ data, valuePrefix = "₦" }: SalesChartProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const maxValue = Math.max(1, ...data.map((d) => d.value));
  const hasData = data.some((d) => d.value > 0);

  if (!hasData) {
    return (
      <div className="h-56 flex items-center justify-center text-center px-6">
        <p className="text-sm text-[#95959D]">
          No sales yet — your sales trend will appear here once you receive orders.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex">
        {/* Y axis labels */}
        <div className="flex flex-col justify-between h-56 pr-3 text-right shrink-0">
          {[...GRID_LINES].reverse().map((pct) => (
            <span key={pct} className="text-[11px] text-[#95959D] leading-none">
              {valuePrefix}
              {Math.round((maxValue * pct) / 100)}
            </span>
          ))}
        </div>

        {/* Chart area */}
        <div className="relative flex-1 h-56 border-l border-b border-[#E7E1E4]">
          {GRID_LINES.map((pct) => (
            <div
              key={pct}
              className="absolute left-0 right-0 border-t border-[#F2E8ED]"
              style={{ bottom: `${pct}%` }}
            />
          ))}

          <div className="absolute inset-0 flex items-end justify-between gap-1.5 px-2">
            {data.map((point, index) => {
              const heightPct = Math.max(2, (point.value / maxValue) * 100);
              const isHovered = hoverIndex === index;
              return (
                <div
                  key={`${point.label}-${index}`}
                  className="relative flex-1 h-full flex items-end justify-center"
                  onMouseEnter={() => setHoverIndex(index)}
                  onMouseLeave={() => setHoverIndex(null)}
                >
                  {isHovered && (
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#1F1F1F] text-white text-[11px] font-semibold px-2 py-1 rounded-md whitespace-nowrap z-10">
                      {valuePrefix}
                      {point.value.toFixed(0)}
                    </div>
                  )}
                  <div
                    className="w-full max-w-[28px] rounded-t-md transition-colors"
                    style={{
                      height: `${heightPct}%`,
                      backgroundColor: isHovered ? "#D10E70" : "#ED1280",
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* X axis labels */}
      <div className="flex pl-[52px]">
        <div className="flex-1 flex justify-between gap-1.5 px-2 pt-2">
          {data.map((point, index) => (
            <span
              key={`${point.label}-${index}`}
              className="flex-1 text-center text-[11px] text-[#95959D] truncate"
            >
              {point.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
