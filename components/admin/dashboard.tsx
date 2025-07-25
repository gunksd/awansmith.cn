"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from "@/hooks/use-toast"
import { Plus, Edit, Trash2, RefreshCw, ExternalLink } from "lucide-react"

// 类型定义
interface Website {
  id: string
  name: string
  description: string
  url: string
  tags: string[]
  customLogo?: string
  section: string
  createdAt: string
  updatedAt: string
}

interface Section {
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

interface Stats {
  websites: {
    total: number
    bySection: { [key: string]: number }
  }
  sections: {
    total: number
    visible: number
    hidden: number
  }
}

export function AdminDashboard() {
  const [websites, setWebsites] = useState<Website[]>([])
  const [sections, setSections] = useState<Section[]>([])
  const [stats, setStats] = useState<Stats>({
    websites: { total: 0, bySection: {} },
    sections: { total: 0, visible: 0, hidden: 0 },
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 表单状态
  const [websiteForm, setWebsiteForm] = useState({
    name: "",
    description: "",
    url: "",
    tags: "",
    customLogo: "",
    section: "",
  })
  const [sectionForm, setSectionForm] = useState({
    key: "",
    title: "",
    description: "",
    icon: "",
    order: 0,
    visible: true,
  })

  const [editingWebsite, setEditingWebsite] = useState<Website | null>(null)
  const [editingSection, setEditingSection] = useState<Section | null>(null)
  const [isWebsiteDialogOpen, setIsWebsiteDialogOpen] = useState(false)
  const [isSectionDialogOpen, setIsSectionDialogOpen] = useState(false)

  // 获取认证令牌
  const getAuthToken = () => {
    return localStorage.getItem("admin_token")
  }

  // 获取认证头
  const getAuthHeaders = () => {
    const token = getAuthToken()
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    }
  }

  // 加载数据
  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      const headers = getAuthHeaders()

      // 并行获取数据
      const [websitesRes, sectionsRes] = await Promise.all([
        fetch("/api/admin/websites", { headers }),
        fetch("/api/admin/sections", { headers }),
      ])

      if (!websitesRes.ok || !sectionsRes.ok) {
        throw new Error("获取数据失败")
      }

      const websitesData = await websitesRes.json()
      const sectionsData = await sectionsRes.json()

      console.log("获取到的网站数据:", websitesData)
      console.log("获取到的分区数据:", sectionsData)

      setWebsites(websitesData.websites || [])
      setSections(sectionsData.sections || [])

      // 计算统计数据
      const websiteStats = {
        total: websitesData.websites?.length || 0,
        bySection: {} as { [key: string]: number },
      }

      // 按分区统计网站数量
      websitesData.websites?.forEach((website: Website) => {
        websiteStats.bySection[website.section] = (websiteStats.bySection[website.section] || 0) + 1
      })

      const sectionStats = {
        total: sectionsData.sections?.length || 0,
        visible: sectionsData.sections?.filter((s: Section) => s.visible).length || 0,
        hidden: sectionsData.sections?.filter((s: Section) => !s.visible).length || 0,
      }

      setStats({
        websites: websiteStats,
        sections: sectionStats,
      })
    } catch (error) {
      console.error("加载数据失败:", error)
      setError("加载数据失败，请检查网络连接或重新登录")
    } finally {
      setLoading(false)
    }
  }

  // 初始加载
  useEffect(() => {
    loadData()
  }, [])

  // 创建网站
  const handleCreateWebsite = async () => {
    try {
      const response = await fetch("/api/admin/websites", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          ...websiteForm,
          tags: websiteForm.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "创建失败")
      }

      toast({
        title: "创建成功",
        description: "网站已成功创建",
      })

      setWebsiteForm({
        name: "",
        description: "",
        url: "",
        tags: "",
        customLogo: "",
        section: "",
      })
      setIsWebsiteDialogOpen(false)
      loadData()
    } catch (error) {
      console.error("创建网站失败:", error)
      toast({
        title: "创建失败",
        description: error instanceof Error ? error.message : "创建网站失败",
        variant: "destructive",
      })
    }
  }

  // 更新网站
  const handleUpdateWebsite = async () => {
    if (!editingWebsite) return

    try {
      const response = await fetch(`/api/admin/websites/${editingWebsite.id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          ...websiteForm,
          tags: websiteForm.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "更新失败")
      }

      toast({
        title: "更新成功",
        description: "网站信息已更新",
      })

      setEditingWebsite(null)
      setIsWebsiteDialogOpen(false)
      loadData()
    } catch (error) {
      console.error("更新网站失败:", error)
      toast({
        title: "更新失败",
        description: error instanceof Error ? error.message : "更新网站失败",
        variant: "destructive",
      })
    }
  }

  // 删除网站
  const handleDeleteWebsite = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/websites/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "删除失败")
      }

      toast({
        title: "删除成功",
        description: "网站已删除",
      })

      loadData()
    } catch (error) {
      console.error("删除网站失败:", error)
      toast({
        title: "删除失败",
        description: error instanceof Error ? error.message : "删除网站失败",
        variant: "destructive",
      })
    }
  }

  // 创建分区
  const handleCreateSection = async () => {
    try {
      const response = await fetch("/api/admin/sections", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(sectionForm),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "创建失败")
      }

      toast({
        title: "创建成功",
        description: "分区已成功创建",
      })

      setSectionForm({
        key: "",
        title: "",
        description: "",
        icon: "",
        order: 0,
        visible: true,
      })
      setIsSectionDialogOpen(false)
      loadData()
    } catch (error) {
      console.error("创建分区失败:", error)
      toast({
        title: "创建失败",
        description: error instanceof Error ? error.message : "创建分区失败",
        variant: "destructive",
      })
    }
  }

  // 更新分区
  const handleUpdateSection = async () => {
    if (!editingSection) return

    try {
      const response = await fetch(`/api/admin/sections/${editingSection.id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(sectionForm),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "更新失败")
      }

      toast({
        title: "更新成功",
        description: "分区信息已更新",
      })

      setEditingSection(null)
      setIsSectionDialogOpen(false)
      loadData()
    } catch (error) {
      console.error("更新分区失败:", error)
      toast({
        title: "更新失败",
        description: error instanceof Error ? error.message : "更新分区失败",
        variant: "destructive",
      })
    }
  }

  // 删除分区
  const handleDeleteSection = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/sections/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "删除失败")
      }

      toast({
        title: "删除成功",
        description: "分区已删除",
      })

      loadData()
    } catch (error) {
      console.error("删除分区失败:", error)
      toast({
        title: "删除失败",
        description: error instanceof Error ? error.message : "删除分区失败",
        variant: "destructive",
      })
    }
  }

  // 开始编辑网站
  const startEditWebsite = (website: Website) => {
    setEditingWebsite(website)
    setWebsiteForm({
      name: website.name,
      description: website.description,
      url: website.url,
      tags: website.tags.join(", "),
      customLogo: website.customLogo || "",
      section: website.section,
    })
    setIsWebsiteDialogOpen(true)
  }

  // 开始编辑分区
  const startEditSection = (section: Section) => {
    setEditingSection(section)
    setSectionForm({
      key: section.key,
      title: section.title,
      description: section.description,
      icon: section.icon,
      order: section.order,
      visible: section.visible,
    })
    setIsSectionDialogOpen(true)
  }

  // 重置表单
  const resetWebsiteForm = () => {
    setWebsiteForm({
      name: "",
      description: "",
      url: "",
      tags: "",
      customLogo: "",
      section: "",
    })
    setEditingWebsite(null)
  }

  const resetSectionForm = () => {
    setSectionForm({
      key: "",
      title: "",
      description: "",
      icon: "",
      order: 0,
      visible: true,
    })
    setEditingSection(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">加载管理面板中...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <Button onClick={loadData} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            重新加载
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 调试信息 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            系统状态
            <Button onClick={loadData} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              刷新数据
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="font-medium">网站总数</p>
              <p className="text-2xl font-bold text-blue-600">{stats.websites.total}</p>
            </div>
            <div>
              <p className="font-medium">分区总数</p>
              <p className="text-2xl font-bold text-green-600">{stats.sections.total}</p>
            </div>
            <div>
              <p className="font-medium">可见分区</p>
              <p className="text-2xl font-bold text-purple-600">{stats.sections.visible}</p>
            </div>
            <div>
              <p className="font-medium">隐藏分区</p>
              <p className="text-2xl font-bold text-orange-600">{stats.sections.hidden}</p>
            </div>
          </div>

          {/* 按分区统计 */}
          {Object.keys(stats.websites.bySection).length > 0 && (
            <div className="mt-4">
              <p className="font-medium mb-2">各分区网站数量：</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(stats.websites.bySection).map(([section, count]) => (
                  <Badge key={section} variant="secondary">
                    {section}: {count}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 主要内容 */}
      <Tabs defaultValue="websites" className="space-y-4">
        <TabsList>
          <TabsTrigger value="websites">网站管理</TabsTrigger>
          <TabsTrigger value="sections">分区管理</TabsTrigger>
        </TabsList>

        {/* 网站管理 */}
        <TabsContent value="websites" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">网站管理</h2>
            <Dialog open={isWebsiteDialogOpen} onOpenChange={setIsWebsiteDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetWebsiteForm}>
                  <Plus className="w-4 h-4 mr-2" />
                  添加网站
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{editingWebsite ? "编辑网站" : "添加网站"}</DialogTitle>
                  <DialogDescription>{editingWebsite ? "修改网站信息" : "添加新的网站到导航"}</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      名称 *
                    </Label>
                    <Input
                      id="name"
                      value={websiteForm.name}
                      onChange={(e) => setWebsiteForm({ ...websiteForm, name: e.target.value })}
                      className="col-span-3"
                      placeholder="网站名称"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="url" className="text-right">
                      URL *
                    </Label>
                    <Input
                      id="url"
                      value={websiteForm.url}
                      onChange={(e) => setWebsiteForm({ ...websiteForm, url: e.target.value })}
                      className="col-span-3"
                      placeholder="https://example.com"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="section" className="text-right">
                      分区 *
                    </Label>
                    <Select
                      value={websiteForm.section}
                      onValueChange={(value) => setWebsiteForm({ ...websiteForm, section: value })}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="选择分区" />
                      </SelectTrigger>
                      <SelectContent>
                        {sections.map((section) => (
                          <SelectItem key={section.id} value={section.key}>
                            {section.icon} {section.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label htmlFor="description" className="text-right pt-2">
                      描述 *
                    </Label>
                    <Textarea
                      id="description"
                      value={websiteForm.description}
                      onChange={(e) => setWebsiteForm({ ...websiteForm, description: e.target.value })}
                      className="col-span-3"
                      placeholder="网站描述"
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="tags" className="text-right">
                      标签
                    </Label>
                    <Input
                      id="tags"
                      value={websiteForm.tags}
                      onChange={(e) => setWebsiteForm({ ...websiteForm, tags: e.target.value })}
                      className="col-span-3"
                      placeholder="标签1, 标签2, 标签3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="customLogo" className="text-right">
                      自定义Logo
                    </Label>
                    <Input
                      id="customLogo"
                      value={websiteForm.customLogo}
                      onChange={(e) => setWebsiteForm({ ...websiteForm, customLogo: e.target.value })}
                      className="col-span-3"
                      placeholder="/logos/example.png"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" onClick={editingWebsite ? handleUpdateWebsite : handleCreateWebsite}>
                    {editingWebsite ? "更新" : "创建"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {websites.length === 0 ? (
              <Card>
                <CardContent className="flex items-center justify-center py-8">
                  <p className="text-slate-500">暂无网站数据</p>
                </CardContent>
              </Card>
            ) : (
              websites.map((website) => (
                <Card key={website.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{website.name}</h3>
                          <Badge variant="outline">{website.section}</Badge>
                          <a
                            href={website.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                        <p className="text-sm text-slate-600 mb-2">{website.description}</p>
                        <p className="text-xs text-slate-500 mb-2">{website.url}</p>
                        {website.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {website.tags.map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button variant="outline" size="sm" onClick={() => startEditWebsite(website)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>确认删除</AlertDialogTitle>
                              <AlertDialogDescription>
                                确定要删除网站 "{website.name}" 吗？此操作无法撤销。
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>取消</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteWebsite(website.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                删除
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* 分区管理 */}
        <TabsContent value="sections" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">分区管理</h2>
            <Dialog open={isSectionDialogOpen} onOpenChange={setIsSectionDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetSectionForm}>
                  <Plus className="w-4 h-4 mr-2" />
                  添加分区
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingSection ? "编辑分区" : "添加分区"}</DialogTitle>
                  <DialogDescription>{editingSection ? "修改分区信息" : "添加新的分区"}</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="sectionKey" className="text-right">
                      Key *
                    </Label>
                    <Input
                      id="sectionKey"
                      value={sectionForm.key}
                      onChange={(e) => setSectionForm({ ...sectionForm, key: e.target.value })}
                      className="col-span-3"
                      placeholder="section-key"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="sectionTitle" className="text-right">
                      标题 *
                    </Label>
                    <Input
                      id="sectionTitle"
                      value={sectionForm.title}
                      onChange={(e) => setSectionForm({ ...sectionForm, title: e.target.value })}
                      className="col-span-3"
                      placeholder="分区标题"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="sectionIcon" className="text-right">
                      图标
                    </Label>
                    <Input
                      id="sectionIcon"
                      value={sectionForm.icon}
                      onChange={(e) => setSectionForm({ ...sectionForm, icon: e.target.value })}
                      className="col-span-3"
                      placeholder="🚀"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label htmlFor="sectionDescription" className="text-right pt-2">
                      描述 *
                    </Label>
                    <Textarea
                      id="sectionDescription"
                      value={sectionForm.description}
                      onChange={(e) => setSectionForm({ ...sectionForm, description: e.target.value })}
                      className="col-span-3"
                      placeholder="分区描述"
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="sectionOrder" className="text-right">
                      排序
                    </Label>
                    <Input
                      id="sectionOrder"
                      type="number"
                      value={sectionForm.order}
                      onChange={(e) => setSectionForm({ ...sectionForm, order: Number.parseInt(e.target.value) || 0 })}
                      className="col-span-3"
                      placeholder="0"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" onClick={editingSection ? handleUpdateSection : handleCreateSection}>
                    {editingSection ? "更新" : "创建"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {sections.length === 0 ? (
              <Card>
                <CardContent className="flex items-center justify-center py-8">
                  <p className="text-slate-500">暂无分区数据</p>
                </CardContent>
              </Card>
            ) : (
              sections.map((section) => (
                <Card key={section.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">{section.icon}</span>
                          <h3 className="font-semibold">{section.title}</h3>
                          <Badge variant={section.visible ? "default" : "secondary"}>
                            {section.visible ? "显示" : "隐藏"}
                          </Badge>
                          <Badge variant="outline">排序: {section.order}</Badge>
                        </div>
                        <p className="text-sm text-slate-600 mb-2">{section.description}</p>
                        <p className="text-xs text-slate-500">Key: {section.key}</p>
                        <p className="text-xs text-slate-500">网站数量: {stats.websites.bySection[section.key] || 0}</p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button variant="outline" size="sm" onClick={() => startEditSection(section)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>确认删除</AlertDialogTitle>
                              <AlertDialogDescription>
                                确定要删除分区 "{section.title}" 吗？
                                {stats.websites.bySection[section.key] > 0 && (
                                  <span className="text-red-600">
                                    <br />
                                    注意：该分区下还有 {stats.websites.bySection[section.key]} 个网站，无法删除。
                                  </span>
                                )}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>取消</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteSection(section.id)}
                                className="bg-red-600 hover:bg-red-700"
                                disabled={stats.websites.bySection[section.key] > 0}
                              >
                                删除
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
