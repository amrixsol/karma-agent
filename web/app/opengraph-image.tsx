import { ImageResponse } from "next/og";

export const dynamic = "force-static";
export const alt = "Karma Card — The credit card built for agents";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "white",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
        }}
      >
        {/* Purple glow */}
        <div
          style={{
            position: "absolute",
            top: -100,
            left: "50%",
            transform: "translateX(-50%)",
            width: 600,
            height: 400,
            borderRadius: "50%",
            background: "rgba(133, 46, 239, 0.08)",
            filter: "blur(80px)",
          }}
        />

        {/* Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            position: "relative",
          }}
        >
          <div
            style={{
              fontSize: 64,
              fontWeight: 500,
              color: "#111",
              lineHeight: 1.1,
              textAlign: "center",
              letterSpacing: "-0.02em",
            }}
          >
            The credit card
          </div>
          <div
            style={{
              fontSize: 64,
              fontWeight: 500,
              lineHeight: 1.1,
              textAlign: "center",
              letterSpacing: "-0.02em",
              background: "linear-gradient(to right, #852EEF, #C157FD)",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            built for agents
          </div>
          <div
            style={{
              fontSize: 20,
              color: "rgba(0,0,0,0.45)",
              marginTop: 24,
              textAlign: "center",
            }}
          >
            Fund with USDC on Solana. Accepted at 150M+ merchants.
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginTop: 32,
              fontSize: 14,
              color: "rgba(0,0,0,0.3)",
            }}
          >
            Powered by Solana &bull; Circle &bull; Visa
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
