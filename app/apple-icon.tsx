import { ImageResponse } from "next/og"

// 图标配置
export const size = {
  width: 180,
  height: 180,
}
export const contentType = "image/png"

// 生成苹果设备的💸图标
export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        fontSize: 120,
        background: "linear-gradient(135deg, #fb923c 0%, #dc2626 50%, #ec4899 100%)",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        borderRadius: "50%",
        border: "4px solid #f97316",
        boxShadow: "0 0 40px rgba(251, 146, 60, 0.6)",
      }}
    >
      {/* 💸表情 */}
      <div
        style={{
          fontSize: "100px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textShadow: "0 2px 4px rgba(0,0,0,0.4)",
          zIndex: 1,
        }}
      >
        💸
      </div>

      {/* 内层光泽效果 */}
      <div
        style={{
          position: "absolute",
          top: "15%",
          left: "15%",
          width: "70%",
          height: "70%",
          background: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.5), transparent)",
          borderRadius: "50%",
        }}
      />

      {/* 底部阴影 */}
      <div
        style={{
          position: "absolute",
          bottom: "10%",
          left: "20%",
          width: "60%",
          height: "30%",
          background: "radial-gradient(ellipse, rgba(0,0,0,0.2), transparent)",
          borderRadius: "50%",
        }}
      />
    </div>,
    {
      ...size,
    },
  )
}
