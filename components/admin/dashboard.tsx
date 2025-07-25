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

const sectionOptions = [
  { value: "funding", label: "🚀 融资信息" },
  { value: "tradingData", label: "📊 交易数据工具" },
  { value: "faucet", label: "💧 领水网站" },
  { value: "airdrop", label: "🎁 空投网站" },
  { value: "tutorial", label: "📚 小白教程" },
  { value: "exchange", label: "💱 交易所邀请" },
]

export function AdminDashboard() {
  const [websites, setWebsites] = useState<Website[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingWebsite, setEditingWebsite] = useState<Website | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    url: "",
    tags: "",
    customLogo: "",
    section: "",
  })
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadWebsites()
  }, [])

  const loadWebsites = async () => {
    try {
      const response = await fetch("/api/admin/websites")
      if (response.ok) {
        const data = await response.json()
        setWebsites(data)
      }
    } catch (error) {
      console.error("加载网站数据失败:", error)
      toast({
        title: "加载失败",
        description: "无法加载网站数据",
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
        loadWebsites()
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
        loadWebsites()
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

  const handleDialogClose = () => {
    setDialogOpen(false)
    resetForm()
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
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200">网站管理</h1>
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
                      {sectionOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
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
    </div>
  )
}
