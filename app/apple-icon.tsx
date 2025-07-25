import { ImageResponse } from "next/og"

// 苹果图标配置
export const size = {
  width: 180,
  height: 180,
}
export const contentType = "image/png"

// 生成旋转的💸苹果图标
export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        fontSize: 48,
        background: "linear-gradient(135deg, #fb923c 0%, #dc2626 50%, #be185d 100%)",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        borderRadius: "20%",
        border: "4px solid #f97316",
        boxShadow: "0 0 40px rgba(251, 146, 60, 0.6), inset 0 0 20px rgba(255,255,255,0.1)",
      }}
    >
      {/* 外层发光效果 */}
      <div
        style={{
          position: "absolute",
          width: "120%",
          height: "120%",
          background: "radial-gradient(circle, rgba(251, 146, 60, 0.3) 0%, transparent 70%)",
          borderRadius: "50%",
          animation: "pulse 2s ease-in-out infinite",
        }}
      />

      {/* 旋转背景效果 */}
      <div
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          background:
            "conic-gradient(from 0deg, transparent, rgba(255,255,255,0.3), transparent, rgba(255,255,255,0.1), transparent)",
          borderRadius: "20%",
          animation: "spin 3s linear infinite",
        }}
      />

      {/* 💸表情 */}
      <div
        style={{
          fontSize: "80px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textShadow: "0 4px 8px rgba(0,0,0,0.3)",
          animation: "counter-spin 3s linear infinite",
          zIndex: 2,
        }}
      >
        💸
      </div>

      {/* 内层光泽 */}
      <div
        style={{
          position: "absolute",
          top: "15%",
          left: "15%",
          width: "70%",
          height: "70%",
          background:
            "radial-gradient(ellipse at 30% 30%, rgba(255,255,255,0.4), rgba(255,255,255,0.1) 50%, transparent)",
          borderRadius: "20%",
          zIndex: 1,
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

      {/* CSS动画定义 */}
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes counter-spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(-360deg); }
          }
          @keyframes pulse {
            0%, 100% { opacity: 0.6; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.05); }
          }
        `}
      </style>
    </div>,
    {
      ...size,
    },
  )
}
