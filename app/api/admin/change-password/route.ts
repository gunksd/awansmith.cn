import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verify, sign } from "jsonwebtoken"
import bcrypt from "bcryptjs"
import { query } from "@/lib/database"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function POST(request: NextRequest) {
  try {
    // 验证用户是否已登录
    const cookieStore = await cookies()
    const token = cookieStore.get("admin-token")?.value

    if (!token) {
      return NextResponse.json({ error: "未登录" }, { status: 401 })
    }

    let decoded: any
    try {
      decoded = verify(token, JWT_SECRET)
    } catch {
      return NextResponse.json({ error: "登录已过期" }, { status: 401 })
    }

    const { currentPassword, newPassword, newUsername } = await request.json()

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "当前密码和新密码不能为空" }, { status: 400 })
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: "新密码至少需要6个字符" }, { status: 400 })
    }

    // 获取当前用户信息
    const userResult = await query("SELECT id, username, password_hash FROM admin_users WHERE id = $1", [decoded.id])

    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: "用户不存在" }, { status: 404 })
    }

    const currentUser = userResult.rows[0]

    // 验证当前密码
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, currentUser.password_hash)

    if (!isCurrentPasswordValid) {
      return NextResponse.json({ error: "当前密码错误" }, { status: 400 })
    }

    // 如果要修改用户名，检查是否已存在
    if (newUsername && newUsername !== currentUser.username) {
      const existingUserResult = await query("SELECT id FROM admin_users WHERE username = $1 AND id != $2", [
        newUsername,
        decoded.id,
      ])

      if (existingUserResult.rows.length > 0) {
        return NextResponse.json({ error: "用户名已存在" }, { status: 400 })
      }
    }

    // 生成新密码哈希
    const newPasswordHash = await bcrypt.hash(newPassword, 12)

    // 更新数据库
    const updateUsername = newUsername || currentUser.username
    await query(
      "UPDATE admin_users SET username = $1, password_hash = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3",
      [updateUsername, newPasswordHash, decoded.id],
    )

    // 如果用户名发生变化，需要重新生成token
    if (newUsername && newUsername !== currentUser.username) {
      const newToken = sign(
        {
          id: decoded.id,
          username: updateUsername,
        },
        JWT_SECRET,
        { expiresIn: "24h" },
      )

      // 更新cookie
      cookieStore.set("admin-token", newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 24 * 60 * 60, // 24小时
      })
    }

    return NextResponse.json({
      success: true,
      message: "密码修改成功",
      user: {
        id: decoded.id,
        username: updateUsername,
      },
    })
  } catch (error) {
    console.error("修改密码失败:", error)
    return NextResponse.json({ error: "修改失败，请重试" }, { status: 500 })
  }
}
