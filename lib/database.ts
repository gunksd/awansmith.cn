import { neon } from "@neondatabase/serverless"

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set")
}

// 创建数据库连接
export const sql = neon(process.env.DATABASE_URL)

// 数据库操作函数
export interface DatabaseWebsite {
  id: number
  name: string
  description: string
  url: string
  tags: string[]
  custom_logo: string | null
  section: string
  sort_order: number
  created_at: string
  updated_at: string
}

// 分区接口
export interface DatabaseSection {
  id: number
  key: string
  title: string
  icon: string
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

// 获取所有网站
export async function getAllWebsites(): Promise<DatabaseWebsite[]> {
  try {
    const websites = await sql`
      SELECT * FROM websites 
      ORDER BY section, sort_order ASC, created_at DESC
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
      SELECT * FROM websites 
      WHERE section = ${section}
      ORDER BY sort_order ASC, created_at DESC
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
    // 获取该分区的最大排序值
    const maxOrder = await sql`
      SELECT COALESCE(MAX(sort_order), 0) as max_order 
      FROM websites 
      WHERE section = ${data.section}
    `
    const nextOrder = maxOrder[0].max_order + 1

    const result = await sql`
      INSERT INTO websites (name, description, url, tags, custom_logo, section, sort_order)
      VALUES (${data.name}, ${data.description}, ${data.url}, ${data.tags}, ${data.customLogo || null}, ${data.section}, ${nextOrder})
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

// 批量更新网站排序
export async function updateWebsitesOrder(websites: { id: number; sortOrder: number }[]): Promise<boolean> {
  try {
    // 使用事务批量更新
    for (const website of websites) {
      await sql`
        UPDATE websites 
        SET sort_order = ${website.sortOrder}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${website.id}
      `
    }
    return true
  } catch (error) {
    console.error("更新网站排序失败:", error)
    throw new Error("更新网站排序失败")
  }
}

// ===== 分区管理相关函数 =====

// 获取所有分区
export async function getAllSections(): Promise<DatabaseSection[]> {
  try {
    const sections = await sql`
      SELECT * FROM sections 
      ORDER BY sort_order ASC, created_at ASC
    `
    return sections as DatabaseSection[]
  } catch (error) {
    console.error("获取分区数据失败:", error)
    throw new Error("获取分区数据失败")
  }
}

// 获取活跃分区
export async function getActiveSections(): Promise<DatabaseSection[]> {
  try {
    const sections = await sql`
      SELECT * FROM sections 
      WHERE is_active = true
      ORDER BY sort_order ASC, created_at ASC
    `
    return sections as DatabaseSection[]
  } catch (error) {
    console.error("获取活跃分区数据失败:", error)
    throw new Error("获取活跃分区数据失败")
  }
}

// 创建分区
export async function createSection(data: {
  key: string
  title: string
  icon?: string
  sortOrder?: number
}): Promise<DatabaseSection> {
  try {
    // 获取最大排序值
    const maxOrder = await sql`
      SELECT COALESCE(MAX(sort_order), 0) as max_order FROM sections
    `
    const nextOrder = data.sortOrder || maxOrder[0].max_order + 1

    const result = await sql`
      INSERT INTO sections (key, title, icon, sort_order)
      VALUES (${data.key}, ${data.title}, ${data.icon || "📁"}, ${nextOrder})
      RETURNING *
    `
    return result[0] as DatabaseSection
  } catch (error) {
    console.error("创建分区失败:", error)
    if (error.message?.includes("duplicate key")) {
      throw new Error("分区标识已存在")
    }
    throw new Error("创建分区失败")
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
): Promise<DatabaseSection> {
  try {
    const result = await sql`
      UPDATE sections 
      SET 
        key = COALESCE(${data.key}, key),
        title = COALESCE(${data.title}, title),
        icon = COALESCE(${data.icon}, icon),
        sort_order = COALESCE(${data.sortOrder}, sort_order),
        is_active = COALESCE(${data.isActive}, is_active),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `
    if (result.length === 0) {
      throw new Error("分区不存在")
    }
    return result[0] as DatabaseSection
  } catch (error) {
    console.error("更新分区失败:", error)
    throw new Error("更新分区失败")
  }
}

// 删除分区
export async function deleteSection(id: number): Promise<boolean> {
  try {
    // 检查是否有网站使用此分区
    const websites = await sql`
      SELECT COUNT(*) as count FROM websites w
      JOIN sections s ON w.section = s.key
      WHERE s.id = ${id}
    `

    if (websites[0].count > 0) {
      throw new Error("该分区下还有网站，无法删除")
    }

    const result = await sql`
      DELETE FROM sections WHERE id = ${id}
      RETURNING id
    `
    return result.length > 0
  } catch (error) {
    console.error("删除分区失败:", error)
    throw new Error(error.message || "删除分区失败")
  }
}

// 批量更新分区排序
export async function updateSectionsOrder(sections: { id: number; sortOrder: number }[]): Promise<boolean> {
  try {
    // 使用事务批量更新
    for (const section of sections) {
      await sql`
        UPDATE sections 
        SET sort_order = ${section.sortOrder}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${section.id}
      `
    }
    return true
  } catch (error) {
    console.error("更新分区排序失败:", error)
    throw new Error("更新分区排序失败")
  }
}
