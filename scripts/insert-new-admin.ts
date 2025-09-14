import bcrypt from "bcryptjs"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

async function insertAdmin() {
  try {
    console.log("开始创建管理员账户...")

    // 生成密码哈希
    const password = "awansmith123"
    const saltRounds = 12
    const passwordHash = await bcrypt.hash(password, saltRounds)

    console.log("密码哈希生成完成:", passwordHash)

    // 插入管理员账户
    const result = await sql`
      INSERT INTO admin_users (username, password_hash, created_at, updated_at)
      VALUES ('awan', ${passwordHash}, NOW(), NOW())
      ON CONFLICT (username) DO UPDATE SET
        password_hash = ${passwordHash},
        updated_at = NOW()
      RETURNING id, username, created_at
    `

    console.log("管理员账户创建成功:", result[0])

    // 验证插入结果
    const verification = await sql`
      SELECT id, username, password_hash, created_at 
      FROM admin_users 
      WHERE username = 'awan'
    `

    console.log("验证结果:", {
      id: verification[0].id,
      username: verification[0].username,
      hashLength: verification[0].password_hash.length,
      hashPrefix: verification[0].password_hash.substring(0, 10),
      created_at: verification[0].created_at,
    })

    // 测试密码验证
    const isValid = await bcrypt.compare(password, verification[0].password_hash)
    console.log("密码验证测试:", isValid ? "成功" : "失败")
  } catch (error) {
    console.error("创建管理员账户失败:", error)
  }
}

insertAdmin()
