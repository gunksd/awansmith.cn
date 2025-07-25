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
  created_at: string
  updated_at: string
}

export interface DatabaseSection {
  id: number
  key: string
  title: string
  description: string
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
      SELECT * FROM websites 
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
      VALUES (${data.name}, ${data.description}, ${data.url}, ${data.tags}, ${data.customLogo || null}, ${data.section})
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

// 获取所有活跃分区
export async function getAllSections(): Promise<DatabaseSection[]> {
  try {
    const sections = await sql`
      SELECT * FROM sections 
      WHERE is_active = true
      ORDER BY sort_order ASC
    `
    return sections as DatabaseSection[]
  } catch (error) {
    console.error("获取分区数据失败:", error)
    throw new Error("获取分区数据失败")
  }
}

// 创建分区
export async function createSection(data: {
  key: string
  title: string
  description?: string
  icon: string
}): Promise<DatabaseSection> {
  try {
    // 获取当前最大排序值
    const maxOrderResult = await sql`
      SELECT COALESCE(MAX(sort_order), 0) as max_order FROM sections
    `
    const nextOrder = maxOrderResult[0].max_order + 1

    const result = await sql`
      INSERT INTO sections (key, title, description, icon, sort_order, is_active)
      VALUES (${data.key}, ${data.title}, ${data.description || ""}, ${data.icon}, ${nextOrder}, true)
      RETURNING *
    `
    return result[0] as DatabaseSection
  } catch (error) {
    console.error("创建分区失败:", error)
    throw new Error("创建分区失败")
  }
}

// 更新分区
export async function updateSection(
  key: string,
  data: {
    title?: string
    description?: string
    icon?: string
  },
): Promise<DatabaseSection> {
  try {
    const result = await sql`
      UPDATE sections 
      SET 
        title = COALESCE(${data.title}, title),
        description = COALESCE(${data.description}, description),
        icon = COALESCE(${data.icon}, icon),
        updated_at = CURRENT_TIMESTAMP
      WHERE key = ${key}
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

// 删除分区（软删除）
export async function deleteSection(key: string): Promise<boolean> {
  try {
    // 检查是否有网站使用此分区
    const websitesCount = await sql`
      SELECT COUNT(*) as count FROM websites WHERE section = ${key}
    `

    if (websitesCount[0].count > 0) {
      throw new Error(`无法删除此分区，因为有${websitesCount[0].count}个网站正在使用它`)
    }

    const result = await sql`
      UPDATE sections 
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE key = ${key}
      RETURNING key
    `
    return result.length > 0
  } catch (error) {
    console.error("删除分区失败:", error)
    throw new Error(error instanceof Error ? error.message : "删除分区失败")
  }
}

// 更新分区排序
export async function updateSectionsOrder(sections: { key: string }[]): Promise<boolean> {
  try {
    await sql.begin(async (sql) => {
      for (let i = 0; i < sections.length; i++) {
        await sql`
          UPDATE sections 
          SET sort_order = ${i + 1}, updated_at = CURRENT_TIMESTAMP
          WHERE key = ${sections[i].key}
        `
      }
    })
    return true
  } catch (error) {
    console.error("更新分区排序失败:", error)
    throw new Error("更新分区排序失败")
  }
}
