"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Plus, Edit, Trash2, Upload, X, Settings, GripVertical } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"

interface Website {
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

interface Section {
  id: number
  key: string
  title: string
  icon: string
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

// 美观的加载动画组件
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="relative">
      {/* 外圈旋转动画 */}
      <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-200 dark:border-orange-800"></div>
      <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-600 border-t-transparent absolute top-0 left-0"></div>

      {/* 中心💸图标 */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.span
          className="text-2xl"
          style={{ display: "inline-block" }}
          animate={{ rotate: -360 }}
          transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        >
          💸
        </motion.span>
      </div>
    </div>
  </div>
)

export function AdminDashboard() {
  const [websites, setWebsites] = useState<Website[]>([])
  const [sections, setSections] = useState<Section[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [sectionDialogOpen, setSectionDialogOpen] = useState(false)
  const [editingWebsite, setEditingWebsite] = useState<Website | null>(null)
  const [editingSection, setEditingSection] = useState<Section | null>(null)
  const [draggedSection, setDraggedSection] = useState<Section | null>(null)
  const [draggedWebsite, setDraggedWebsite] = useState<Website | null>(null)
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
    icon: "📁",
  })
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [websitesResponse, sectionsResponse] = await Promise.all([
        fetch("/api/admin/websites"),
        fetch("/api/admin/sections"),
      ])

      if (websitesResponse.ok && sectionsResponse.ok) {
        const [websitesData, sectionsData] = await Promise.all([websitesResponse.json(), sectionsResponse.json()])
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
        const responseData = await response.json()

        if (editingWebsite) {
          // 编辑模式：更新本地状态中的网站数据
          setWebsites((prevWebsites) =>
            prevWebsites.map((website) =>
              website.id === editingWebsite.id ? { ...website, ...submitData, tags: submitData.tags } : website,
            ),
          )
        } else {
          // 新增模式：添加新网站到本地状态
          setWebsites((prevWebsites) => [...prevWebsites, responseData])
        }

        toast({
          title: editingWebsite ? "更新成功" : "创建成功",
          description: `网站 ${formData.name} ${editingWebsite ? "已更新" : "已创建"}`,
        })

        setDialogOpen(false)
        resetForm()
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

    if (!sectionFormData.key || !sectionFormData.title) {
      toast({
        title: "表单验证失败",
        description: "请填写分区标识和标题",
        variant: "destructive",
      })
      return
    }

    try {
      const url = editingSection ? `/api/admin/sections/${editingSection.id}` : "/api/admin/sections"
      const method = editingSection ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sectionFormData),
      })

      if (response.ok) {
        const responseData = await response.json()

        if (editingSection) {
          // 编辑模式：更新本地状态中的分区数据
          setSections((prevSections) =>
            prevSections.map((section) =>
              section.id === editingSection.id ? { ...section, ...sectionFormData } : section,
            ),
          )
        } else {
          // 新增模式：添加新分区到本地状态
          setSections((prevSections) => [...prevSections, responseData])
        }

        toast({
          title: editingSection ? "更新成功" : "创建成功",
          description: `分区 ${sectionFormData.title} ${editingSection ? "已更新" : "已创建"}`,
        })

        setSectionDialogOpen(false)
        resetSectionForm()
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || "操作失败")
      }
    } catch (error) {
      console.error("提交失败:", error)
      toast({
        title: "操作失败",
        description: error.message || "请检查网络连接后重试",
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
      icon: section.icon,
    })
    setSectionDialogOpen(true)
  }

  // 优化的删除网站功能 - 不重新加载整个页面
  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`确定要删除网站 "${name}" 吗？`)) return

    try {
      const response = await fetch(`/api/admin/websites/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        // 只从本地状态中移除该网站，不重新加载整个页面
        setWebsites((prevWebsites) => prevWebsites.filter((website) => website.id !== id))

        toast({
          title: "删除成功",
          description: `网站 ${name} 已删除`,
        })
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

  const handleDeleteSection = async (id: number, title: string) => {
    if (!confirm(`确定要删除分区 "${title}" 吗？\n注意：删除分区前请确保该分区下没有网站。`)) return

    try {
      const response = await fetch(`/api/admin/sections/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        // 只从本地状态中移除该分区，不重新加载整个页面
        setSections((prevSections) => prevSections.filter((section) => section.id !== id))

        toast({
          title: "删除成功",
          description: `分区 ${title} 已删除`,
        })
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || "删除失败")
      }
    } catch (error) {
      console.error("删除失败:", error)
      toast({
        title: "删除失败",
        description: error.message || "请检查网络连接后重试",
        variant: "destructive",
      })
    }
  }

  // 优化的分区状态切换 - 不重新加载整个页面
  const handleToggleSection = async (id: number, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/sections/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive }),
      })

      if (response.ok) {
        // 只更新本地状态，不重新加载整个页面
        setSections((prevSections) =>
          prevSections.map((section) => (section.id === id ? { ...section, is_active: isActive } : section)),
        )

        toast({
          title: "更新成功",
          description: `分区已${isActive ? "启用" : "禁用"}`,
        })
      } else {
        throw new Error("更新失败")
      }
    } catch (error) {
      console.error("更新失败:", error)
      toast({
        title: "更新失败",
        description: "请检查网络连接后重试",
        variant: "destructive",
      })
    }
  }

  // 分区拖拽排序功能
  const handleSectionDragStart = (e: React.DragEvent, section: Section) => {
    setDraggedSection(section)
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("text/html", "")
  }

  const handleSectionDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleSectionDrop = async (e: React.DragEvent, targetSection: Section) => {
    e.preventDefault()

    if (!draggedSection || draggedSection.id === targetSection.id) {
      setDraggedSection(null)
      return
    }

    try {
      const sortedSections = [...sections].sort((a, b) => a.sort_order - b.sort_order)
      const draggedIndex = sortedSections.findIndex((s) => s.id === draggedSection.id)
      const targetIndex = sortedSections.findIndex((s) => s.id === targetSection.id)

      // 创建新的排序数组
      const newSortedSections = [...sortedSections]
      const [removed] = newSortedSections.splice(draggedIndex, 1)
      newSortedSections.splice(targetIndex, 0, removed)

      // 生成新的排序值
      const updateData = newSortedSections.map((section, index) => ({
        id: section.id,
        sortOrder: index + 1,
      }))

      const response = await fetch("/api/admin/sections/order", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sections: updateData }),
      })

      if (response.ok) {
        // 更新本地状态
        setSections((prevSections) => {
          const updatedSections = prevSections.map((section) => {
            const update = updateData.find((u) => u.id === section.id)
            return update ? { ...section, sort_order: update.sortOrder } : section
          })
          return updatedSections
        })

        toast({
          title: "排序更新成功",
          description: `分区 "${draggedSection.title}" 已移动`,
        })
      } else {
        throw new Error("更新排序失败")
      }
    } catch (error) {
      console.error("更新排序失败:", error)
      toast({
        title: "更新失败",
        description: "请检查网络连接后重试",
        variant: "destructive",
      })
    } finally {
      setDraggedSection(null)
    }
  }

  const handleSectionDragEnd = () => {
    setDraggedSection(null)
  }

  // 网站拖拽排序功能
  const handleWebsiteDragStart = (e: React.DragEvent, website: Website) => {
    setDraggedWebsite(website)
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("text/html", "")
  }

  const handleWebsiteDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleWebsiteDrop = async (e: React.DragEvent, targetWebsite: Website) => {
    e.preventDefault()

    if (!draggedWebsite || draggedWebsite.id === targetWebsite.id || draggedWebsite.section !== targetWebsite.section) {
      setDraggedWebsite(null)
      return
    }

    try {
      // 获取同一分区的网站并按排序值排列
      const sectionWebsites = websites
        .filter((w) => w.section === draggedWebsite.section)
        .sort((a, b) => a.sort_order - b.sort_order)

      const draggedIndex = sectionWebsites.findIndex((w) => w.id === draggedWebsite.id)
      const targetIndex = sectionWebsites.findIndex((w) => w.id === targetWebsite.id)

      // 创建新的排序数组
      const newSortedWebsites = [...sectionWebsites]
      const [removed] = newSortedWebsites.splice(draggedIndex, 1)
      newSortedWebsites.splice(targetIndex, 0, removed)

      // 生成新的排序值
      const updateData = newSortedWebsites.map((website, index) => ({
        id: website.id,
        sortOrder: index + 1,
      }))

      const response = await fetch("/api/admin/websites/order", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ websites: updateData }),
      })

      if (response.ok) {
        // 更新本地状态
        setWebsites((prevWebsites) => {
          const updatedWebsites = prevWebsites.map((website) => {
            const update = updateData.find((u) => u.id === website.id)
            return update ? { ...website, sort_order: update.sortOrder } : website
          })
          return updatedWebsites
        })

        toast({
          title: "排序更新成功",
          description: `网站 "${draggedWebsite.name}" 已移动`,
        })
      } else {
        throw new Error("更新排序失败")
      }
    } catch (error) {
      console.error("更新排序失败:", error)
      toast({
        title: "更新失败",
        description: "请检查网络连接后重试",
        variant: "destructive",
      })
    } finally {
      setDraggedWebsite(null)
    }
  }

  const handleWebsiteDragEnd = () => {
    setDraggedWebsite(null)
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
      icon: "📁",
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

  const getSectionTitle = (sectionKey: string) => {
    const section = sections.find((s) => s.key === sectionKey)
    return section ? `${section.icon} ${section.title}` : sectionKey
  }

  // 按分区组织网站数据
  const getWebsitesBySection = () => {
    const sortedSections = [...sections].sort((a, b) => a.sort_order - b.sort_order)
    const websitesBySection: Record<string, { section: Section; websites: Website[] }> = {}

    sortedSections.forEach((section) => {
      websitesBySection[section.key] = {
        section,
        websites: websites
          .filter((website) => website.section === section.key)
          .sort((a, b) => a.sort_order - b.sort_order),
      }
    })

    return websitesBySection
  }

  if (loading) {
    return <LoadingSpinner />
  }

  const websitesBySection = getWebsitesBySection()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* 页面标题 */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
            管理后台
          </h1>
          <p className="text-slate-600 dark:text-slate-400">管理网站内容和分区设置</p>
        </motion.div>

        {/* 标签页 */}
        <Tabs defaultValue="websites" className="space-y-8">
          <div className="flex justify-center">
            <TabsList className="grid w-full max-w-md grid-cols-2 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
              <TabsTrigger value="websites" className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                网站管理
              </TabsTrigger>
              <TabsTrigger value="sections" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                分区管理
              </TabsTrigger>
            </TabsList>
          </div>

          {/* 网站管理 */}
          <TabsContent value="websites" className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between"
            >
              <div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">网站管理</h2>
                <p className="text-slate-600 dark:text-slate-400">管理导航网站的内容和信息 - 拖拽卡片可调整排序</p>
              </div>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-200">
                    <Plus className="w-4 h-4 mr-2" />
                    添加网站
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-md">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold">
                      {editingWebsite ? "编辑网站" : "添加新网站"}
                    </DialogTitle>
                  </DialogHeader>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
                          网站名称 <span className="text-red-500">*</span>
                        </label>
                        <Input
                          value={formData.name}
                          onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                          placeholder="输入网站名称"
                          className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
                          分类 <span className="text-red-500">*</span>
                        </label>
                        <Select
                          value={formData.section}
                          onValueChange={(value) => setFormData((prev) => ({ ...prev, section: value }))}
                        >
                          <SelectTrigger className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
                            <SelectValue placeholder="选择分类" />
                          </SelectTrigger>
                          <SelectContent>
                            {sections
                              .filter((s) => s.is_active)
                              .map((section) => (
                                <SelectItem key={section.key} value={section.key}>
                                  {section.icon} {section.title}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
                        网站描述 <span className="text-red-500">*</span>
                      </label>
                      <Textarea
                        value={formData.description}
                        onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                        placeholder="输入网站描述"
                        rows={3}
                        className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
                        网站链接 <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="url"
                        value={formData.url}
                        onChange={(e) => setFormData((prev) => ({ ...prev, url: e.target.value }))}
                        placeholder="https://example.com"
                        className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">标签</label>
                      <Input
                        value={formData.tags}
                        onChange={(e) => setFormData((prev) => ({ ...prev, tags: e.target.value }))}
                        placeholder="标签1, 标签2, 标签3"
                        className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm"
                      />
                      <p className="text-xs text-slate-500 mt-1">用逗号分隔多个标签</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
                        Logo上传
                      </label>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            className="flex-1 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm"
                          />
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
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex items-center gap-3 p-4 bg-gradient-to-r from-orange-50 to-pink-50 dark:from-slate-800 dark:to-slate-700 rounded-xl border border-orange-200 dark:border-slate-600"
                          >
                            <img
                              src={logoPreview || "/placeholder.svg"}
                              alt="Logo预览"
                              className="w-12 h-12 object-cover rounded-lg shadow-md"
                            />
                            <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">Logo预览</span>
                          </motion.div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button
                        type="submit"
                        className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                      >
                        {editingWebsite ? "更新网站" : "创建网站"}
                      </Button>
                      <Button type="button" variant="outline" onClick={handleDialogClose}>
                        取消
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </motion.div>

            {/* 按分区显示网站 */}
            <div className="space-y-8">
              {Object.entries(websitesBySection).map(([sectionKey, { section, websites: sectionWebsites }]) => (
                <motion.div
                  key={sectionKey}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{section.icon}</div>
                      <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">{section.title}</h3>
                    </div>
                    <div className="flex-1 h-px bg-gradient-to-r from-slate-300 to-transparent dark:from-slate-600"></div>
                    <Badge variant="secondary" className="text-sm">
                      {sectionWebsites.length} 个网站
                    </Badge>
                  </div>

                  {sectionWebsites.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {sectionWebsites.map((website, index) => (
                        <motion.div
                          key={website.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          whileHover={{ y: -4, scale: 1.02 }}
                          className={`h-full cursor-move ${draggedWebsite?.id === website.id ? "opacity-50" : ""}`}
                          draggable
                          onDragStart={(e) => handleWebsiteDragStart(e, website)}
                          onDragOver={handleWebsiteDragOver}
                          onDrop={(e) => handleWebsiteDrop(e, website)}
                          onDragEnd={handleWebsiteDragEnd}
                        >
                          <Card className="h-full group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm flex flex-col relative">
                            {/* 拖拽指示器 */}
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <GripVertical className="w-4 h-4 text-slate-400" />
                            </div>

                            <CardHeader className="pb-3 flex-shrink-0">
                              <div className="flex items-start gap-3">
                                <motion.div
                                  whileHover={{ rotate: 360 }}
                                  transition={{ duration: 0.5 }}
                                  className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 border border-slate-200 dark:border-slate-600"
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
                                  <CardTitle className="text-lg font-bold text-slate-800 dark:text-slate-200 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors line-clamp-1 mb-2">
                                    {website.name}
                                  </CardTitle>
                                  <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                                    {website.description}
                                  </p>
                                </div>
                              </div>
                            </CardHeader>

                            <CardContent className="flex-1 flex flex-col justify-between space-y-4">
                              <div className="flex flex-wrap gap-1.5">
                                {website.tags.map((tag) => (
                                  <Badge
                                    key={tag}
                                    variant="secondary"
                                    className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                                  >
                                    {tag}
                                  </Badge>
                                ))}
                              </div>

                              {/* 按钮区域 - 使用 mt-auto 确保始终在底部对齐 */}
                              <div className="flex gap-2 mt-auto">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEdit(website)}
                                  className="flex-1 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700 text-green-700 dark:text-green-300 hover:from-green-100 hover:to-green-200 dark:hover:from-green-800/30 dark:hover:to-green-700/30"
                                >
                                  <Edit className="w-4 h-4 mr-1" />
                                  编辑
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDelete(website.id, website.name)}
                                  className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 hover:from-red-100 hover:to-red-200 dark:hover:from-red-800/30 dark:hover:to-red-700/30"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-200 dark:border-slate-700">
                      <p className="text-slate-500 dark:text-slate-400">该分区暂无网站</p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            {websites.length === 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-full flex items-center justify-center">
                  <Upload className="w-12 h-12 text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">暂无网站数据</h3>
                <p className="text-slate-500 dark:text-slate-400 mb-6">开始添加您的第一个网站吧</p>
                <Button
                  onClick={() => setDialogOpen(true)}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  添加第一个网站
                </Button>
              </motion.div>
            )}
          </TabsContent>

          {/* 分区管理 */}
          <TabsContent value="sections" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between"
            >
              <div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">分区管理</h2>
                <p className="text-slate-600 dark:text-slate-400">管理网站分类和显示顺序 - 拖拽卡片可调整排序</p>
              </div>
              <Dialog open={sectionDialogOpen} onOpenChange={setSectionDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200">
                    <Plus className="w-4 h-4 mr-2" />
                    添加分区
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold">
                      {editingSection ? "编辑分区" : "添加新分区"}
                    </DialogTitle>
                  </DialogHeader>

                  <form onSubmit={handleSectionSubmit} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
                        分区标识 <span className="text-red-500">*</span>
                      </label>
                      <Input
                        value={sectionFormData.key}
                        onChange={(e) => setSectionFormData((prev) => ({ ...prev, key: e.target.value }))}
                        placeholder="例如: newSection"
                        disabled={!!editingSection}
                        className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm"
                        required
                      />
                      <p className="text-xs text-slate-500 mt-1">只能包含字母、数字和下划线，创建后不可修改</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
                        分区标题 <span className="text-red-500">*</span>
                      </label>
                      <Input
                        value={sectionFormData.title}
                        onChange={(e) => setSectionFormData((prev) => ({ ...prev, title: e.target.value }))}
                        placeholder="例如: 新分区"
                        className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">图标</label>
                      <Input
                        value={sectionFormData.icon}
                        onChange={(e) => setSectionFormData((prev) => ({ ...prev, icon: e.target.value }))}
                        placeholder="📁"
                        className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm"
                      />
                      <p className="text-xs text-slate-500 mt-1">建议使用emoji图标</p>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button
                        type="submit"
                        className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                      >
                        {editingSection ? "更新分区" : "创建分区"}
                      </Button>
                      <Button type="button" variant="outline" onClick={handleSectionDialogClose}>
                        取消
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </motion.div>

            {/* 拖拽排序提示 */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-orange-50 to-pink-50 dark:from-slate-800 dark:to-slate-700 p-4 rounded-xl border border-orange-200 dark:border-slate-600"
            >
              <div className="flex items-center gap-3">
                <GripVertical className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                <p className="text-sm text-orange-700 dark:text-orange-300">
                  <span className="font-medium">拖拽排序：</span>
                  按住分区卡片拖拽到目标位置即可调整显示顺序
                </p>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sections
                .sort((a, b) => a.sort_order - b.sort_order)
                .map((section, index) => (
                  <motion.div
                    key={section.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -4, scale: 1.02 }}
                    className={`cursor-move ${draggedSection?.id === section.id ? "opacity-50" : ""}`}
                    draggable
                    onDragStart={(e) => handleSectionDragStart(e, section)}
                    onDragOver={handleSectionDragOver}
                    onDrop={(e) => handleSectionDrop(e, section)}
                    onDragEnd={handleSectionDragEnd}
                  >
                    <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm relative">
                      {/* 拖拽指示器 */}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <GripVertical className="w-4 h-4 text-slate-400" />
                      </div>

                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-3">
                          <motion.div
                            whileHover={{ scale: 1.2, rotate: 360 }}
                            transition={{ duration: 0.3 }}
                            className="text-3xl p-2 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-xl"
                          >
                            {section.icon}
                          </motion.div>
                          <div className="flex-1">
                            <CardTitle className="text-lg font-bold text-slate-800 dark:text-slate-200 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                              {section.title}
                            </CardTitle>
                            <div className="space-y-1 mt-2">
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                <span className="font-medium">标识:</span> {section.key}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                <span className="font-medium">排序:</span> {section.sort_order}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <Badge
                              variant={section.is_active ? "default" : "secondary"}
                              className={
                                section.is_active
                                  ? "bg-gradient-to-r from-green-500 to-green-600 text-white border-0"
                                  : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                              }
                            >
                              {section.is_active ? "启用" : "禁用"}
                            </Badge>
                            <Switch
                              checked={section.is_active}
                              onCheckedChange={(checked) => handleToggleSection(section.id, checked)}
                              className="scale-75"
                            />
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditSection(section)}
                            className="flex-1 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:from-blue-100 hover:to-blue-200 dark:hover:from-blue-800/30 dark:hover:to-blue-700/30"
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            编辑
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteSection(section.id, section.title)}
                            className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 hover:from-red-100 hover:to-red-200 dark:hover:from-red-800/30 dark:hover:to-red-700/30"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
            </div>

            {sections.length === 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-full flex items-center justify-center">
                  <Settings className="w-12 h-12 text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">暂无分区数据</h3>
                <p className="text-slate-500 dark:text-slate-400 mb-6">开始添加您的第一个分区吧</p>
                <Button
                  onClick={() => setSectionDialogOpen(true)}
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  添加第一个分区
                </Button>
              </motion.div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
