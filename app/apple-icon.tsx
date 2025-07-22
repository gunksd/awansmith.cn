import { ImageResponse } from "next/og"

// 苹果图标配置
export const size = {
  width: 180,
  height: 180,
}
export const contentType = "image/png"

// 生成圆形苹果图标
export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        fontSize: 48,
        background: "transparent",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* 圆形背景 */}
      <div
        style={{
          width: "180px",
          height: "180px",
          borderRadius: "50%",
          background: "linear-gradient(45deg, #d4af37, #ffd700)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
        }}
      >
        {/* 青蛙emoji */}
        <div
          style={{
            fontSize: "80px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          🐸
        </div>
      </div>
    </div>,
    {
      ...size,
    },
  )
}
