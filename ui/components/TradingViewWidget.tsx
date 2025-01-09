// TradingViewWidget.jsx
import React, { useEffect, useRef, memo } from "react";
import DecryptedText from "./DecryptedText";

function TradingViewWidget() {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = `
        {
          "autosize": true,
          "symbol": "BINANCE:ARBUSDT",
          "interval": "D",
          "timezone": "Etc/UTC",
          "theme": "dark",
          "style": "1",
          "locale": "en",
          "backgroundColor": "rgba(0, 0, 0, 1)",
          "gridColor": "rgba(0, 255, 255, 0.06)",
          "hide_top_toolbar": true,
          "allow_symbol_change": true,
          "save_image": false,
          "calendar": false,
          "hide_volume": true,
          "support_host": "https://www.tradingview.com"
        }`;
    if (container.current) {
      container.current.appendChild(script);
    }
  }, []);

  return (
    <div className="relative">
      <div
        className="tradingview-widget-container blur-sm"
        ref={container}
        style={{ height: "100%", width: "100%" }}
      >
        <div
          className="tradingview-widget-container__widget"
          style={{ height: "calc(100% - 32px)", width: "100%" }}
        ></div>
      </div>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <DecryptedText animateOn="hover" text="Trading Coming Soon!" className="opacity-90" />
      </div>
    </div>
  );
}

export default memo(TradingViewWidget);
