import { ImageResponse } from "next/og"

// 图标配置
export const size = {
  width: 32,
  height: 32,
}
export const contentType = "image/png"

// 生成旋转的💸图标
export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        fontSize: 24,
        background: "linear-gradient(135deg, #fb923c 0%, #dc2626 100%)",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        borderRadius: "50%",
        border: "2px solid #f97316",
        boxShadow: "0 0 20px rgba(251, 146, 60, 0.5)",
      }}
    >
      {/* 旋转背景效果 */}
      <div
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          background: "conic-gradient(from 0deg, transparent, rgba(255,255,255,0.2), transparent)",
          borderRadius: "50%",
          animation: "spin 3s linear infinite",
        }}
      />

      {/* 💸表情 */}
      <div
        style={{
          fontSize: "18px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textShadow: "0 1px 2px rgba(0,0,0,0.3)",
          animation: "counter-spin 3s linear infinite",
          zIndex: 1,
        }}
      >
        💸
      </div>

      {/* 内层光泽 */}
      <div
        style={{
          position: "absolute",
          top: "20%",
          left: "20%",
          width: "60%",
          height: "60%",
          background: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4), transparent)",
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
        `}
      </style>
    </div>,
    {
      ...size,
    },
  )
}
