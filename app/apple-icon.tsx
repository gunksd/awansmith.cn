import { ImageResponse } from "next/og"

export const runtime = "edge"

export const size = {
  width: 180,
  height: 180,
}

export const contentType = "image/png"

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        background: "linear-gradient(135deg, #fb923c 0%, #dc2626 50%, #ec4899 100%)",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "20%",
        border: "4px solid #f97316",
        position: "relative",
        boxShadow: "0 8px 32px rgba(249,115,22,0.3)",
      }}
    >
      {/* 外层发光效果 */}
      <div
        style={{
          position: "absolute",
          inset: "-8px",
          background: "radial-gradient(circle, rgba(249,115,22,0.3) 0%, transparent 70%)",
          borderRadius: "25%",
          filter: "blur(8px)",
        }}
      />

      {/* 内层光泽效果 */}
      <div
        style={{
          position: "absolute",
          top: "12px",
          left: "12px",
          right: "12px",
          bottom: "12px",
          background: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4) 0%, transparent 50%)",
          borderRadius: "15%",
        }}
      />

      {/* 💸表情 */}
      <div
        style={{
          fontSize: "80px",
          textShadow: "0 4px 8px rgba(0,0,0,0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        💸
      </div>

      {/* 底部阴影 */}
      <div
        style={{
          position: "absolute",
          bottom: "-4px",
          left: "8px",
          right: "8px",
          height: "12px",
          background: "rgba(0,0,0,0.2)",
          borderRadius: "50%",
          filter: "blur(6px)",
        }}
      />
    </div>,
    {
      ...size,
    },
  )
}
