import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { sql } from "@/lib/database"

export async function GET() {
  try {
    const password = "awansmith123"

    // 生成新的哈希
    const newHash = await bcrypt.hash(password, 12)

    // 验证新哈希
    const isNewHashValid = await bcrypt.compare(password, newHash)

    // 测试当前数据库中的哈希
    const currentResult = await sql`SELECT password_hash FROM admin_users WHERE username = 'awan'`
    const currentHash = currentResult[0]?.password_hash
    const isCurrentHashValid = await bcrypt.compare(password, currentHash)

    // 更新数据库
    await sql`UPDATE admin_users SET password_hash = ${newHash} WHERE username = 'awan'`

    // 验证更新后的结果
    const updatedResult = await sql`SELECT password_hash FROM admin_users WHERE username = 'awan'`
    const updatedHash = updatedResult[0]?.password_hash
    const isUpdatedHashValid = await bcrypt.compare(password, updatedHash)

    return NextResponse.json({
      success: true,
      password: password,
      currentHash: currentHash,
      currentHashValid: isCurrentHashValid,
      newHash: newHash,
      newHashValid: isNewHashValid,
      updatedHash: updatedHash,
      updatedHashValid: isUpdatedHashValid,
      message: "密码哈希已更新",
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: "生成哈希失败",
        details: String(error),
      },
      { status: 500 },
    )
  }
}
