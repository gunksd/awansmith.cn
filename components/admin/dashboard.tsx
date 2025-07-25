"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Globe, Layers, LogOut, RefreshCw, Database, Activity, AlertCircle } from "lucide-react"
import { checkClientAuth } from "@/lib/auth"

interface Website {
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

interface Section {
  id: number
  key: string
  name: string
  description: string | null
  icon: string | null
  order_index: number
  created_at: string
  updated_at: string
}

interface Stats {
  websites: number
  sections: number
  bySection: { [key: string]: number }
}

export function AdminDashboard() {
  const [websites, setWebsites] = useState<Website[]>([])
  const [sections, setSections] = useState<Section[]>([])
  const [stats, setStats] = useState<Stats>({ websites: 0, sections: 0, bySection: {} })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const router = useRouter()

  // 客户端认证检查
  useEffect(() => {
    console.log("[DASHBOARD] 检查客户端认证...")
    if (!checkClientAuth()) {
      console.log("[DASHBOARD] 客户端认证失败，跳转登录")
      router.push("/admin/login")
      return
    }
    console.log("[DASHBOARD] 客户端认证成功")
  }, [router])

  // 加载数据
  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log("[DASHBOARD] 开始加载数据...")

      // 并行获取所有数据
      const [websitesRes, sectionsRes, statsRes] = await Promise.all([
        fetch("/api/admin/websites"),
        fetch("/api/admin/sections"),
        fetch("/api/admin/stats"),
      ])

      console.log("[DASHBOARD] API响应状态:", {
        websites: websitesRes.status,
        sections: sectionsRes.status,
        stats: statsRes.status,
      })

      // 检查响应状态
      if (!websitesRes.ok) {
        const errorData = await websitesRes.json()
        throw new Error(`获取网站数据失败: ${errorData.error || websitesRes.statusText}`)
      }

      if (!sectionsRes.ok) {
        const errorData = await sectionsRes.json()
        throw new Error(`获取分区数据失败: ${errorData.error || sectionsRes.statusText}`)
      }

      // 解析数据
      const websitesData = await websitesRes.json()
      const sectionsData = await sectionsRes.json()

      console.log("[DASHBOARD] 获取到的数据:", {
        websites: websitesData.data?.length || 0,
        sections: sectionsData.data?.length || 0,
      })

      // 更新状态
      setWebsites(websitesData.data || [])
      setSections(sectionsData.data || [])

      // 计算统计数据
      const websiteCount = websitesData.data?.length || 0
      const sectionCount = sectionsData.data?.length || 0
      const bySection: { [key: string]: number } = {}

      if (websitesData.data) {
        websitesData.data.forEach((website: Website) => {
          bySection[website.section] = (bySection[website.section] || 0) + 1
        })
      }

      setStats({
        websites: websiteCount,
        sections: sectionCount,
        bySection,
      })

      // 设置调试信息
      setDebugInfo({
        timestamp: new Date().toLocaleString(),
        websitesCount: websiteCount,
        sectionsCount: sectionCount,
        apiStatus: "正常",
        lastUpdate: new Date().toISOString(),
      })

      console.log("[DASHBOARD] 数据加载完成")
    } catch (error) {
      console.error("[DASHBOARD] 数据加载失败:", error)
      setError(error instanceof Error ? error.message : "加载数据失败")
      setDebugInfo({
        timestamp: new Date().toLocaleString(),
        error: error instanceof Error ? error.message : "未知错误",
        apiStatus: "错误",
      })
    } finally {
      setLoading(false)
    }
  }

  // 初始加载
  useEffect(() => {
    loadData()
  }, [])

  // 退出登录
  const handleLogout = async () => {
    try {
      console.log("[DASHBOARD] 退出登录...")

      // 清除本地存储
      localStorage.removeItem("admin-token")

      // 调用退出API
      await fetch("/api/admin/logout", { method: "POST" })

      // 跳转到登录页
      router.push("/admin/login")
    } catch (error) {
      console.error("[DASHBOARD] 退出登录失败:", error)
      // 即使API调用失败，也要跳转到登录页
      router.push("/admin/login")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-slate-600 dark:text-slate-400">加载管理面板...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* 头部 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">管理面板</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">网站导航系统管理后台</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={loadData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            刷新数据
          </Button>
          <Button variant="destructive" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            退出登录
          </Button>
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总网站数</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.websites}</div>
            <p className="text-xs text-muted-foreground">已收录的网站</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">分区数量</CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.sections}</div>
            <p className="text-xs text-muted-foreground">网站分类</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">系统状态</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">正常</div>
            <p className="text-xs text-muted-foreground">所有服务运行正常</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">数据库</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">已连接</div>
            <p className="text-xs text-muted-foreground">Neon PostgreSQL</p>
          </CardContent>
        </Card>
      </div>

      {/* 主要内容 */}
      <Tabs defaultValue="websites" className="space-y-4">
        <TabsList>
          <TabsTrigger value="websites">网站管理</TabsTrigger>
          <TabsTrigger value="sections">分区管理</TabsTrigger>
          <TabsTrigger value="stats">统计分析</TabsTrigger>
          <TabsTrigger value="debug">调试信息</TabsTrigger>
        </TabsList>

        {/* 网站管理 */}
        <TabsContent value="websites">
          <Card>
            <CardHeader>
              <CardTitle>网站列表</CardTitle>
              <CardDescription>管理所有收录的网站</CardDescription>
            </CardHeader>
            <CardContent>
              {websites.length === 0 ? (
                <div className="text-center py-8">
                  <Globe className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                  <p className="text-slate-500">暂无网站数据</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>名称</TableHead>
                      <TableHead>URL</TableHead>
                      <TableHead>分区</TableHead>
                      <TableHead>标签</TableHead>
                      <TableHead>创建时间</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {websites.map((website) => (
                      <TableRow key={website.id}>
                        <TableCell className="font-medium">{website.name}</TableCell>
                        <TableCell>
                          <a
                            href={website.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {website.url}
                          </a>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{website.section}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {website.tags?.slice(0, 3).map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {website.tags?.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{website.tags.length - 3}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{new Date(website.created_at).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 分区管理 */}
        <TabsContent value="sections">
          <Card>
            <CardHeader>
              <CardTitle>分区列表</CardTitle>
              <CardDescription>管理网站分类</CardDescription>
            </CardHeader>
            <CardContent>
              {sections.length === 0 ? (
                <div className="text-center py-8">
                  <Layers className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                  <p className="text-slate-500">暂无分区数据</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>名称</TableHead>
                      <TableHead>键值</TableHead>
                      <TableHead>描述</TableHead>
                      <TableHead>排序</TableHead>
                      <TableHead>网站数量</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sections.map((section) => (
                      <TableRow key={section.id}>
                        <TableCell className="font-medium">{section.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{section.key}</Badge>
                        </TableCell>
                        <TableCell>{section.description || "-"}</TableCell>
                        <TableCell>{section.order_index}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{stats.bySection[section.key] || 0}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 统计分析 */}
        <TabsContent value="stats">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>分区统计</CardTitle>
                <CardDescription>各分区网站数量分布</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(stats.bySection).map(([section, count]) => (
                    <div key={section} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{section}</span>
                      <Badge variant="secondary">{count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>系统概览</CardTitle>
                <CardDescription>系统运行状态</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">数据库状态</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      已连接
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">API状态</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      正常
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">最后更新</span>
                    <span className="text-sm text-slate-500">{debugInfo?.timestamp || "未知"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 调试信息 */}
        <TabsContent value="debug">
          <Card>
            <CardHeader>
              <CardTitle>调试信息</CardTitle>
              <CardDescription>系统运行详情和错误日志</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">当前状态</h4>
                  <pre className="text-sm text-slate-600 dark:text-slate-400">{JSON.stringify(debugInfo, null, 2)}</pre>
                </div>

                <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">环境信息</h4>
                  <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                    <p>Node.js 环境: {typeof window === "undefined" ? "服务器端" : "客户端"}</p>
                    <p>用户代理: {typeof window !== "undefined" ? navigator.userAgent : "N/A"}</p>
                    <p>时区: {Intl.DateTimeFormat().resolvedOptions().timeZone}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// 同时提供默认导出
export default AdminDashboard
