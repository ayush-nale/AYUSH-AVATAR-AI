import React from "react";

export default function Hero() {
  return (
    <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", display: "flex", flexDirection: "column", zIndex: 1, pointerEvents: "none" }}>
      

      
      {/* Foreground Hero Text - Top Left */}
      <div style={{ position: "absolute", top: "15%", left: "6%", zIndex: 2 }}>
        <h2 className="font-heading" style={{ fontSize: "32px", fontWeight: 400, color: "var(--text)", margin: "0 0 -4px 0", letterSpacing: "1px" }}>
          Good Evening,
        </h2>

        <p style={{ fontSize: "18px", color: "var(--muted)", margin: "8px 0 0 4px", letterSpacing: "0.5px" }}>
          Same mind. New possibilities.
        </p>
      </div>


      
    </div>
  );
}
