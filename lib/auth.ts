import jwt from "jsonwebtoken"
import { cookies } from "next/headers"

// JWT密钥
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

// 管理员密码
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "awansmith123"

/**
 * 验证管理员密码
 */
export function verifyAdminPassword(password: string): boolean {
  return password === ADMIN_PASSWORD
}

/**
 * 生成JWT令牌
 */
export function generateToken(payload: any): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" })
}

/**
 * 验证JWT令牌
 */
export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    console.error("JWT验证失败:", error)
    return null
  }
}

/**
 * 服务器端认证检查
 */
export async function verifyAuth(): Promise<boolean> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("admin-token")?.value

    if (!token) {
      console.log("[AUTH] 未找到认证令牌")
      return false
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      console.log("[AUTH] 令牌验证失败")
      return false
    }

    console.log("[AUTH] 认证成功")
    return true
  } catch (error) {
    console.error("[AUTH] 认证检查失败:", error)
    return false
  }
}

/**
 * 客户端认证检查
 */
export function checkClientAuth(): boolean {
  if (typeof window === "undefined") return false

  try {
    const token = localStorage.getItem("admin-token")
    if (!token) {
      console.log("[AUTH] 客户端未找到认证令牌")
      return false
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      console.log("[AUTH] 客户端令牌验证失败")
      localStorage.removeItem("admin-token")
      return false
    }

    console.log("[AUTH] 客户端认证成功")
    return true
  } catch (error) {
    console.error("[AUTH] 客户端认证检查失败:", error)
    return false
  }
}
