import { NextResponse } from "next/server"
import { sql, healthCheck, getAllWebsites, getAllSections } from "@/lib/database"

export async function GET() {
  const results = {
    timestamp: new Date().toISOString(),
    tests: [] as any[],
  }

  // 测试1: 基础连接
  try {
    await sql`SELECT 1 as test`
    results.tests.push({
      name: "基础SQL连接",
      status: "成功",
      message: "数据库连接正常",
    })
  } catch (error: any) {
    results.tests.push({
      name: "基础SQL连接",
      status: "失败",
      error: error.message,
    })
  }

  // 测试2: 健康检查
  try {
    const healthy = await healthCheck()
    results.tests.push({
      name: "健康检查",
      status: healthy ? "成功" : "失败",
      message: healthy ? "数据库健康" : "数据库不健康",
    })
  } catch (error: any) {
    results.tests.push({
      name: "健康检查",
      status: "失败",
      error: error.message,
    })
  }

  // 测试3: 查询websites表
  try {
    const websites = await getAllWebsites()
    results.tests.push({
      name: "查询websites表",
      status: "成功",
      count: websites.length,
      message: `成功获取${websites.length}个网站`,
    })
  } catch (error: any) {
    results.tests.push({
      name: "查询websites表",
      status: "失败",
      error: error.message,
    })
  }

  // 测试4: 查询sections表
  try {
    const sections = await getAllSections()
    results.tests.push({
      name: "查询sections表",
      status: "成功",
      count: sections.length,
      message: `成功获取${sections.length}个分区`,
    })
  } catch (error: any) {
    results.tests.push({
      name: "查询sections表",
      status: "失败",
      error: error.message,
    })
  }

  // 测试5: 检查表结构
  try {
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `
    results.tests.push({
      name: "检查表结构",
      status: "成功",
      tables: tables.map((t: any) => t.table_name),
    })
  } catch (error: any) {
    results.tests.push({
      name: "检查表结构",
      status: "失败",
      error: error.message,
    })
  }

  const allSuccess = results.tests.every((t) => t.status === "成功")

  return NextResponse.json(
    {
      success: allSuccess,
      ...results,
    },
    { status: allSuccess ? 200 : 500 },
  )
}
