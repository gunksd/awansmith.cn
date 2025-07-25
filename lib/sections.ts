import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export interface Section {
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

export interface CreateSectionData {
  key: string
  title: string
  description: string
  icon: string
  sort_order?: number
  is_active?: boolean
}

export interface UpdateSectionData {
  key?: string
  title?: string
  description?: string
  icon?: string
  sort_order?: number
  is_active?: boolean
}

/**
 * 获取所有分区
 * @returns Promise<Section[]> 分区列表
 */
export async function getAllSections(): Promise<Section[]> {
  try {
    const sections = await sql`
      SELECT * FROM sections 
      ORDER BY sort_order ASC, created_at DESC
    `
    return sections as Section[]
  } catch (error) {
    console.error("获取分区列表失败:", error)
    throw new Error("获取分区列表失败")
  }
}

/**
 * 根据ID获取分区
 * @param id 分区ID
 * @returns Promise<Section | null> 分区信息
 */
export async function getSectionById(id: number): Promise<Section | null> {
  try {
    const sections = await sql`
      SELECT * FROM sections WHERE id = ${id}
    `
    return (sections[0] as Section) || null
  } catch (error) {
    console.error("获取分区详情失败:", error)
    throw new Error("获取分区详情失败")
  }
}

/**
 * 根据key获取分区
 * @param key 分区key
 * @returns Promise<Section | null> 分区信息
 */
export async function getSectionByKey(key: string): Promise<Section | null> {
  try {
    const sections = await sql`
      SELECT * FROM sections WHERE key = ${key}
    `
    return (sections[0] as Section) || null
  } catch (error) {
    console.error("获取分区详情失败:", error)
    throw new Error("获取分区详情失败")
  }
}

/**
 * 创建新分区
 * @param data 分区数据
 * @returns Promise<Section> 创建的分区
 */
export async function createSection(data: CreateSectionData): Promise<Section> {
  try {
    // 检查key是否已存在
    const existingSection = await getSectionByKey(data.key)
    if (existingSection) {
      throw new Error("分区标识符已存在")
    }

    // 如果没有指定排序，获取最大排序值+1
    let sortOrder = data.sort_order
    if (sortOrder === undefined) {
      const maxSortResult = await sql`
        SELECT COALESCE(MAX(sort_order), 0) + 1 as next_sort FROM sections
      `
      sortOrder = maxSortResult[0].next_sort
    }

    const sections = await sql`
      INSERT INTO sections (key, title, description, icon, sort_order, is_active)
      VALUES (${data.key}, ${data.title}, ${data.description}, ${data.icon}, ${sortOrder}, ${data.is_active ?? true})
      RETURNING *
    `
    return sections[0] as Section
  } catch (error) {
    console.error("创建分区失败:", error)
    throw error instanceof Error ? error : new Error("创建分区失败")
  }
}

/**
 * 更新分区
 * @param id 分区ID
 * @param data 更新数据
 * @returns Promise<Section> 更新后的分区
 */
export async function updateSection(id: number, data: UpdateSectionData): Promise<Section> {
  try {
    // 检查分区是否存在
    const existingSection = await getSectionById(id)
    if (!existingSection) {
      throw new Error("分区不存在")
    }

    // 如果更新key，检查新key是否已被其他分区使用
    if (data.key && data.key !== existingSection.key) {
      const sectionWithSameKey = await getSectionByKey(data.key)
      if (sectionWithSameKey && sectionWithSameKey.id !== id) {
        throw new Error("分区标识符已存在")
      }
    }

    // 构建更新字段
    const updateFields: string[] = []
    const updateValues: any[] = []

    if (data.key !== undefined) {
      updateFields.push("key = $" + (updateValues.length + 1))
      updateValues.push(data.key)
    }
    if (data.title !== undefined) {
      updateFields.push("title = $" + (updateValues.length + 1))
      updateValues.push(data.title)
    }
    if (data.description !== undefined) {
      updateFields.push("description = $" + (updateValues.length + 1))
      updateValues.push(data.description)
    }
    if (data.icon !== undefined) {
      updateFields.push("icon = $" + (updateValues.length + 1))
      updateValues.push(data.icon)
    }
    if (data.sort_order !== undefined) {
      updateFields.push("sort_order = $" + (updateValues.length + 1))
      updateValues.push(data.sort_order)
    }
    if (data.is_active !== undefined) {
      updateFields.push("is_active = $" + (updateValues.length + 1))
      updateValues.push(data.is_active)
    }

    // 添加更新时间
    updateFields.push("updated_at = NOW()")

    if (updateFields.length === 1) {
      // 只有updated_at
      throw new Error("没有要更新的字段")
    }

    const sections = await sql`
      UPDATE sections 
      SET ${sql.unsafe(updateFields.join(", "))}
      WHERE id = ${id}
      RETURNING *
    `

    return sections[0] as Section
  } catch (error) {
    console.error("更新分区失败:", error)
    throw error instanceof Error ? error : new Error("更新分区失败")
  }
}

/**
 * 删除分区
 * @param id 分区ID
 * @returns Promise<boolean> 删除结果
 */
export async function deleteSection(id: number): Promise<boolean> {
  try {
    // 检查是否有网站关联到此分区
    const relatedWebsites = await sql`
      SELECT COUNT(*) as count FROM websites WHERE section_key = (
        SELECT key FROM sections WHERE id = ${id}
      )
    `

    if (relatedWebsites[0].count > 0) {
      throw new Error("无法删除分区，还有网站关联到此分区")
    }

    const result = await sql`
      DELETE FROM sections WHERE id = ${id}
    `

    return result.count > 0
  } catch (error) {
    console.error("删除分区失败:", error)
    throw error instanceof Error ? error : new Error("删除分区失败")
  }
}

/**
 * 获取分区统计信息
 * @returns Promise<{totalSections: number, activeSections: number, websiteCount: {[key: string]: number}}> 统计信息
 */
export async function getSectionStats(): Promise<{
  totalSections: number
  activeSections: number
  websiteCount: { [key: string]: number }
}> {
  try {
    // 获取分区总数和活跃分区数
    const sectionStats = await sql`
      SELECT 
        COUNT(*) as total_sections,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active_sections
      FROM sections
    `

    // 获取每个分区的网站数量
    const websiteStats = await sql`
      SELECT 
        s.key,
        COUNT(w.id) as website_count
      FROM sections s
      LEFT JOIN websites w ON s.key = w.section_key
      GROUP BY s.key
    `

    const websiteCount: { [key: string]: number } = {}
    websiteStats.forEach((stat: any) => {
      websiteCount[stat.key] = Number.parseInt(stat.website_count)
    })

    return {
      totalSections: Number.parseInt(sectionStats[0].total_sections),
      activeSections: Number.parseInt(sectionStats[0].active_sections),
      websiteCount,
    }
  } catch (error) {
    console.error("获取分区统计失败:", error)
    throw new Error("获取分区统计失败")
  }
}
