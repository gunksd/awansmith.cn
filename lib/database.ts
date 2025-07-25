import { neon } from "@neondatabase/serverless"

// 获取数据库连接URL
const DATABASE_URL = process.env.DATABASE_URL || process.env.POSTGRES_URL

if (!DATABASE_URL) {
  throw new Error("数据库连接URL未配置")
}

// 创建数据库连接
export const sql = neon(DATABASE_URL)

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

// 分区数据库接口
export interface DatabaseSection {
  id: number
  key: string
  name: string
  description: string | null
  icon: string | null
  order_index: number
  created_at: string
  updated_at: string
}

/**
 * 获取所有网站
 */
export async function getAllWebsites(): Promise<DatabaseWebsite[]> {
  try {
    console.log("[DATABASE] 获取所有网站数据...")

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

    console.log(`[DATABASE] 成功获取 ${websites.length} 个网站`)
    return websites as DatabaseWebsite[]
  } catch (error) {
    console.error("[DATABASE] 获取网站数据失败:", error)
    throw new Error("获取网站数据失败")
  }
}

/**
 * 根据分区获取网站
 */
export async function getWebsitesBySection(section: string): Promise<DatabaseWebsite[]> {
  try {
    console.log(`[DATABASE] 获取分区 ${section} 的网站...`)
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
    console.log(`[DATABASE] 分区 ${section} 有 ${websites.length} 个网站`)
    return websites as DatabaseWebsite[]
  } catch (error) {
    console.error(`[DATABASE] 获取分区网站数据失败:`, error)
    throw new Error("获取分区网站数据失败")
  }
}

/**
 * 根据ID获取网站
 */
export async function getWebsiteById(id: number): Promise<DatabaseWebsite | null> {
  try {
    console.log(`[DATABASE] 获取网站详情: ${id}`)

    const result = await sql`
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
      WHERE id = ${id}
    `

    if (result.length === 0) {
      return null
    }

    console.log("[DATABASE] 成功获取网站详情")
    return result[0] as DatabaseWebsite
  } catch (error) {
    console.error("[DATABASE] 获取网站详情失败:", error)
    throw new Error("获取网站详情失败")
  }
}

/**
 * 创建网站
 */
export async function createWebsite(data: {
  name: string
  description: string
  url: string
  tags: string[]
  customLogo?: string
  section: string
}): Promise<DatabaseWebsite> {
  try {
    console.log("[DATABASE] 创建新网站:", data.name)

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

    console.log("[DATABASE] 网站创建成功")
    return result[0] as DatabaseWebsite
  } catch (error) {
    console.error("[DATABASE] 创建网站失败:", error)
    throw new Error("创建网站失败")
  }
}

/**
 * 更新网站
 */
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
    console.log(`[DATABASE] 更新网站: ${id}`)

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

    console.log("[DATABASE] 网站更新成功")
    return result[0] as DatabaseWebsite
  } catch (error) {
    console.error("[DATABASE] 更新网站失败:", error)
    throw new Error("更新网站失败")
  }
}

/**
 * 删除网站
 */
export async function deleteWebsite(id: number): Promise<boolean> {
  try {
    console.log(`[DATABASE] 删除网站: ${id}`)

    const result = await sql`
      DELETE FROM websites 
      WHERE id = ${id}
      RETURNING id
    `

    console.log("[DATABASE] 网站删除成功")
    return result.length > 0
  } catch (error) {
    console.error("[DATABASE] 删除网站失败:", error)
    throw new Error("删除网站失败")
  }
}

/**
 * 获取所有分区
 */
export async function getAllSections(): Promise<DatabaseSection[]> {
  try {
    console.log("[DATABASE] 获取所有分区数据...")

    const sections = await sql`
      SELECT 
        id,
        key,
        name,
        description,
        icon,
        order_index,
        created_at,
        updated_at
      FROM sections 
      ORDER BY order_index ASC, created_at ASC
    `

    console.log(`[DATABASE] 成功获取 ${sections.length} 个分区`)
    return sections as DatabaseSection[]
  } catch (error) {
    console.error("[DATABASE] 获取分区数据失败:", error)
    throw new Error("获取分区数据失败")
  }
}

/**
 * 根据key获取分区
 */
export async function getSectionByKey(key: string): Promise<DatabaseSection | null> {
  try {
    console.log(`[DATABASE] 获取分区: ${key}`)

    const result = await sql`
      SELECT 
        id,
        key,
        name,
        description,
        icon,
        order_index,
        created_at,
        updated_at
      FROM sections 
      WHERE key = ${key}
    `

    return result.length > 0 ? (result[0] as DatabaseSection) : null
  } catch (error) {
    console.error("[DATABASE] 获取分区失败:", error)
    throw new Error("获取分区失败")
  }
}

/**
 * 根据ID获取分区
 */
export async function getSectionById(id: number): Promise<DatabaseSection | null> {
  try {
    console.log(`[DATABASE] 获取分区详情: ${id}`)

    const result = await sql`
      SELECT 
        id,
        key,
        name,
        description,
        icon,
        order_index,
        created_at,
        updated_at
      FROM sections 
      WHERE id = ${id}
    `

    return result.length > 0 ? (result[0] as DatabaseSection) : null
  } catch (error) {
    console.error("[DATABASE] 获取分区详情失败:", error)
    throw new Error("获取分区详情失败")
  }
}

/**
 * 创建分区
 */
export async function createSection(data: {
  key: string
  name: string
  description?: string
  icon?: string
  orderIndex?: number
}): Promise<DatabaseSection> {
  try {
    console.log("[DATABASE] 创建新分区:", data.name)

    const result = await sql`
      INSERT INTO sections (key, name, description, icon, order_index)
      VALUES (
        ${data.key},
        ${data.name},
        ${data.description || null},
        ${data.icon || null},
        ${data.orderIndex || 0}
      )
      RETURNING *
    `

    console.log("[DATABASE] 分区创建成功")
    return result[0] as DatabaseSection
  } catch (error) {
    console.error("[DATABASE] 创建分区失败:", error)
    throw new Error("创建分区失败")
  }
}

/**
 * 更新分区
 */
export async function updateSection(
  id: number,
  data: {
    key?: string
    name?: string
    description?: string
    icon?: string
    orderIndex?: number
  },
): Promise<DatabaseSection> {
  try {
    console.log(`[DATABASE] 更新分区: ${id}`)

    const result = await sql`
      UPDATE sections 
      SET 
        key = COALESCE(${data.key}, key),
        name = COALESCE(${data.name}, name),
        description = COALESCE(${data.description}, description),
        icon = COALESCE(${data.icon}, icon),
        order_index = COALESCE(${data.orderIndex}, order_index),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `

    if (result.length === 0) {
      throw new Error("分区不存在")
    }

    console.log("[DATABASE] 分区更新成功")
    return result[0] as DatabaseSection
  } catch (error) {
    console.error("[DATABASE] 更新分区失败:", error)
    throw new Error("更新分区失败")
  }
}

/**
 * 删除分区
 */
export async function deleteSection(id: number): Promise<boolean> {
  try {
    console.log(`[DATABASE] 删除分区: ${id}`)

    // 检查是否有网站使用此分区
    const websitesInSection = await sql`
      SELECT COUNT(*) as count FROM websites WHERE section = (
        SELECT key FROM sections WHERE id = ${id}
      )
    `

    if (Number.parseInt(websitesInSection[0].count) > 0) {
      throw new Error("无法删除：该分区下还有网站")
    }

    const result = await sql`
      DELETE FROM sections WHERE id = ${id}
      RETURNING id
    `

    console.log("[DATABASE] 分区删除成功")
    return result.length > 0
  } catch (error) {
    console.error("[DATABASE] 删除分区失败:", error)
    throw new Error("删除分区失败")
  }
}

/**
 * 获取网站统计
 */
export async function getWebsiteStats(): Promise<{
  total: number
  bySection: { [key: string]: number }
}> {
  try {
    console.log("[DATABASE] 获取网站统计数据...")

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

    const stats = {
      total: Number.parseInt(totalStats[0].total),
      bySection,
    }

    console.log("[DATABASE] 网站统计:", stats)
    return stats
  } catch (error) {
    console.error("[DATABASE] 获取网站统计失败:", error)
    throw new Error("获取网站统计失败")
  }
}

/**
 * 获取分区统计
 */
export async function getSectionStats(): Promise<{
  total: number
  withWebsites: number
  empty: number
}> {
  try {
    console.log("[DATABASE] 获取分区统计数据...")

    const totalStats = await sql`
      SELECT COUNT(*) as total FROM sections
    `

    const withWebsitesStats = await sql`
      SELECT COUNT(DISTINCT s.id) as count
      FROM sections s
      INNER JOIN websites w ON s.key = w.section
    `

    const total = Number.parseInt(totalStats[0].total)
    const withWebsites = Number.parseInt(withWebsitesStats[0].count)

    const stats = {
      total,
      withWebsites,
      empty: total - withWebsites,
    }

    console.log("[DATABASE] 分区统计:", stats)
    return stats
  } catch (error) {
    console.error("[DATABASE] 获取分区统计失败:", error)
    throw new Error("获取分区统计失败")
  }
}
