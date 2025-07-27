import { cookies } from "next/headers"
import { verify } from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

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

export async function getCurrentUser(): Promise<{ id: number; username: string } | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("admin-token")?.value

    if (!token) {
      return null
    }

    const decoded = verify(token, JWT_SECRET) as any
    return {
      id: decoded.id,
      username: decoded.username,
    }
  } catch (error) {
    return null
  }
}
