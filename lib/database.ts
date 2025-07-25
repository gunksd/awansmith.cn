import { neon } from "@neondatabase/serverless"

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set")
}

// 创建数据库连接
export const sql = neon(process.env.DATABASE_URL)

// 网站数据库接口
export interface DatabaseWebsite {
  id: number
  name: string
  description: string
  url: string
  tags: string[]
  custom_logo: string | null
  section: string
  created_at: string
  updated_at: string
}

// 获取所有网站
export async function getAllWebsites(): Promise<DatabaseWebsite[]> {
  try {
    const websites = await sql`
      SELECT 
        id,
        name,
        description,
        url,
        tags,
        custom_logo,
        section,
        created_at,
        updated_at
      FROM websites 
      ORDER BY section, created_at DESC
    `
    return websites as DatabaseWebsite[]
  } catch (error) {
    console.error("获取网站数据失败:", error)
    throw new Error("获取网站数据失败")
  }
}

// 根据分区获取网站
export async function getWebsitesBySection(section: string): Promise<DatabaseWebsite[]> {
  try {
    const websites = await sql`
      SELECT 
        id,
        name,
        description,
        url,
        tags,
        custom_logo,
        section,
        created_at,
        updated_at
      FROM websites 
      WHERE section = ${section}
      ORDER BY created_at DESC
    `
    return websites as DatabaseWebsite[]
  } catch (error) {
    console.error("获取分区网站数据失败:", error)
    throw new Error("获取分区网站数据失败")
  }
}

// 添加网站
export async function createWebsite(data: {
  name: string
  description: string
  url: string
  tags: string[]
  customLogo?: string
  section: string
}): Promise<DatabaseWebsite> {
  try {
    const result = await sql`
      INSERT INTO websites (name, description, url, tags, custom_logo, section)
      VALUES (
        ${data.name}, 
        ${data.description}, 
        ${data.url}, 
        ${data.tags}, 
        ${data.customLogo || null}, 
        ${data.section}
      )
      RETURNING *
    `
    return result[0] as DatabaseWebsite
  } catch (error) {
    console.error("创建网站失败:", error)
    throw new Error("创建网站失败")
  }
}

// 更新网站
export async function updateWebsite(
  id: number,
  data: {
    name?: string
    description?: string
    url?: string
    tags?: string[]
    customLogo?: string
    section?: string
  },
): Promise<DatabaseWebsite> {
  try {
    const result = await sql`
      UPDATE websites 
      SET 
        name = COALESCE(${data.name}, name),
        description = COALESCE(${data.description}, description),
        url = COALESCE(${data.url}, url),
        tags = COALESCE(${data.tags}, tags),
        custom_logo = COALESCE(${data.customLogo}, custom_logo),
        section = COALESCE(${data.section}, section),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `
    if (result.length === 0) {
      throw new Error("网站不存在")
    }
    return result[0] as DatabaseWebsite
  } catch (error) {
    console.error("更新网站失败:", error)
    throw new Error("更新网站失败")
  }
}

// 删除网站
export async function deleteWebsite(id: number): Promise<boolean> {
  try {
    const result = await sql`
      DELETE FROM websites WHERE id = ${id}
      RETURNING id
    `
    return result.length > 0
  } catch (error) {
    console.error("删除网站失败:", error)
    throw new Error("删除网站失败")
  }
}

// 获取网站统计
export async function getWebsiteStats(): Promise<{
  total: number
  bySection: { [key: string]: number }
}> {
  try {
    // 获取总数
    const totalStats = await sql`
      SELECT COUNT(*) as total FROM websites
    `

    // 获取按分区统计
    const sectionStats = await sql`
      SELECT 
        section,
        COUNT(*) as count
      FROM websites
      GROUP BY section
    `

    const bySection: { [key: string]: number } = {}
    sectionStats.forEach((stat: any) => {
      bySection[stat.section] = Number.parseInt(stat.count)
    })

    return {
      total: Number.parseInt(totalStats[0].total),
      bySection,
    }
  } catch (error) {
    console.error("获取网站统计失败:", error)
    throw new Error("获取网站统计失败")
  }
}
