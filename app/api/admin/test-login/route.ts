import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { sql } from "@/lib/database"

export async function GET() {
  try {
    console.log("🔍 开始测试管理员登录功能")

    // 测试数据库连接
    const result = await sql`SELECT id, username, password_hash FROM admin_users WHERE username = 'awan'`

    if (result.length === 0) {
      return NextResponse.json({
        error: "未找到用户 awan",
        success: false,
      })
    }

    const admin = result[0]
    console.log("找到用户:", admin.username)

    // 测试密码验证
    const testPassword = "awansmith123"
    const isValid = await bcrypt.compare(testPassword, admin.password_hash)

    console.log("密码验证结果:", isValid)

    return NextResponse.json({
      success: true,
      message: "测试完成",
      user: admin.username,
      passwordValid: isValid,
      hashLength: admin.password_hash.length,
      hashPrefix: admin.password_hash.substring(0, 10),
    })
  } catch (error) {
    console.error("测试失败:", error)
    return NextResponse.json({
      error: error.message,
      success: false,
    })
  }
}
