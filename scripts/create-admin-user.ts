import { sql } from "../lib/database"
import bcrypt from "bcryptjs"

async function createAdminUser() {
  try {
    console.log("开始创建管理员账户...")

    // 检查是否已存在管理员账户
    const existingAdmin = await sql`SELECT id FROM admin_users WHERE username = 'admin'`

    if (existingAdmin.length > 0) {
      console.log("管理员账户已存在")
      return
    }

    // 创建密码哈希
    const password = "admin123"
    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)

    // 插入管理员账户
    await sql`
      INSERT INTO admin_users (username, password_hash, created_at)
      VALUES ('admin', ${passwordHash}, NOW())
    `

    console.log("管理员账户创建成功！")
    console.log("用户名: admin")
    console.log("密码: admin123")
  } catch (error) {
    console.error("创建管理员账户失败:", error)
  }
}

createAdminUser()
