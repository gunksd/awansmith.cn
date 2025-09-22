import { NextResponse } from "next/server"
import { sql } from "@/lib/database"

export async function GET() {
  try {
    console.log("[v0] 开始测试数据库连接...")

    // 测试基本连接
    const connectionTest = await sql`SELECT 1 as test`
    console.log("[v0] 基本连接测试成功:", connectionTest)

    // 测试admin_users表是否存在
    const tableTest = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'admin_users'
    `
    console.log("[v0] admin_users表检查:", tableTest)

    // 查询所有管理员用户
    const adminUsers = await sql`SELECT id, username, password_hash FROM admin_users`
    console.log("[v0] 管理员用户数量:", adminUsers.length)

    if (adminUsers.length > 0) {
      console.log("[v0] 管理员用户列表:")
      adminUsers.forEach((user, index) => {
        console.log(
          `[v0] ${index + 1}. ID: ${user.id}, 用户名: ${user.username}, 密码哈希长度: ${user.password_hash?.length}`,
        )
      })
    }

    return NextResponse.json({
      success: true,
      message: "数据库连接测试成功",
      data: {
        connectionTest: connectionTest[0],
        tableExists: tableTest.length > 0,
        adminUsersCount: adminUsers.length,
        adminUsers: adminUsers.map((user) => ({
          id: user.id,
          username: user.username,
          hasPasswordHash: !!user.password_hash,
          passwordHashLength: user.password_hash?.length,
        })),
      },
    })
  } catch (error) {
    console.error("[v0] 数据库连接测试失败:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        message: "数据库连接测试失败",
      },
      { status: 500 },
    )
  }
}
