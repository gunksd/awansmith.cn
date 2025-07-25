import { ImageResponse } from "next/og"

// 苹果图标配置
export const size = {
  width: 180,
  height: 180,
}
export const contentType = "image/png"

// 生成旋转的比特币苹果图标
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
      {/* 外层发光效果 */}
      <div
        style={{
          width: "180px",
          height: "180px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(247,147,26,0.3) 0%, transparent 70%)",
          position: "absolute",
          animation: "pulse 2s ease-in-out infinite",
        }}
      />

      {/* 主要比特币图标 */}
      <div
        style={{
          width: "160px",
          height: "160px",
          borderRadius: "50%",
          background: "linear-gradient(135deg, #f7931a 0%, #ffb347 50%, #d4af37 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 8px 32px rgba(247,147,26,0.4), inset 0 2px 8px rgba(255,255,255,0.3)",
          border: "4px solid #d4af37",
          position: "relative",
          animation: "rotate 4s linear infinite",
        }}
      >
        {/* 内层光泽效果 */}
        <div
          style={{
            position: "absolute",
            top: "20px",
            left: "20px",
            width: "60px",
            height: "30px",
            background: "linear-gradient(135deg, rgba(255,255,255,0.6) 0%, transparent 100%)",
            borderRadius: "50%",
            filter: "blur(8px)",
          }}
        />

        {/* 比特币符号 */}
        <div
          style={{
            fontSize: "80px",
            fontWeight: "bold",
            color: "white",
            textShadow: "0 4px 8px rgba(0,0,0,0.5), 0 2px 4px rgba(0,0,0,0.3)",
            fontFamily: "Arial, sans-serif",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          ₿
        </div>
      </div>

      {/* CSS动画定义 */}
      <style>
        {`
          @keyframes rotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes pulse {
            0%, 100% { opacity: 0.5; transform: scale(1); }
            50% { opacity: 0.8; transform: scale(1.05); }
          }
        `}
      </style>
    </div>,
    {
      ...size,
    },
  )
}
