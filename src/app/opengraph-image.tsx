import { ImageResponse } from "next/og";
import { SITE_URL } from "@/lib/seo";

export const alt = "ناجح | Najih — Préparation Bac Maroc";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Social card follows docs/DESIGN-LOCK.md: flat canvas, hairline frame, ink
 * typography with a single brand accent. No gradients, no glow.
 */
export default function OpengraphImage() {
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
          background: "#f7f7f5",
          border: "24px solid #ffffff",
          outline: "1px solid #e4e4e0",
          color: "#15181c",
          fontFamily: "sans-serif",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`${SITE_URL}/img/logo.png`}
          alt=""
          width={132}
          height={132}
          style={{ borderRadius: 28, marginBottom: 28 }}
        />
        <div
          style={{
            fontSize: 104,
            fontWeight: 800,
            display: "flex",
            letterSpacing: "-0.02em",
            color: "#15181c",
          }}
        >
          NAJIH<span style={{ color: "#1b3a63" }}>.bac</span>
        </div>
        <div
          style={{
            height: 1,
            width: 180,
            background: "#cdcdc7",
            margin: "30px 0 26px",
          }}
        />
        <div style={{ fontSize: 40, letterSpacing: "0.14em", color: "#3b424a" }}>
          Préparation au BAC MAROC
        </div>
        <div style={{ fontSize: 27, marginTop: 20, color: "#6b7280" }}>
          Examens nationaux · Cours · Quiz · Tuteur IA — 100% gratuit
        </div>
      </div>
    ),
    size,
  );
}
