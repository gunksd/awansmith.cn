import { NextResponse } from "next/server"

export async function POST() {
  try {
    console.log("处理退出登录请求")

    const response = NextResponse.json({
      success: true,
      message: "退出登录成功",
    })

    // 清除认证Cookie
    response.cookies.set("admin-token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0, // 立即过期
      path: "/",
    })

    console.log("退出登录成功")
    return response
  } catch (error) {
    console.error("退出登录API错误:", error)
    return NextResponse.json({ success: false, message: "服务器错误" }, { status: 500 })
  }
}
