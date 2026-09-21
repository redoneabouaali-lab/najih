import { ImageResponse } from "next/og";
import { SITE_URL } from "@/lib/seo";

export const alt = "ناجح | Najih — Préparation Bac Maroc";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

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
          background: "linear-gradient(135deg, #4f46e5 0%, #0ea5e9 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`${SITE_URL}/img/logo.png`}
          alt=""
          width={150}
          height={150}
          style={{ borderRadius: 34, marginBottom: 30, boxShadow: "0 18px 50px rgba(0,0,0,.28)" }}
        />
        <div style={{ fontSize: 110, fontWeight: 800, display: "flex", letterSpacing: "-0.02em" }}>
          NAJIH<span style={{ color: "#bae6fd" }}>.bac</span>
        </div>
        <div style={{ fontSize: 42, marginTop: 24, letterSpacing: "0.12em" }}>
          Préparation au BAC MAROC
        </div>
        <div style={{ fontSize: 28, marginTop: 18, opacity: 0.9 }}>
          Examens nationaux · Cours · Quiz · Tuteur IA — 100% gratuit
        </div>
      </div>
    ),
    size,
  );
}