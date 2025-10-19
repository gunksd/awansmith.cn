import { neon } from "@neondatabase/serverless"
import bcrypt from "bcryptjs"

const sql = neon(process.env.DATABASE_URL!)

async function debugLogin() {
  try {
    console.log("=== 开始调试登录问题 ===\n")

    // 1. 检查数据库连接
    console.log("1. 检查数据库连接...")
    const testQuery = await sql`SELECT NOW()`
    console.log("✓ 数据库连接正常\n")

    // 2. 查询admin账户
    console.log("2. 查询admin账户...")
    const result = await sql`SELECT id, username, password_hash FROM admin_users`

    if (result.length === 0) {
      console.log("✗ 没有找到任何admin账户！\n")
      return
    }

    console.log(`✓ 找到 ${result.length} 个admin账户:\n`)

    for (const admin of result) {
      console.log(`账户信息:`)
      console.log(`  - ID: ${admin.id}`)
      console.log(`  - 用户名: ${admin.username}`)
      console.log(`  - 密码哈希: ${admin.password_hash}\n`)

      // 3. 测试密码验证
      console.log(`3. 测试用户 "${admin.username}" 的密码验证...`)

      const testPasswords = ["awansmith123", "admin123", "123456"]

      for (const testPwd of testPasswords) {
        try {
          const isValid = await bcrypt.compare(testPwd, admin.password_hash)
          console.log(`  - 密码 "${testPwd}": ${isValid ? "✓ 正确" : "✗ 错误"}`)
        } catch (error) {
          console.log(`  - 密码 "${testPwd}": ✗ 验证出错 - ${error}`)
        }
      }
      console.log()
    }

    // 4. 生成新的正确哈希
    console.log("4. 生成新的密码哈希供参考:")
    const newHash = await bcrypt.hash("awansmith123", 10)
    console.log(`  awansmith123 的新哈希: ${newHash}\n`)

    console.log("=== 调试完成 ===")
  } catch (error) {
    console.error("调试过程中发生错误:", error)
  }
}

debugLogin()
