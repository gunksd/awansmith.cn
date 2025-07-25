// 网站接口
export interface Website {
  id: number
  name: string
  description: string
  url: string
  tags: string[]
  logo?: string
  section_key: string
  is_visible: boolean
  created_at: string
  updated_at: string
}

// 分区接口
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

// 数据库网站接口（与数据库字段对应）
export interface DatabaseWebsite {
  id: number
  name: string
  description: string
  url: string
  tags: string[]
  custom_logo: string | null
  section: string
  visible: boolean
  created_at: string
  updated_at: string
}

// 数据库分区接口
export interface DatabaseSection {
  id: number
  key: string
  title: string
  description: string | null
  icon: string
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

// API响应接口
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// 创建网站数据接口
export interface CreateWebsiteData {
  name: string
  description: string
  url: string
  tags?: string[]
  logo?: string
  section_key: string
  is_visible?: boolean
}

// 更新网站数据接口
export interface UpdateWebsiteData {
  name?: string
  description?: string
  url?: string
  tags?: string[]
  logo?: string
  section_key?: string
  is_visible?: boolean
}

// 创建分区数据接口
export interface CreateSectionData {
  key: string
  title: string
  description: string
  icon: string
  sort_order?: number
  is_active?: boolean
}

// 更新分区数据接口
export interface UpdateSectionData {
  title?: string
  description?: string
  icon?: string
  sort_order?: number
  is_active?: boolean
}
