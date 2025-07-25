import { ImageResponse } from "next/og"

export const runtime = "edge"

export const size = {
  width: 32,
  height: 32,
}

export const contentType = "image/png"

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        background: "linear-gradient(135deg, #fb923c 0%, #dc2626 50%, #ec4899 100%)",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "50%",
        border: "2px solid #f97316",
        position: "relative",
      }}
    >
      {/* 内层光泽效果 */}
      <div
        style={{
          position: "absolute",
          top: "4px",
          left: "4px",
          right: "4px",
          bottom: "4px",
          background: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4) 0%, transparent 50%)",
          borderRadius: "50%",
        }}
      />

      {/* 💸表情 */}
      <div
        style={{
          fontSize: "18px",
          textShadow: "0 1px 2px rgba(0,0,0,0.3)",
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
          bottom: "-2px",
          left: "2px",
          right: "2px",
          height: "4px",
          background: "rgba(0,0,0,0.2)",
          borderRadius: "50%",
          filter: "blur(2px)",
        }}
      />
    </div>,
    {
      ...size,
    },
  )
}
