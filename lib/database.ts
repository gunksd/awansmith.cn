import { neon } from "@neondatabase/serverless"
import type { Section, Website, Admin } from "./types"

// 创建数据库连接
const sql = neon(process.env.DATABASE_URL!)

// 导出query函数以兼容旧代码
export const query = sql

// 测试数据库连接
export async function testConnection() {
  try {
    const result = await sql`SELECT NOW() as current_time`
    console.log("数据库连接成功:", result[0])
    return true
  } catch (error) {
    console.error("数据库连接失败:", error)
    return false
  }
}

// 获取数据库版本信息
export async function getDatabaseVersion() {
  try {
    const result = await sql`SELECT version()`
    return result[0].version
  } catch (error) {
    console.error("获取数据库版本失败:", error)
    throw error
  }
}

// ==================== 分区相关操作 ====================

// 获取所有分区
export async function getSections(): Promise<Section[]> {
  try {
    const result = await sql`
      SELECT 
        id,
        key,
        title,
        icon,
        sort_order as "sortOrder",
        is_active as "isActive"
      FROM sections 
      WHERE is_active = true 
      ORDER BY sort_order ASC, id ASC
    `
    return result as Section[]
  } catch (error) {
    console.error("获取分区失败:", error)
    throw error
  }
}

// 兼容旧函数名
export async function getAllSections(): Promise<Section[]> {
  return getSections()
}

// 根据key获取分区
export async function getSectionByKey(key: string): Promise<Section | null> {
  try {
    const result = await sql`
      SELECT 
        id,
        key,
        title,
        icon,
        sort_order as "sortOrder",
        is_active as "isActive"
      FROM sections 
      WHERE key = ${key} AND is_active = true
    `
    return (result[0] as Section) || null
  } catch (error) {
    console.error("获取分区失败:", error)
    throw error
  }
}

// 创建分区
export async function createSection(data: {
  key: string
  title: string
  icon?: string
  sortOrder?: number
}): Promise<Section> {
  try {
    const result = await sql`
      INSERT INTO sections (key, title, icon, sort_order, is_active)
      VALUES (
        ${data.key},
        ${data.title},
        ${data.icon || "📁"},
        ${data.sortOrder || 0},
        true
      )
      RETURNING 
        id,
        key,
        title,
        icon,
        sort_order as "sortOrder",
        is_active as "isActive"
    `
    return result[0] as Section
  } catch (error) {
    console.error("创建分区失败:", error)
    throw error
  }
}

// 更新分区
export async function updateSection(
  id: number,
  data: {
    key?: string
    title?: string
    icon?: string
    sortOrder?: number
    isActive?: boolean
  },
): Promise<Section> {
  try {
    const updates = []
    const values = []

    if (data.key !== undefined) {
      updates.push(`key = $${updates.length + 1}`)
      values.push(data.key)
    }
    if (data.title !== undefined) {
      updates.push(`title = $${updates.length + 1}`)
      values.push(data.title)
    }
    if (data.icon !== undefined) {
      updates.push(`icon = $${updates.length + 1}`)
      values.push(data.icon)
    }
    if (data.sortOrder !== undefined) {
      updates.push(`sort_order = $${updates.length + 1}`)
      values.push(data.sortOrder)
    }
    if (data.isActive !== undefined) {
      updates.push(`is_active = $${updates.length + 1}`)
      values.push(data.isActive)
    }

    if (updates.length === 0) {
      throw new Error("没有要更新的字段")
    }

    const result = await sql`
      UPDATE sections 
      SET ${sql.unsafe(updates.join(", "))}
      WHERE id = ${id}
      RETURNING 
        id,
        key,
        title,
        icon,
        sort_order as "sortOrder",
        is_active as "isActive"
    `

    return result[0] as Section
  } catch (error) {
    console.error("更新分区失败:", error)
    throw error
  }
}

// 删除分区
export async function deleteSection(id: number): Promise<boolean> {
  try {
    const result = await sql`
      DELETE FROM sections WHERE id = ${id}
    `
    return result.count > 0
  } catch (error) {
    console.error("删除分区失败:", error)
    throw error
  }
}

// 更新分区排序
export async function updateSectionsOrder(updates: { id: number; sortOrder: number }[]): Promise<boolean> {
  try {
    for (const update of updates) {
      await sql`
        UPDATE sections 
        SET sort_order = ${update.sortOrder}
        WHERE id = ${update.id}
      `
    }
    return true
  } catch (error) {
    console.error("更新分区排序失败:", error)
    throw error
  }
}

// ==================== 网站相关操作 ====================

// 获取所有网站
export async function getWebsites(): Promise<Website[]> {
  try {
    const result = await sql`
      SELECT 
        id,
        name,
        description,
        url,
        tags,
        custom_logo as "customLogo",
        section,
        sort_order as "sortOrder"
      FROM websites 
      ORDER BY sort_order ASC, id ASC
    `
    return result as Website[]
  } catch (error) {
    console.error("获取网站失败:", error)
    throw error
  }
}

// 兼容旧函数名
export async function getAllWebsites(): Promise<Website[]> {
  return getWebsites()
}

// 根据分区获取网站
export async function getWebsitesBySection(section: string): Promise<Website[]> {
  try {
    const result = await sql`
      SELECT 
        id,
        name,
        description,
        url,
        tags,
        custom_logo as "customLogo",
        section,
        sort_order as "sortOrder"
      FROM websites 
      WHERE section = ${section}
      ORDER BY sort_order ASC, id ASC
    `
    return result as Website[]
  } catch (error) {
    console.error("获取网站失败:", error)
    throw error
  }
}

// 根据ID获取网站
export async function getWebsiteById(id: number): Promise<Website | null> {
  try {
    const result = await sql`
      SELECT 
        id,
        name,
        description,
        url,
        tags,
        custom_logo as "customLogo",
        section,
        sort_order as "sortOrder"
      FROM websites 
      WHERE id = ${id}
    `
    return (result[0] as Website) || null
  } catch (error) {
    console.error("获取网站失败:", error)
    throw error
  }
}

// 创建网站
export async function createWebsite(data: {
  name: string
  description?: string
  url: string
  tags?: string
  customLogo?: string
  section: string
  sortOrder?: number
}): Promise<Website> {
  try {
    const result = await sql`
      INSERT INTO websites (name, description, url, tags, custom_logo, section, sort_order)
      VALUES (
        ${data.name},
        ${data.description || null},
        ${data.url},
        ${data.tags || null},
        ${data.customLogo || null},
        ${data.section},
        ${data.sortOrder || 0}
      )
      RETURNING 
        id,
        name,
        description,
        url,
        tags,
        custom_logo as "customLogo",
        section,
        sort_order as "sortOrder"
    `
    return result[0] as Website
  } catch (error) {
    console.error("创建网站失败:", error)
    throw error
  }
}

// 更新网站
export async function updateWebsite(
  id: number,
  data: {
    name?: string
    description?: string
    url?: string
    tags?: string
    customLogo?: string
    section?: string
    sortOrder?: number
  },
): Promise<Website> {
  try {
    const updates = []
    const values = []

    if (data.name !== undefined) {
      updates.push(`name = $${updates.length + 1}`)
      values.push(data.name)
    }
    if (data.description !== undefined) {
      updates.push(`description = $${updates.length + 1}`)
      values.push(data.description)
    }
    if (data.url !== undefined) {
      updates.push(`url = $${updates.length + 1}`)
      values.push(data.url)
    }
    if (data.tags !== undefined) {
      updates.push(`tags = $${updates.length + 1}`)
      values.push(data.tags)
    }
    if (data.customLogo !== undefined) {
      updates.push(`custom_logo = $${updates.length + 1}`)
      values.push(data.customLogo)
    }
    if (data.section !== undefined) {
      updates.push(`section = $${updates.length + 1}`)
      values.push(data.section)
    }
    if (data.sortOrder !== undefined) {
      updates.push(`sort_order = $${updates.length + 1}`)
      values.push(data.sortOrder)
    }

    if (updates.length === 0) {
      throw new Error("没有要更新的字段")
    }

    const result = await sql`
      UPDATE websites 
      SET ${sql.unsafe(updates.join(", "))}
      WHERE id = ${id}
      RETURNING 
        id,
        name,
        description,
        url,
        tags,
        custom_logo as "customLogo",
        section,
        sort_order as "sortOrder"
    `

    return result[0] as Website
  } catch (error) {
    console.error("更新网站失败:", error)
    throw error
  }
}

// 删除网站
export async function deleteWebsite(id: number): Promise<boolean> {
  try {
    const result = await sql`
      DELETE FROM websites WHERE id = ${id}
    `
    return result.count > 0
  } catch (error) {
    console.error("删除网站失败:", error)
    throw error
  }
}

// 更新网站排序
export async function updateWebsitesOrder(updates: { id: number; sortOrder: number }[]): Promise<boolean> {
  try {
    for (const update of updates) {
      await sql`
        UPDATE websites 
        SET sort_order = ${update.sortOrder}
        WHERE id = ${update.id}
      `
    }
    return true
  } catch (error) {
    console.error("更新网站排序失败:", error)
    throw error
  }
}

// ==================== 管理员相关操作 ====================

// 根据用户名获取管理员
export async function getAdminByUsername(username: string): Promise<Admin | null> {
  try {
    const result = await sql`
      SELECT id, username, password, created_at as "createdAt", updated_at as "updatedAt"
      FROM admin 
      WHERE username = ${username}
    `
    return (result[0] as Admin) || null
  } catch (error) {
    console.error("获取管理员失败:", error)
    throw error
  }
}

// 创建管理员
export async function createAdmin(data: {
  username: string
  password: string
}): Promise<Admin> {
  try {
    const result = await sql`
      INSERT INTO admin (username, password, created_at, updated_at)
      VALUES (
        ${data.username},
        ${data.password},
        NOW(),
        NOW()
      )
      RETURNING id, username, password, created_at as "createdAt", updated_at as "updatedAt"
    `
    return result[0] as Admin
  } catch (error) {
    console.error("创建管理员失败:", error)
    throw error
  }
}

// 更新管理员密码
export async function updateAdminPassword(username: string, newPassword: string): Promise<boolean> {
  try {
    const result = await sql`
      UPDATE admin 
      SET password = ${newPassword}, updated_at = NOW()
      WHERE username = ${username}
    `
    return result.count > 0
  } catch (error) {
    console.error("更新管理员密码失败:", error)
    throw error
  }
}

// ==================== 搜索功能 ====================

// 搜索网站
export async function searchWebsites(query: string): Promise<Website[]> {
  try {
    const searchTerm = `%${query}%`
    const result = await sql`
      SELECT 
        id,
        name,
        description,
        url,
        tags,
        custom_logo as "customLogo",
        section,
        sort_order as "sortOrder"
      FROM websites 
      WHERE 
        name ILIKE ${searchTerm} OR 
        description ILIKE ${searchTerm} OR 
        tags ILIKE ${searchTerm}
      ORDER BY sort_order ASC, id ASC
    `
    return result as Website[]
  } catch (error) {
    console.error("搜索网站失败:", error)
    throw error
  }
}

// ==================== 统计功能 ====================

// 获取统计信息
export async function getStats() {
  try {
    const [sectionsCount, websitesCount, websitesBySection] = await Promise.all([
      sql`SELECT COUNT(*) as count FROM sections WHERE is_active = true`,
      sql`SELECT COUNT(*) as count FROM websites`,
      sql`
        SELECT 
          s.title as section_title,
          COUNT(w.id) as website_count
        FROM sections s
        LEFT JOIN websites w ON s.key = w.section
        WHERE s.is_active = true
        GROUP BY s.id, s.title, s.sort_order
        ORDER BY s.sort_order ASC
      `,
    ])

    return {
      totalSections: Number.parseInt(sectionsCount[0].count),
      totalWebsites: Number.parseInt(websitesCount[0].count),
      websitesBySection: websitesBySection.map((row) => ({
        sectionTitle: row.section_title,
        websiteCount: Number.parseInt(row.website_count),
      })),
    }
  } catch (error) {
    console.error("获取统计信息失败:", error)
    throw error
  }
}
