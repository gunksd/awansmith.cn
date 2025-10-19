import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

async function checkAdminStatus() {
  try {
    console.log("正在检查admin账户状态...")

    const admins = await sql`
      SELECT id, username, created_at, updated_at 
      FROM admin_users
    `

    console.log("找到的管理员账户:")
    console.log(JSON.stringify(admins, null, 2))

    if (admins.length === 0) {
      console.log("警告: 没有找到任何管理员账户!")
    } else {
      console.log(`共找到 ${admins.length} 个管理员账户`)
    }
  } catch (error) {
    console.error("检查失败:", error)
  }
}

checkAdminStatus()
