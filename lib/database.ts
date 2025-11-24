import { neon } from "@neondatabase/serverless"

const DATABASE_URL = process.env.DATABASE_URL

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set")
}

export const sql = neon(DATABASE_URL)

export const healthCheck = async () => {
  try {
    await sql`SELECT 1`
    return true
  } catch (error) {
    console.error("数据库健康检查失败:", error)
    return false
  }
}

export const executeQuery = async (queryFn: () => Promise<any>, maxRetries = 2): Promise<any> => {
  let lastError: any

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await queryFn()
      return result
    } catch (error: any) {
      lastError = error
      console.error(`数据库查询失败 (尝试 ${attempt + 1}/${maxRetries + 1}):`, error)

      // 如果是最后一次尝试，直接抛出错误
      if (attempt === maxRetries) {
        throw new Error(`数据库操作失败: ${error?.message || "未知错误"}`)
      }

      // 判断是否应该重试
      const shouldRetry =
        error?.message?.includes("timeout") ||
        error?.message?.includes("aborted") ||
        error?.message?.includes("ECONNREFUSED") ||
        error?.message?.includes("ETIMEDOUT") ||
        error?.message?.includes("connection")

      if (!shouldRetry) {
        throw error
      }

      // 指数退避等待
      const waitTime = 1000 * Math.pow(2, attempt)
      await new Promise((resolve) => setTimeout(resolve, waitTime))
    }
  }

  throw lastError
}

export const query = async (text: string, params: any[] = []) => {
  try {
    const result = await executeQuery(() => sql(text, params))
    return { rows: result }
  } catch (error) {
    console.error("数据库查询错误:", error)
    throw error
  }
}

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

export async function testConnection() {
  try {
    await executeQuery(() => sql`SELECT 1 as test`)
    return true
  } catch (error) {
    console.error("数据库连接失败:", error)
    return false
  }
}

export async function getDatabaseInfo() {
  try {
    const result = await executeQuery(() => sql`SELECT version()`)
    return result[0]
  } catch (error) {
    console.error("获取数据库信息失败:", error)
    return null
  }
}

export async function getAllWebsites(): Promise<DatabaseWebsite[]> {
  return executeQuery(async () => {
    const websites = await sql`SELECT * FROM websites ORDER BY section, sort_order ASC, created_at DESC`
    return websites as DatabaseWebsite[]
  })
}

export async function getWebsitesBySection(section: string): Promise<DatabaseWebsite[]> {
  return executeQuery(async () => {
    const websites =
      await sql`SELECT * FROM websites WHERE section = ${section} ORDER BY sort_order ASC, created_at DESC`
    return websites as DatabaseWebsite[]
  })
}

export async function createWebsite(data: {
  name: string
  description: string
  url: string
  tags: string[]
  customLogo?: string
  section: string
}): Promise<DatabaseWebsite> {
  return executeQuery(async () => {
    const maxOrder =
      await sql`SELECT COALESCE(MAX(sort_order), 0) as max_order FROM websites WHERE section = ${data.section}`
    const nextOrder = (maxOrder[0]?.max_order || 0) + 1

    const result = await sql`
      INSERT INTO websites (name, description, url, tags, custom_logo, section, sort_order)
      VALUES (${data.name}, ${data.description}, ${data.url}, ${data.tags}, ${data.customLogo || null}, ${data.section}, ${nextOrder})
      RETURNING *
    `
    return result[0] as DatabaseWebsite
  })
}

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
  return executeQuery(async () => {
    const updates: string[] = []
    const values: any[] = []

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

    updates.push("updated_at = CURRENT_TIMESTAMP")
    values.push(id)

    const query = `UPDATE websites SET ${updates.join(", ")} WHERE id = $${values.length} RETURNING *`
    const result = await sql(query, values)

    if (result.length === 0) {
      throw new Error("网站不存在")
    }
    return result[0] as DatabaseWebsite
  })
}

export async function deleteWebsite(id: number): Promise<boolean> {
  return executeQuery(async () => {
    const result = await sql`DELETE FROM websites WHERE id = ${id} RETURNING id`
    return result.length > 0
  })
}

export async function updateWebsitesOrder(websites: { id: number; sortOrder: number }[]): Promise<boolean> {
  return executeQuery(async () => {
    for (const website of websites) {
      await sql`UPDATE websites SET sort_order = ${website.sortOrder}, updated_at = CURRENT_TIMESTAMP WHERE id = ${website.id}`
    }
    return true
  })
}

export async function getAllSections(): Promise<DatabaseSection[]> {
  return executeQuery(async () => {
    const sections = await sql`SELECT * FROM sections ORDER BY sort_order ASC, created_at ASC`
    return sections as DatabaseSection[]
  })
}

export async function getActiveSections(): Promise<DatabaseSection[]> {
  return executeQuery(async () => {
    const sections = await sql`SELECT * FROM sections WHERE is_active = true ORDER BY sort_order ASC, created_at ASC`
    return sections as DatabaseSection[]
  })
}

export async function createSection(data: {
  key: string
  title: string
  icon?: string
  sortOrder?: number
}): Promise<DatabaseSection> {
  return executeQuery(async () => {
    const maxOrder = await sql`SELECT COALESCE(MAX(sort_order), 0) as max_order FROM sections`
    const nextOrder = data.sortOrder || (maxOrder[0]?.max_order || 0) + 1

    const result = await sql`
      INSERT INTO sections (key, title, icon, sort_order)
      VALUES (${data.key}, ${data.title}, ${data.icon || "📁"}, ${nextOrder})
      RETURNING *
    `
    return result[0] as DatabaseSection
  })
}

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
  return executeQuery(async () => {
    const updates: string[] = []
    const values: any[] = []

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
      console.log("[updateSection] 没有字段需要更新，跳过 UPDATE")
      const result = await sql`SELECT * FROM sections WHERE id = ${id}`
      if (result.length === 0) {
        throw new Error("分区不存在")
      }
      return result[0] as DatabaseSection
    }

    updates.push("updated_at = CURRENT_TIMESTAMP")
    values.push(id)

    const query = `UPDATE sections SET ${updates.join(", ")} WHERE id = $${values.length} RETURNING *`

    console.log("[updateSection] SQL:", query)
    console.log("[updateSection] Values:", values)

    const result = await sql(query, values)

    if (result.length === 0) {
      throw new Error("分区不存在")
    }
    return result[0] as DatabaseSection
  })
}

export async function deleteSection(id: number): Promise<boolean> {
  return executeQuery(async () => {
    const websites = await sql`
      SELECT COUNT(*) as count FROM websites w
      JOIN sections s ON w.section = s.key
      WHERE s.id = ${id}
    `

    if (websites[0]?.count > 0) {
      throw new Error("该分区下还有网站，无法删除")
    }

    const result = await sql`DELETE FROM sections WHERE id = ${id} RETURNING id`
    return result.length > 0
  })
}

export async function updateSectionsOrder(sections: { id: number; sortOrder: number }[]): Promise<boolean> {
  return executeQuery(async () => {
    for (const section of sections) {
      await sql`UPDATE sections SET sort_order = ${section.sortOrder}, updated_at = CURRENT_TIMESTAMP WHERE id = ${section.id}`
    }
    return true
  })
}
