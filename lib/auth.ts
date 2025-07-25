import jwt from "jsonwebtoken"
import type { NextRequest } from "next/server"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123"

// 验证管理员密码
export function verifyAdminPassword(password: string): boolean {
  return password === ADMIN_PASSWORD
}

// 生成JWT令牌
export function generateToken(payload: any): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" })
}

// 验证JWT令牌
export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}

// 从请求中验证认证信息
export async function verifyAuth(request: NextRequest): Promise<{
  success: boolean
  user?: any
  error?: string
}> {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return { success: false, error: "缺少认证令牌" }
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)

    if (!decoded) {
      return { success: false, error: "无效的认证令牌" }
    }

    return { success: true, user: decoded }
  } catch (error) {
    console.error("认证验证失败:", error)
    return { success: false, error: "认证验证失败" }
  }
}
