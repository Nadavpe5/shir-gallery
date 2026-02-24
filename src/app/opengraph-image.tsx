import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Shir Yadgar Photography – Premium client gallery";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage() {
  const ploniFont = await fetch(
    new URL("../../public/fonts/ploni/PloniRegular.otf", import.meta.url)
  ).then((res) => res.arrayBuffer());

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
          background: "linear-gradient(145deg, #ece3d7 0%, #d4c7b5 100%)",
          fontFamily: "Ploni",
        }}
      >
        <div
          style={{
            width: 120,
            height: 120,
            borderRadius: "50%",
            border: "2.5px solid #7c5a3a",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 36,
          }}
        >
          <svg
            width="52"
            height="52"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#7c5a3a"
            strokeWidth="1.2"
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
            fontWeight: 400,
            color: "#7c5a3a",
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
            color: "#7c5a3a",
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            opacity: 0.7,
          }}
        >
          Photography
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Ploni",
          data: ploniFont,
          style: "normal",
          weight: 400,
        },
      ],
    }
  );
}
