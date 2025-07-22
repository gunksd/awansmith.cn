export interface Website {
  id: string
  name: string
  description: string
  url: string
  tags?: string[]
  customLogo?: string // 新增自定义logo字段
}

export interface SidebarProfile {
  name: string
  avatar: string
  twitter: string
  linktree: string
  btcAddress: string
  ethAddress: string
}
