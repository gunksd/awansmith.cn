"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Plus, Edit, Trash2, Upload, X } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"

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
  icon: string
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export function AdminDashboard() {
  const [websites, setWebsites] = useState<Website[]>([])
  const [sections, setSections] = useState<Section[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [sectionDialogOpen, setSectionDialogOpen] = useState(false)
  const [editingWebsite, setEditingWebsite] = useState<Website | null>(null)
  const [editingSection, setEditingSection] = useState<Section | null>(null)
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

  const handleDeleteSection = async (id: number, title: string) => {
    if (!confirm(`确定要删除分区 "${title}" 吗？\n注意：删除分区前请确保该分区下没有网站。`)) return

    try {
      const response = await fetch(`/api/admin/sections/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "删除成功",
          description: `分区 ${title} 已删除`,
        })
        loadData()
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200">管理后台</h1>
      </div>

      <Tabs defaultValue="websites" className="space-y-6">
        <TabsList>
          <TabsTrigger value="websites">网站管理</TabsTrigger>
          <TabsTrigger value="sections">分区管理</TabsTrigger>
        </TabsList>

        <TabsContent value="websites" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">网站管理</h2>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {websites.map((website) => (
              <motion.div
                key={website.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="h-full"
              >
                <Card className="h-full">
                  <CardHeader className="pb-3">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0">
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
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg truncate">{website.name}</CardTitle>
                        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">{website.description}</p>
                        <Badge variant="outline" className="mt-1 text-xs">
                          {getSectionTitle(website.section)}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    <div className="flex flex-wrap gap-1">
                      {website.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(website)} className="flex-1">
                        <Edit className="w-4 h-4 mr-1" />
                        编辑
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(website.id, website.name)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {websites.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-500 dark:text-slate-400 mb-4">暂无网站数据</p>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                添加第一个网站
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="sections" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">分区管理</h2>
            <Dialog open={sectionDialogOpen} onOpenChange={setSectionDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700">
                  <Plus className="w-4 h-4 mr-2" />
                  添加分区
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingSection ? "编辑分区" : "添加新分区"}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSectionSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      分区标识 <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={sectionFormData.key}
                      onChange={(e) => setSectionFormData((prev) => ({ ...prev, key: e.target.value }))}
                      placeholder="例如: newSection"
                      disabled={!!editingSection}
                      required
                    />
                    <p className="text-xs text-slate-500 mt-1">只能包含字母、数字和下划线，创建后不可修改</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      分区标题 <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={sectionFormData.title}
                      onChange={(e) => setSectionFormData((prev) => ({ ...prev, title: e.target.value }))}
                      placeholder="例如: 新分区"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">图标</label>
                    <Input
                      value={sectionFormData.icon}
                      onChange={(e) => setSectionFormData((prev) => ({ ...prev, icon: e.target.value }))}
                      placeholder="📁"
                    />
                    <p className="text-xs text-slate-500 mt-1">建议使用emoji图标</p>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button type="submit" className="flex-1">
                      {editingSection ? "更新分区" : "创建分区"}
                    </Button>
                    <Button type="button" variant="outline" onClick={handleSectionDialogClose}>
                      取消
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sections.map((section) => (
              <Card key={section.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{section.icon}</div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{section.title}</CardTitle>
                      <p className="text-sm text-slate-500">标识: {section.key}</p>
                      <p className="text-sm text-slate-500">排序: {section.sort_order}</p>
                    </div>
                    <Badge variant={section.is_active ? "default" : "secondary"}>
                      {section.is_active ? "启用" : "禁用"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEditSection(section)} className="flex-1">
                      <Edit className="w-4 h-4 mr-1" />
                      编辑
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteSection(section.id, section.title)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {sections.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-500 dark:text-slate-400 mb-4">暂无分区数据</p>
              <Button onClick={() => setSectionDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                添加第一个分区
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
