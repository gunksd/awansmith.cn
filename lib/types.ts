// 网站接口
export interface Website {
  id: string
  name: string
  description: string
  url: string
  tags: string[]
  customLogo?: string | null
  section: string // 使用section而不是sectionId
  sort_order?: number
}

// 分区接口
export interface Section {
  id: number
  key: string // 分区的唯一标识
  title: string // 分区的显示标题
  icon: string
  sort_order: number
  is_active: boolean
  created_at?: string
  updated_at?: string
}

// 数据库网站接口
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

// 数据库分区接口
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

// 管理员接口
export interface Admin {
  id: number
  username: string
  password_hash: string
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

// 表单数据接口
export interface WebsiteFormData {
  name: string
  description: string
  url: string
  tags: string[]
  customLogo?: string
  section: string
}

export interface SectionFormData {
  key: string
  title: string
  icon: string
  sortOrder?: number
  isActive?: boolean
}

// 登录表单接口
export interface LoginFormData {
  username: string
  password: string
}

// 修改密码表单接口
export interface ChangePasswordFormData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
  newUsername?: string
}
