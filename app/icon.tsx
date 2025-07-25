import { ImageResponse } from "next/og"

// 图标配置
export const size = {
  width: 32,
  height: 32,
}
export const contentType = "image/png"

// 生成旋转的比特币图标
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
      {/* 外层旋转圆圈 */}
      <div
        style={{
          width: "32px",
          height: "32px",
          borderRadius: "50%",
          background: "linear-gradient(45deg, #f7931a, #ffb347)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          border: "2px solid #d4af37",
          animation: "spin 3s linear infinite",
        }}
      >
        {/* 比特币符号 */}
        <div
          style={{
            fontSize: "18px",
            fontWeight: "bold",
            color: "white",
            textShadow: "0 1px 2px rgba(0,0,0,0.5)",
            fontFamily: "Arial, sans-serif",
          }}
        >
          ₿
        </div>
      </div>

      {/* CSS动画定义 */}
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>,
    {
      ...size,
    },
  )
}
