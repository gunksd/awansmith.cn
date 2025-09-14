import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"

export async function GET() {
  const password = "awansmith123"
  const hashFromDB = "$2a$12$K8gF7Z9QXqJ5V3mN2pL8eOzKjH4wR6tY8sA1bC3dE5fG7hI9jK0lM"

  try {
    const isValid = await bcrypt.compare(password, hashFromDB)

    const correctHash = await bcrypt.hash(password, 12)

    return NextResponse.json({
      password: password,
      hashFromDB: hashFromDB,
      isValid: isValid,
      correctHash: correctHash,
      message: isValid ? "数据库哈希匹配" : "数据库哈希不匹配，需要更新",
    })
  } catch (error) {
    return NextResponse.json({
      error: "测试失败",
      details: error instanceof Error ? error.message : "未知错误",
    })
  }
}
