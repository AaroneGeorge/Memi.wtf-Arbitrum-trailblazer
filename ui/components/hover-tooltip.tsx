import { useState, useRef, useEffect } from "react";
import { Info } from "lucide-react";

interface HoverTooltipProps {
  content: string;
}

export function HoverTooltip({ content }: HoverTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const showTooltip = () => {
    clearTimeout(timerRef.current);
    setIsVisible(true);
  };

  const hideTooltip = () => {
    timerRef.current = setTimeout(() => setIsVisible(false), 300);
  };

  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  return (
    <div className="relative inline-block">
      <Info
        className="h-3 w-3 ml-2 text-zinc-400 cursor-help inline-block"
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
      />
      {isVisible && (
        <div
          ref={tooltipRef}
          className="absolute z-10 w-64 p-2 mt-2 text-sm text-white bg-black rounded-md shadow-lg"
          style={{ top: "100%", left: "100%", transform: "translateY(-100%)" }}
          onMouseEnter={showTooltip}
          onMouseLeave={hideTooltip}
        >
          {content}
        </div>
      )}
    </div>
  );
}
