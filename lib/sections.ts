import { sql } from "./database"

// 分区接口定义
export interface Section {
  id: string
  key: string
  title: string
  description: string
  icon: string
  order: number
  visible: boolean
  created_at: string
  updated_at: string
}

// 获取所有分区
export async function getAllSections(): Promise<Section[]> {
  try {
    const sections = await sql`
      SELECT 
        id,
        key,
        title,
        description,
        icon,
        "order",
        visible,
        created_at,
        updated_at
      FROM sections 
      ORDER BY "order" ASC, created_at ASC
    `
    return sections.map((section) => ({
      ...section,
      id: section.id.toString(),
    })) as Section[]
  } catch (error) {
    console.error("获取分区数据失败:", error)
    // 如果sections表不存在，返回默认分区
    return getDefaultSections()
  }
}

// 获取默认分区配置
export function getDefaultSections(): Section[] {
  return [
    {
      id: "1",
      key: "funding",
      title: "🚀 融资信息",
      description: "最新的区块链项目融资动态和投资信息",
      icon: "🚀",
      order: 1,
      visible: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "2",
      key: "tradingData",
      title: "📊 交易数据工具",
      description: "专业的交易数据分析和市场监控工具",
      icon: "📊",
      order: 2,
      visible: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "3",
      key: "faucet",
      title: "💧 领水网站",
      description: "各种测试网络的水龙头和免费代币获取",
      icon: "💧",
      order: 3,
      visible: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "4",
      key: "airdrop",
      title: "🎁 空投网站",
      description: "最新的空投机会和活动信息聚合",
      icon: "🎁",
      order: 4,
      visible: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "5",
      key: "tutorial",
      title: "📚 小白教程",
      description: "Web3和区块链入门教程和学习资源",
      icon: "📚",
      order: 5,
      visible: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "6",
      key: "exchange",
      title: "💱 交易所邀请",
      description: "主流加密货币交易所注册邀请链接",
      icon: "💱",
      order: 6,
      visible: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ]
}

// 根据key获取分区
export async function getSectionByKey(key: string): Promise<Section | null> {
  try {
    const sections = await getAllSections()
    return sections.find((section) => section.key === key) || null
  } catch (error) {
    console.error("获取分区失败:", error)
    return null
  }
}

// 创建分区
export async function createSection(data: {
  key: string
  title: string
  description: string
  icon: string
  order?: number
  visible?: boolean
}): Promise<Section> {
  try {
    const result = await sql`
      INSERT INTO sections (key, title, description, icon, "order", visible)
      VALUES (
        ${data.key},
        ${data.title}, 
        ${data.description},
        ${data.icon},
        ${data.order || 999},
        ${data.visible ?? true}
      )
      RETURNING *
    `
    return {
      ...result[0],
      id: result[0].id.toString(),
    } as Section
  } catch (error) {
    console.error("创建分区失败:", error)
    throw new Error("创建分区失败")
  }
}

// 更新分区
export async function updateSection(
  id: string,
  data: {
    key?: string
    title?: string
    description?: string
    icon?: string
    order?: number
    visible?: boolean
  },
): Promise<Section> {
  try {
    const result = await sql`
      UPDATE sections 
      SET 
        key = COALESCE(${data.key}, key),
        title = COALESCE(${data.title}, title),
        description = COALESCE(${data.description}, description),
        icon = COALESCE(${data.icon}, icon),
        "order" = COALESCE(${data.order}, "order"),
        visible = COALESCE(${data.visible}, visible),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${Number.parseInt(id)}
      RETURNING *
    `
    if (result.length === 0) {
      throw new Error("分区不存在")
    }
    return {
      ...result[0],
      id: result[0].id.toString(),
    } as Section
  } catch (error) {
    console.error("更新分区失败:", error)
    throw new Error("更新分区失败")
  }
}

// 删除分区
export async function deleteSection(id: string): Promise<boolean> {
  try {
    // 检查是否有网站使用此分区
    const websites = await sql`
      SELECT COUNT(*) as count FROM websites WHERE section = (
        SELECT key FROM sections WHERE id = ${Number.parseInt(id)}
      )
    `

    if (Number.parseInt(websites[0].count) > 0) {
      throw new Error("无法删除：该分区下还有网站")
    }

    const result = await sql`
      DELETE FROM sections WHERE id = ${Number.parseInt(id)}
      RETURNING id
    `
    return result.length > 0
  } catch (error) {
    console.error("删除分区失败:", error)
    throw error
  }
}

// 获取分区统计
export async function getSectionStats(): Promise<{
  total: number
  visible: number
  hidden: number
}> {
  try {
    const stats = await sql`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN visible = true THEN 1 END) as visible,
        COUNT(CASE WHEN visible = false THEN 1 END) as hidden
      FROM sections
    `

    return {
      total: Number.parseInt(stats[0].total),
      visible: Number.parseInt(stats[0].visible),
      hidden: Number.parseInt(stats[0].hidden),
    }
  } catch (error) {
    console.error("获取分区统计失败:", error)
    // 如果表不存在，返回默认统计
    const defaultSections = getDefaultSections()
    return {
      total: defaultSections.length,
      visible: defaultSections.filter((s) => s.visible).length,
      hidden: defaultSections.filter((s) => !s.visible).length,
    }
  }
}
