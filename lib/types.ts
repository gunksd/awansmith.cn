// 分区类型定义
export interface Section {
  id: number
  key: string // 分区唯一标识
  title: string // 分区标题
  icon?: string // 分区图标
  sortOrder: number // 排序顺序
  isActive: boolean // 是否激活
}

// 网站类型定义
export interface Website {
  id: number
  name: string // 网站名称
  description?: string // 网站描述
  url: string // 网站链接
  tags?: string // 标签（逗号分隔）
  customLogo?: string // 自定义Logo URL
  section: string // 所属分区key
  sortOrder: number // 排序顺序
}

// 管理员类型定义
export interface Admin {
  id: number
  username: string
  password: string // 加密后的密码
  createdAt: Date
  updatedAt: Date
}

// API响应类型
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// 分页类型
export interface PaginationParams {
  page?: number
  limit?: number
  search?: string
  section?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// 表单数据类型
export interface WebsiteFormData {
  name: string
  description?: string
  url: string
  tags?: string
  customLogo?: string
  section: string
}

export interface SectionFormData {
  key: string
  title: string
  icon?: string
  isActive: boolean
}

// 排序更新类型
export interface SortOrderUpdate {
  id: number
  sortOrder: number
}

// 登录表单类型
export interface LoginFormData {
  username: string
  password: string
}

// 修改密码表单类型
export interface ChangePasswordFormData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}
