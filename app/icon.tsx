import { ImageResponse } from "next/og"

// 图标配置
export const size = {
  width: 32,
  height: 32,
}
export const contentType = "image/png"

// 生成圆形图标
export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        fontSize: 24,
        background: "transparent",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
      }}
    >
      {/* 圆形背景 */}
      <div
        style={{
          width: "32px",
          height: "32px",
          borderRadius: "50%",
          background: "linear-gradient(45deg, #d4af37, #ffd700)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* 青蛙emoji作为fallback */}
        <div
          style={{
            fontSize: "18px",
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
