// 生成正确的密码哈希并插入数据库
import bcrypt from "bcryptjs"
import { sql } from "@/lib/database"

async function generateAndInsertAdmin() {
  try {
    console.log("开始生成管理员账户...")

    const username = "awan"
    const password = "awansmith123"

    // 生成新的密码哈希
    console.log("正在生成密码哈希...")
    const saltRounds = 12
    const passwordHash = await bcrypt.hash(password, saltRounds)

    console.log("生成的密码哈希:", passwordHash)
    console.log("哈希长度:", passwordHash.length)

    // 验证哈希是否正确
    const isValid = await bcrypt.compare(password, passwordHash)
    console.log("哈希验证结果:", isValid)

    if (!isValid) {
      throw new Error("生成的哈希验证失败")
    }

    // 删除现有账户并插入新账户
    console.log("删除现有管理员账户...")
    await sql`DELETE FROM admin_users WHERE username = ${username}`

    console.log("插入新的管理员账户...")
    const result = await sql`
      INSERT INTO admin_users (username, password_hash, created_at, updated_at)
      VALUES (${username}, ${passwordHash}, NOW(), NOW())
      RETURNING id, username
    `

    console.log("管理员账户创建成功:", result[0])

    // 最终验证
    console.log("进行最终验证...")
    const verification = await sql`
      SELECT id, username, password_hash 
      FROM admin_users 
      WHERE username = ${username}
    `

    if (verification.length > 0) {
      const finalCheck = await bcrypt.compare(password, verification[0].password_hash)
      console.log("最终验证结果:", finalCheck)

      if (finalCheck) {
        console.log("✅ 管理员账户设置完成！")
        console.log("用户名:", username)
        console.log("密码:", password)
      } else {
        console.log("❌ 最终验证失败")
      }
    }
  } catch (error) {
    console.error("创建管理员账户失败:", error)
  }
}

generateAndInsertAdmin()
