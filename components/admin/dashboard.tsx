"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Plus, Edit, Trash2, Upload, X, BarChart3, Globe, Users } from "lucide-react"
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
  const sectionTitles = {
    funding: "🚀 融资信息",
    tradingData: "📊 交易数据工具",
    faucet: "💧 领水网站",
    airdrop: "🎁 空投网站",
    tutorial: "📚 小白教程",
    exchange: "💱 交易所邀请",
  }

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

  // 按分区分组网站数据
  const groupWebsitesBySection = (websites: Website[]) => {
    const grouped: Record<string, Website[]> = {}

    // 初始化所有分区
    Object.keys(sectionTitles).forEach((section) => {
      grouped[section] = []
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
    const totalSections = Object.values(grouped).filter((sites) => sites.length > 0).length
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

              {/* 添加按钮 */}
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-2.5">
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
          </div>
        </motion.div>

        {/* 网站内容区域 */}
        <div className="space-y-8">
          {Object.entries(sectionTitles).map(([sectionKey, title]) => {
            const sectionWebsites = groupWebsitesBySection(websites)[sectionKey] || []

            if (sectionWebsites.length === 0) return null

            return (
              <motion.section
                key={sectionKey}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-4">
                  <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-200">{title}</h2>
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
    </div>
  )
}
