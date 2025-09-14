import bcrypt from "bcryptjs"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL)

async function generateAndUpdateHash() {
  try {
    console.log("🚀 开始生成正确的密码哈希...")

    const password = "awansmith123"
    const username = "awan"

    // 生成新的密码哈希
    console.log("🔐 正在生成密码哈希...")
    const newHash = await bcrypt.hash(password, 12)
    console.log("✅ 生成的新哈希:", newHash)

    // 验证新哈希是否正确
    console.log("🧪 验证新哈希...")
    const isValid = await bcrypt.compare(password, newHash)
    console.log("✅ 哈希验证结果:", isValid)

    if (!isValid) {
      throw new Error("生成的哈希验证失败！")
    }

    // 更新数据库
    console.log("📝 更新数据库中的密码哈希...")
    const result = await sql`
      UPDATE admin_users 
      SET password_hash = ${newHash}, updated_at = NOW()
      WHERE username = ${username}
    `

    console.log("✅ 数据库更新结果:", result)

    // 最终验证 - 从数据库读取并测试
    console.log("🔍 从数据库验证更新结果...")
    const users = await sql`
      SELECT id, username, password_hash 
      FROM admin_users 
      WHERE username = ${username}
    `

    if (users.length === 0) {
      throw new Error("用户不存在！")
    }

    const user = users[0]
    console.log("👤 数据库中的用户:", { id: user.id, username: user.username })
    console.log("🔐 数据库中的哈希:", user.password_hash)

    // 最终密码验证测试
    const finalTest = await bcrypt.compare(password, user.password_hash)
    console.log("🎯 最终密码验证测试:", finalTest)

    if (finalTest) {
      console.log("🎉 成功！现在可以使用以下凭据登录:")
      console.log("   用户名: awan")
      console.log("   密码: awansmith123")
    } else {
      throw new Error("最终验证失败！")
    }
  } catch (error) {
    console.error("❌ 错误:", error.message)
    throw error
  }
}

// 运行脚本
generateAndUpdateHash()
