import bcrypt from "bcryptjs"
import { sql } from "@/lib/database"

async function resetAdminPassword() {
  try {
    console.log("开始重置管理员密码...")

    // 生成新的密码哈希
    const password = "awansmith123"
    const saltRounds = 12
    const newPasswordHash = await bcrypt.hash(password, saltRounds)

    console.log("新密码哈希:", newPasswordHash)

    // 更新数据库中的密码哈希
    const result = await sql`
      UPDATE admin_users 
      SET password_hash = ${newPasswordHash}
      WHERE username = 'awan'
    `

    console.log("密码更新结果:", result)

    // 验证新密码哈希
    const isValid = await bcrypt.compare(password, newPasswordHash)
    console.log("新密码哈希验证:", isValid)

    console.log("管理员密码重置完成！")
    console.log("用户名: awan")
    console.log("密码: awansmith123")
  } catch (error) {
    console.error("重置密码失败:", error)
  }
}

resetAdminPassword()
