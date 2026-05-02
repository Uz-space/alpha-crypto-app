import { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

/**
 * Realistic iPhone 15 Pro style frame with Dynamic Island.
 * Pure CSS — uses semantic tokens where possible.
 */
export const IPhoneFrame = ({ children }: Props) => {
  return (
    <div className="relative" style={{ width: "min(360px, 92vw)", aspectRatio: "9 / 19.5" }}>
      {/* Outer titanium bezel */}
      <div
        className="absolute inset-0 rounded-[3rem] p-[3px]"
        style={{
          background:
            "linear-gradient(145deg, hsl(0 0% 28%) 0%, hsl(0 0% 8%) 35%, hsl(0 0% 18%) 65%, hsl(0 0% 6%) 100%)",
          boxShadow:
            "0 30px 80px -20px hsl(0 0% 0% / 0.7), 0 0 0 1px hsl(0 0% 20%), inset 0 0 1px hsl(0 0% 40%)",
        }}
      >
        {/* Inner frame */}
        <div
          className="relative h-full w-full rounded-[2.85rem] p-[2px] overflow-hidden"
          style={{ background: "hsl(0 0% 4%)" }}
        >
          {/* Screen */}
          <div className="relative h-full w-full rounded-[2.75rem] overflow-hidden bg-background">
            {children}

            {/* Dynamic Island */}
            <div
              className="absolute left-1/2 -translate-x-1/2 top-2 z-50 rounded-full"
              style={{
                width: "32%",
                height: "1.85rem",
                background: "hsl(0 0% 0%)",
                boxShadow: "inset 0 0 0 1px hsl(0 0% 8%)",
              }}
            >
              {/* Camera dot */}
              <span
                className="absolute right-3 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full"
                style={{
                  background:
                    "radial-gradient(circle at 30% 30%, hsl(220 30% 25%), hsl(0 0% 0%) 70%)",
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Side buttons */}
      <span
        className="absolute -left-[3px] top-[18%] h-10 w-[3px] rounded-l-sm"
        style={{ background: "hsl(0 0% 12%)" }}
      />
      <span
        className="absolute -left-[3px] top-[28%] h-16 w-[3px] rounded-l-sm"
        style={{ background: "hsl(0 0% 12%)" }}
      />
      <span
        className="absolute -left-[3px] top-[39%] h-16 w-[3px] rounded-l-sm"
        style={{ background: "hsl(0 0% 12%)" }}
      />
      <span
        className="absolute -right-[3px] top-[26%] h-20 w-[3px] rounded-r-sm"
        style={{ background: "hsl(0 0% 12%)" }}
      />
    </div>
  );
};
