import { cookies } from "next/headers"
import { verify, sign } from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

/**
 * 检查用户是否已认证
 * @returns Promise<boolean> 认证状态
 */
export async function checkAuth(): Promise<boolean> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("admin-token")?.value

    if (!token) {
      return false
    }

    verify(token, JWT_SECRET)
    return true
  } catch (error) {
    return false
  }
}

/**
 * 验证JWT令牌
 * @param token JWT令牌
 * @returns 解码后的payload或null
 */
export function verifyToken(token: string): any | null {
  try {
    return verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}

/**
 * 验证用户认证状态（同步版本）
 * @param token JWT令牌
 * @returns boolean 认证状态
 */
export function verifyAuth(token: string): boolean {
  try {
    verify(token, JWT_SECRET)
    return true
  } catch (error) {
    return false
  }
}

/**
 * 生成JWT令牌
 * @param payload 要编码的数据
 * @param expiresIn 过期时间，默认24小时
 * @returns JWT令牌
 */
export function generateToken(payload: any, expiresIn = "24h"): string {
  return sign(payload, JWT_SECRET, { expiresIn })
}

/**
 * 从请求头中获取并验证令牌
 * @param authHeader Authorization头部
 * @returns 解码后的payload或null
 */
export function verifyAuthHeader(authHeader: string | null): any | null {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null
  }

  const token = authHeader.substring(7)
  return verifyToken(token)
}
