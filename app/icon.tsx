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
        background: "transparent",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
      }}
    >
      {/* 外层旋转圆圈背景 */}
      <div
        style={{
          width: "32px",
          height: "32px",
          borderRadius: "50%",
          background: "linear-gradient(45deg, #10b981, #34d399)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          border: "2px solid #059669",
          animation: "spin 2s linear infinite",
          boxShadow: "0 2px 8px rgba(16, 185, 129, 0.3)",
        }}
      >
        {/* 💸表情 */}
        <div
          style={{
            fontSize: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            animation: "counter-spin 2s linear infinite",
          }}
        >
          💸
        </div>
      </div>

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
