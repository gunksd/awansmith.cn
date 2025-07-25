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
          background: "radial-gradient(circle, rgba(16,185,129,0.3) 0%, transparent 70%)",
          position: "absolute",
          animation: "pulse 2s ease-in-out infinite",
        }}
      />

      {/* 主要背景圆圈 */}
      <div
        style={{
          width: "160px",
          height: "160px",
          borderRadius: "50%",
          background: "linear-gradient(135deg, #10b981 0%, #34d399 50%, #059669 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 8px 32px rgba(16,185,129,0.4), inset 0 2px 8px rgba(255,255,255,0.3)",
          border: "4px solid #059669",
          position: "relative",
          animation: "rotate 3s linear infinite",
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

        {/* 💸表情 */}
        <div
          style={{
            fontSize: "100px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            animation: "counter-rotate 3s linear infinite",
          }}
        >
          💸
        </div>
      </div>

      {/* CSS动画定义 */}
      <style>
        {`
          @keyframes rotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes counter-rotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(-360deg); }
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
