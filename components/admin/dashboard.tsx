"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import {
  Plus,
  Edit,
  Trash2,
  Upload,
  X,
  BarChart3,
  Globe,
  Users,
  LogOut,
  Settings,
  GripVertical,
  Save,
  AlertCircle,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

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
  title: string
  description: string
  icon: string
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export function AdminDashboard() {
  const router = useRouter()
  const [websites, setWebsites] = useState<Website[]>([])
  const [sections, setSections] = useState<Section[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [sectionDialogOpen, setSectionDialogOpen] = useState(false)
  const [editingWebsite, setEditingWebsite] = useState<Website | null>(null)
  const [editingSection, setEditingSection] = useState<Section | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [sectionToDelete, setSectionToDelete] = useState<Section | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    url: "",
    tags: "",
    customLogo: "",
    section: "",
  })
  const [sectionFormData, setSectionFormData] = useState({
    key: "",
    title: "",
    description: "",
    icon: "",
  })
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [draggedSection, setDraggedSection] = useState<Section | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      // 并行加载数据
      const [websitesResponse, sectionsResponse] = await Promise.all([
        fetch("/api/admin/websites"),
        fetch("/api/admin/sections"),
      ])

      if (websitesResponse.ok && sectionsResponse.ok) {
        const websitesData = await websitesResponse.json()
        const sectionsData = await sectionsResponse.json()

        setWebsites(websitesData)
        setSections(sectionsData)
      }
    } catch (error) {
      console.error("加载数据失败:", error)
      toast({
        title: "加载失败",
        description: "无法加载数据",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // 按分区分组网站数据
  const groupWebsitesBySection = (websites: Website[]) => {
    const grouped: Record<string, Website[]> = {}

    // 初始化所有分区
    sections.forEach((section) => {
      grouped[section.key] = []
    })

    // 分组网站
    websites.forEach((website) => {
      if (grouped[website.section]) {
        grouped[website.section].push(website)
      }
    })

    return grouped
  }

  // 计算统计数据
  const getStats = () => {
    const grouped = groupWebsitesBySection(websites)
    const totalWebsites = websites.length
    const totalSections = sections.length
    const totalTags = [...new Set(websites.flatMap((site) => site.tags))].length

    return { totalWebsites, totalSections, totalTags }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.description || !formData.url || !formData.section) {
      toast({
        title: "表单验证失败",
        description: "请填写所有必填字段",
        variant: "destructive",
      })
      return
    }

    try {
      const submitData = {
        name: formData.name,
        description: formData.description,
        url: formData.url,
        tags: formData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag),
        customLogo: formData.customLogo || null,
        section: formData.section,
      }

      const url = editingWebsite ? `/api/admin/websites/${editingWebsite.id}` : "/api/admin/websites"
      const method = editingWebsite ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      })

      if (response.ok) {
        toast({
          title: editingWebsite ? "更新成功" : "创建成功",
          description: `网站 ${formData.name} ${editingWebsite ? "已更新" : "已创建"}`,
        })

        setDialogOpen(false)
        resetForm()
        loadData()
      } else {
        throw new Error("操作失败")
      }
    } catch (error) {
      console.error("提交失败:", error)
      toast({
        title: "操作失败",
        description: "请检查网络连接后重试",
        variant: "destructive",
      })
    }
  }

  const handleSectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!sectionFormData.title || !sectionFormData.icon) {
      toast({
        title: "表单验证失败",
        description: "请填写所有必填字段",
        variant: "destructive",
      })
      return
    }

    try {
      let url = "/api/admin/sections"
      let method = "POST"
      let submitData = sectionFormData

      if (editingSection) {
        url = `/api/admin/sections/${editingSection.key}`
        method = "PUT"
        submitData = {
          ...sectionFormData,
          key: editingSection.key, // 编辑时不修改key
        }
      } else {
        // 新建时需要验证key
        if (!sectionFormData.key) {
          toast({
            title: "表单验证失败",
            description: "请填写分区标识",
            variant: "destructive",
          })
          return
        }

        // 验证key格式
        if (!/^[a-zA-Z][a-zA-Z0-9]*$/.test(sectionFormData.key)) {
          toast({
            title: "表单验证失败",
            description: "分区标识只能包含字母和数字，且必须以字母开头",
            variant: "destructive",
          })
          return
        }

        // 验证key唯一性
        if (sections.some((s) => s.key === sectionFormData.key)) {
          toast({
            title: "表单验证失败",
            description: "分区标识已存在",
            variant: "destructive",
          })
          return
        }
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      })

      if (response.ok) {
        toast({
          title: editingSection ? "更新成功" : "创建成功",
          description: `分区 ${sectionFormData.title} ${editingSection ? "已更新" : "已创建"}`,
        })

        setSectionDialogOpen(false)
        resetSectionForm()
        loadData()
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || "操作失败")
      }
    } catch (error) {
      console.error("提交失败:", error)
      toast({
        title: "操作失败",
        description: error instanceof Error ? error.message : "请检查网络连接后重试",
        variant: "destructive",
      })
    }
  }

  const handleDeleteSection = async () => {
    if (!sectionToDelete) return

    try {
      const response = await fetch(`/api/admin/sections/${sectionToDelete.key}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "删除成功",
          description: `分区 ${sectionToDelete.title} 已删除`,
        })
        loadData()
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || `删除失败: ${response.statusText}`)
      }
    } catch (error) {
      console.error("删除失败:", error)
      toast({
        title: "删除失败",
        description: error instanceof Error ? error.message : "请检查网络连接后重试",
        variant: "destructive",
      })
    } finally {
      setDeleteConfirmOpen(false)
      setSectionToDelete(null)
    }
  }

  const handleSaveSectionOrder = async () => {
    try {
      const response = await fetch("/api/admin/sections/reorder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sections }),
      })

      if (response.ok) {
        toast({
          title: "保存成功",
          description: "分区排序已更新",
        })
      } else {
        throw new Error("保存失败")
      }
    } catch (error) {
      console.error("保存排序失败:", error)
      toast({
        title: "保存失败",
        description: "请检查网络连接后重试",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (website: Website) => {
    setEditingWebsite(website)
    setFormData({
      name: website.name,
      description: website.description,
      url: website.url,
      tags: website.tags.join(", "),
      customLogo: website.custom_logo || "",
      section: website.section,
    })
    setLogoPreview(website.custom_logo)
    setDialogOpen(true)
  }

  const handleEditSection = (section: Section) => {
    setEditingSection(section)
    setSectionFormData({
      key: section.key,
      title: section.title,
      description: section.description,
      icon: section.icon,
    })
    setSectionDialogOpen(true)
  }

  const handleConfirmDeleteSection = (section: Section) => {
    setSectionToDelete(section)
    setDeleteConfirmOpen(true)
  }

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`确定要删除网站 "${name}" 吗？`)) return

    try {
      const response = await fetch(`/api/admin/websites/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "删除成功",
          description: `网站 ${name} 已删除`,
        })
        loadData()
      } else {
        throw new Error("删除失败")
      }
    } catch (error) {
      console.error("删除失败:", error)
      toast({
        title: "删除失败",
        description: "请检查网络连接后重试",
        variant: "destructive",
      })
    }
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast({
        title: "文件类型错误",
        description: "请选择图片文件",
        variant: "destructive",
      })
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "文件过大",
        description: "图片大小不能超过2MB",
        variant: "destructive",
      })
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      setFormData((prev) => ({ ...prev, customLogo: result }))
      setLogoPreview(result)
    }
    reader.readAsDataURL(file)
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      url: "",
      tags: "",
      customLogo: "",
      section: "",
    })
    setLogoPreview(null)
    setEditingWebsite(null)
  }

  const resetSectionForm = () => {
    setSectionFormData({
      key: "",
      title: "",
      description: "",
      icon: "",
    })
    setEditingSection(null)
  }

  const handleDialogClose = () => {
    setDialogOpen(false)
    resetForm()
  }

  const handleSectionDialogClose = () => {
    setSectionDialogOpen(false)
    resetSectionForm()
  }

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/admin/logout", {
        method: "POST",
      })

      if (response.ok) {
        toast({
          title: "退出成功",
          description: "您已成功退出登录",
        })
        // 重定向到登录页
        router.push("/admin/login")
      } else {
        throw new Error("退出失败")
      }
    } catch (error) {
      console.error("退出失败:", error)
      toast({
        title: "退出失败",
        description: "请检查网络连接后重试",
        variant: "destructive",
      })
    }
  }

  // 拖拽排序相关函数
  const handleDragStart = (section: Section) => {
    setIsDragging(true)
    setDraggedSection(section)
  }

  const handleDragOver = (e: React.DragEvent, targetSection: Section) => {
    e.preventDefault()
    if (!draggedSection || draggedSection.key === targetSection.key) return

    const updatedSections = [...sections]
    const draggedIndex = updatedSections.findIndex((s) => s.key === draggedSection.key)
    const targetIndex = updatedSections.findIndex((s) => s.key === targetSection.key)

    if (draggedIndex !== -1 && targetIndex !== -1) {
      // 重新排序
      const [removed] = updatedSections.splice(draggedIndex, 1)
      updatedSections.splice(targetIndex, 0, removed)
      setSections(updatedSections)
    }
  }

  const handleDragEnd = () => {
    setIsDragging(false)
    setDraggedSection(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  const stats = getStats()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* 顶部装饰背景 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl"></div>
        <div className="absolute -top-20 -left-40 w-60 h-60 bg-indigo-400/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 顶部标题区域 */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-slate-700/50 shadow-xl p-6 md:p-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              {/* 标题和描述 */}
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-200 dark:to-slate-400 bg-clip-text text-transparent">
                      网站管理中心
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base">
                      管理和维护您的区块链资源导航网站
                    </p>
                  </div>
                </div>
              </div>

              {/* 统计信息 */}
              <div className="flex flex-wrap gap-4 lg:gap-6">
                <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{stats.totalWebsites}</div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">网站总数</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <BarChart3 className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600 dark:text-green-400">{stats.totalSections}</div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">活跃分区</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <div className="text-center">
                    <div className="text-lg font-bold text-purple-600 dark:text-purple-400">{stats.totalTags}</div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">标签总数</div>
                  </div>
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="flex flex-wrap gap-3">
                {/* 添加网站按钮 */}
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200">
                      <Plus className="w-4 h-4 mr-2" />
                      添加网站
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{editingWebsite ? "编辑网站" : "添加新网站"}</DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            网站名称 <span className="text-red-500">*</span>
                          </label>
                          <Input
                            value={formData.name}
                            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                            placeholder="输入网站名称"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">
                            分类 <span className="text-red-500">*</span>
                          </label>
                          <Select
                            value={formData.section}
                            onValueChange={(value) => setFormData((prev) => ({ ...prev, section: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="选择分类" />
                            </SelectTrigger>
                            <SelectContent>
                              {sections.map((section) => (
                                <SelectItem key={section.key} value={section.key}>
                                  {section.icon} {section.title}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          网站描述 <span className="text-red-500">*</span>
                        </label>
                        <Textarea
                          value={formData.description}
                          onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                          placeholder="输入网站描述"
                          rows={3}
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          网站链接 <span className="text-red-500">*</span>
                        </label>
                        <Input
                          type="url"
                          value={formData.url}
                          onChange={(e) => setFormData((prev) => ({ ...prev, url: e.target.value }))}
                          placeholder="https://example.com"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">标签</label>
                        <Input
                          value={formData.tags}
                          onChange={(e) => setFormData((prev) => ({ ...prev, tags: e.target.value }))}
                          placeholder="标签1, 标签2, 标签3"
                        />
                        <p className="text-xs text-slate-500 mt-1">用逗号分隔多个标签</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Logo上传</label>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <Input type="file" accept="image/*" onChange={handleLogoUpload} className="flex-1" />
                            {logoPreview && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setLogoPreview(null)
                                  setFormData((prev) => ({ ...prev, customLogo: "" }))
                                }}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            )}
                          </div>

                          {logoPreview && (
                            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                              <img
                                src={logoPreview || "/placeholder.svg"}
                                alt="Logo预览"
                                className="w-12 h-12 object-cover rounded-lg"
                              />
                              <span className="text-sm text-slate-600 dark:text-slate-400">Logo预览</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-3 pt-4">
                        <Button type="submit" className="flex-1">
                          {editingWebsite ? "更新网站" : "创建网站"}
                        </Button>
                        <Button type="button" variant="outline" onClick={handleDialogClose}>
                          取消
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>

                {/* 分区管理按钮 */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="bg-white/80 dark:bg-slate-800/80">
                      <Settings className="w-4 h-4 mr-2" />
                      分区管理
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem
                      onClick={() => {
                        resetSectionForm()
                        setSectionDialogOpen(true)
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      添加新分区
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* 退出登录按钮 */}
                <Button
                  variant="outline"
                  className="bg-white/80 dark:bg-slate-800/80 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  退出登录
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 分区管理对话框 */}
        <Dialog open={sectionDialogOpen} onOpenChange={setSectionDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingSection ? "编辑分区" : "添加新分区"}</DialogTitle>
              <DialogDescription>
                {editingSection ? "修改分区信息" : "创建新的分区，分区标识创建后不可修改"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSectionSubmit} className="space-y-4">
              {!editingSection && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    分区标识 <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={sectionFormData.key}
                    onChange={(e) => setSectionFormData((prev) => ({ ...prev, key: e.target.value }))}
                    placeholder="英文标识，如funding"
                    required
                  />
                  <p className="text-xs text-slate-500 mt-1">只能包含字母和数字，且必须以字母开头</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">
                  分区名称 <span className="text-red-500">*</span>
                </label>
                <Input
                  value={sectionFormData.title}
                  onChange={(e) => setSectionFormData((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="如：融资信息"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">分区描述</label>
                <Textarea
                  value={sectionFormData.description}
                  onChange={(e) => setSectionFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="如：专业的项目融资和投资动态"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  分区图标 <span className="text-red-500">*</span>
                </label>
                <Input
                  value={sectionFormData.icon}
                  onChange={(e) => setSectionFormData((prev) => ({ ...prev, icon: e.target.value }))}
                  placeholder="如：🚀"
                  required
                />
                <p className="text-xs text-slate-500 mt-1">输入一个emoji表情符号</p>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleSectionDialogClose}>
                  取消
                </Button>
                <Button type="submit">{editingSection ? "更新分区" : "创建分区"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* 分区管理区域 */}
        {sections.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-slate-700/50 shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">分区管理</h2>
              <Button
                variant="outline"
                size="sm"
                className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/40 border-green-200 dark:border-green-800"
                onClick={handleSaveSectionOrder}
              >
                <Save className="w-4 h-4 mr-2" />
                保存排序
              </Button>
            </div>

            <div className="space-y-2">
              {sections.map((section) => (
                <div
                  key={section.key}
                  draggable
                  onDragStart={() => handleDragStart(section)}
                  onDragOver={(e) => handleDragOver(e, section)}
                  onDragEnd={handleDragEnd}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    draggedSection?.key === section.key
                      ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                      : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                  } ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="cursor-grab">
                      <GripVertical className="w-5 h-5 text-slate-400" />
                    </div>
                    <div className="w-8 h-8 flex items-center justify-center bg-slate-100 dark:bg-slate-700 rounded-lg text-xl">
                      {section.icon}
                    </div>
                    <div>
                      <div className="font-medium text-slate-800 dark:text-slate-200">{section.title}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        标识: {section.key} | 排序: {section.sort_order}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => handleEditSection(section)}
                    >
                      <Edit className="w-4 h-4" />
                      <span className="sr-only">编辑</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      onClick={() => handleConfirmDeleteSection(section)}
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="sr-only">删除</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* 网站内容区域 */}
        <div className="space-y-8">
          {sections.map((section) => {
            const sectionWebsites = websites.filter((w) => w.section === section.key) || []

            if (sectionWebsites.length === 0) return null

            return (
              <motion.section
                key={section.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-4">
                  <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-200">
                    {section.icon} {section.title}
                  </h2>
                  <div className="flex-1 h-px bg-gradient-to-r from-slate-300 to-transparent dark:from-slate-600"></div>
                  <span className="text-sm text-slate-500 dark:text-slate-400 bg-white/50 dark:bg-slate-800/50 px-3 py-1 rounded-full">
                    {sectionWebsites.length} 个
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  {sectionWebsites.map((website, index) => (
                    <motion.div
                      key={website.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="h-full"
                    >
                      <Card className="h-full group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                        <CardHeader className="pb-3">
                          <div className="flex items-start gap-3">
                            <motion.div
                              whileHover={{ rotate: 360 }}
                              transition={{ duration: 0.5 }}
                              className="w-12 h-12 rounded-xl overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 flex-shrink-0 border border-slate-200 dark:border-slate-600"
                            >
                              {website.custom_logo ? (
                                <img
                                  src={website.custom_logo || "/placeholder.svg"}
                                  alt={website.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-400">
                                  <Upload className="w-6 h-6" />
                                </div>
                              )}
                            </motion.div>
                            <div className="flex-1 min-w-0">
                              <CardTitle className="text-lg font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1 mb-2">
                                {website.name}
                              </CardTitle>
                              <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                                {website.description}
                              </p>
                            </div>
                          </div>
                        </CardHeader>

                        <CardContent className="pt-0 space-y-3">
                          {/* 标签区域 */}
                          <div className="flex flex-wrap gap-1.5 min-h-[28px]">
                            {website.tags.slice(0, 3).map((tag) => (
                              <Badge
                                key={tag}
                                variant="secondary"
                                className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                              >
                                {tag}
                              </Badge>
                            ))}
                            {website.tags.length > 3 && (
                              <Badge variant="secondary" className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-700">
                                +{website.tags.length - 3}
                              </Badge>
                            )}
                          </div>

                          {/* 网站链接 */}
                          <div className="text-xs text-slate-500 dark:text-slate-400 truncate">{website.url}</div>

                          {/* 操作按钮 */}
                          <div className="flex gap-2 pt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(website)}
                              className="flex-1 bg-transparent hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 border-slate-200 dark:border-slate-600"
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              编辑
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(website.id, website.name)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 border-slate-200 dark:border-slate-600 bg-transparent"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </motion.section>
            )
          })}
        </div>

        {websites.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center">
              <Upload className="w-12 h-12 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">暂无网站数据</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6">开始添加您的第一个网站吧</p>
            <Button
              onClick={() => setDialogOpen(true)}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Plus className="w-4 h-4 mr-2" />
              添加第一个网站
            </Button>
          </div>
        )}
      </div>

      {/* 删除分区确认对话框 */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除分区</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg">
                <AlertCircle className="w-5 h-5" />
                <span>此操作不可撤销，请确认是否继续？</span>
              </div>
              {sectionToDelete && (
                <p>
                  您即将删除分区{" "}
                  <strong>
                    {sectionToDelete.icon} {sectionToDelete.title}
                  </strong>
                </p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSection} className="bg-red-600 hover:bg-red-700 text-white">
              确认删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
