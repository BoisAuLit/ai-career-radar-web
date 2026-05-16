import { ImageResponse } from "next/og";

export const alt = "AI Career Radar — career intelligence for engineers pivoting to AI";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background:
            "linear-gradient(135deg, #0a0a0a 0%, #18181b 60%, #1e293b 100%)",
          color: "#fafafa",
          padding: "72px 80px",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              fontSize: 28,
              fontWeight: 500,
              color: "#a1a1aa",
              letterSpacing: 1,
              textTransform: "uppercase",
            }}
          >
            AI Career Radar
          </div>
          <div
            style={{
              fontSize: 76,
              fontWeight: 700,
              lineHeight: 1.05,
              maxWidth: 1000,
              letterSpacing: -1,
            }}
          >
            What AI companies actually hire for
          </div>
          <div
            style={{
              fontSize: 32,
              color: "#d4d4d8",
              maxWidth: 940,
              lineHeight: 1.3,
              marginTop: 16,
            }}
          >
            Evidence-grounded gap reports against 443 real AI engineering JDs.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 48,
            color: "#a1a1aa",
            fontSize: 22,
            fontFamily: "ui-monospace, monospace",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ color: "#fafafa", fontSize: 34, fontWeight: 700 }}>443</span>
            <span>real JDs</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ color: "#fafafa", fontSize: 34, fontWeight: 700 }}>8</span>
            <span>archetypes</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ color: "#fafafa", fontSize: 34, fontWeight: 700 }}>0.93 · 0.83 · 0.82</span>
            <span>grounded · specific · actionable (LLM-graded V1)</span>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
