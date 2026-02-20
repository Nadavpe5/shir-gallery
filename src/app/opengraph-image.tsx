import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Shir Yadgar Photography – Premium client gallery";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(145deg, #1a1a1a 0%, #0a0a0a 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            width: 110,
            height: 110,
            borderRadius: "50%",
            border: "2.5px solid rgba(255,255,255,0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 36,
          }}
        >
          <svg
            width="44"
            height="44"
            viewBox="0 0 24 24"
            fill="none"
            stroke="rgba(255,255,255,0.85)"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14.5 4h-5L7 7H4a2 2 0 00-2 2v9a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2h-3l-2.5-3z" />
            <circle cx="12" cy="13" r="3" />
          </svg>
        </div>

        <div
          style={{
            fontSize: 52,
            fontWeight: 300,
            color: "#ffffff",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            marginBottom: 14,
          }}
        >
          Shir Yadgar
        </div>

        <div
          style={{
            fontSize: 18,
            fontWeight: 300,
            color: "rgba(255,255,255,0.55)",
            letterSpacing: "0.25em",
            textTransform: "uppercase",
          }}
        >
          Photography
        </div>
      </div>
    ),
    { ...size }
  );
}
