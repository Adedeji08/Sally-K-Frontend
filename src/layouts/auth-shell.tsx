import type { ReactNode } from "react";
import Card from "../components/card";

interface Step {
  current: number;
  total: number;
  labels: string[];
}

interface AuthShellProps {
  children: ReactNode;
  title?: string;
  step?: Step;
}

export default function AuthShell({ children, title, step }: AuthShellProps) {
  return (
    <div className="min-h-screen bg-[#F7F2F4] flex justify-center px-4 py-10">
      <div className="w-full max-w-[500px] flex flex-col items-center">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-7 h-7 flex items-center justify-center">
            <div className="relative w-5 h-5">
              <div className="absolute left-0 top-0 w-2 h-5 bg-black rounded-[1px]" />
              <div className="absolute left-0 bottom-0 w-5 h-2 bg-black rounded-[1px]" />
            </div>
          </div>
          <h1 className="text-[18px] font-semibold text-[#1F1F1F] tracking-[-0.2px]">
            Sally-K
          </h1>
        </div>

        {step && (
          <div className="flex items-center gap-2 mb-6 w-full">
            {step.labels.map((label, i) => {
              const idx = i + 1;
              const reached = idx <= step.current;
              return (
                <div key={label} className="flex-1 flex flex-col items-center gap-1.5">
                  <div
                    className={`h-1.5 w-full rounded-full ${
                      reached ? "bg-[#ED1280]" : "bg-[#E7E1E4]"
                    }`}
                  />
                  <span
                    className={`text-[11px] font-medium ${
                      idx === step.current ? "text-[#1F1F1F]" : "text-[#95959D]"
                    }`}
                  >
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        <div className="w-full">
          <Card title={title} classNames="w-full">
            {children}
          </Card>
        </div>
      </div>
    </div>
  );
}
