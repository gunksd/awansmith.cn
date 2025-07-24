"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Plus, Edit, Trash2, Save, X, Upload } from "lucide-react"
import { ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { websiteData } from "@/lib/data"
import type { Website } from "@/lib/types"

export function AdminDashboard() {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState<Partial<Website & { section: string }>>({})
  const [logoPreview, setLogoPreview] = useState<string>("")
  const { toast } = useToast()

  const allSites = Object.entries(websiteData).flatMap(([section, sites]) =>
    sites.map((site) => ({ ...site, section })),
  )

  const handleEdit = (site: Website & { section: string }) => {
    setEditingId(site.id)
    setFormData(site)
    setLogoPreview(site.customLogo || "")
    setIsDialogOpen(true)
  }

  const handleAdd = () => {
    setEditingId(null)
    setFormData({
      name: "",
      description: "",
      url: "",
      tags: [],
      section: "funding",
      customLogo: "",
    })
    setLogoPreview("")
    setIsDialogOpen(true)
  }

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // 检查文件类型
      if (!file.type.startsWith("image/")) {
        toast({
          title: "文件类型错误",
          description: "请选择图片文件",
          variant: "destructive",
        })
        return
      }

      // 检查文件大小 (限制为2MB)
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
        setLogoPreview(result)
        setFormData({ ...formData, customLogo: result })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = async () => {
    // 验证必填字段
    if (!formData.name || !formData.url || !formData.description) {
      toast({
        title: "请填写完整信息",
        description: "网站名称、链接和描述为必填项",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch("/api/admin/websites", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast({
          title: "保存成功",
          description: editingId ? "网站信息已更新" : "新网站已添加",
        })
        setIsDialogOpen(false)
        setEditingId(null)
        setFormData({})
        setLogoPreview("")
      } else {
        throw new Error("保存失败")
      }
    } catch (error) {
      toast({
        title: "保存失败",
        description: "请稍后重试",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("确定要删除这个网站吗？")) return

    try {
      const response = await fetch(`/api/admin/websites/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "删除成功",
          description: "网站已被删除",
        })
      } else {
        throw new Error("删除失败")
      }
    } catch (error) {
      toast({
        title: "删除失败",
        description: "请稍后重试",
        variant: "destructive",
      })
    }
  }

  const handleCancel = () => {
    setIsDialogOpen(false)
    setEditingId(null)
    setFormData({})
    setLogoPreview("")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200">网站管理</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">管理导航网站的内容和信息</p>
          </div>
          <Button onClick={handleAdd} className="bg-gradient-to-r from-blue-500 to-purple-600">
            <Plus className="h-4 w-4 mr-2" />
            添加网站
          </Button>
        </div>

        {/* 添加/编辑对话框 */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? "编辑网站" : "添加新网站"}</DialogTitle>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Logo上传区域 */}
              <div className="space-y-4">
                <Label>网站Logo</Label>
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    {logoPreview ? (
                      <div className="w-16 h-16 rounded-lg border-2 border-dashed border-gray-300 overflow-hidden">
                        <img
                          src={logoPreview || "/placeholder.svg"}
                          alt="Logo预览"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 dark:bg-gray-800">
                        <ImageIcon className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                      id="logo-upload"
                    />
                    <Label htmlFor="logo-upload" className="cursor-pointer">
                      <div className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <Upload className="h-4 w-4" />
                        <span className="text-sm">上传Logo</span>
                      </div>
                    </Label>
                    <p className="text-xs text-gray-500 mt-1">支持 JPG、PNG 格式，大小不超过2MB</p>
                  </div>
                </div>
              </div>

              {/* 基本信息 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">网站名称 *</Label>
                  <Input
                    id="name"
                    value={formData.name || ""}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="输入网站名称"
                  />
                </div>
                <div>
                  <Label htmlFor="url">网站链接 *</Label>
                  <Input
                    id="url"
                    value={formData.url || ""}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    placeholder="https://example.com"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">网站描述 *</Label>
                <Textarea
                  id="description"
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="输入网站描述"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="section">所属分区</Label>
                  <Select
                    value={formData.section || ""}
                    onValueChange={(value) => setFormData({ ...formData, section: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择分区" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="funding">融资信息</SelectItem>
                      <SelectItem value="tradingData">交易数据工具</SelectItem>
                      <SelectItem value="faucet">领水网站</SelectItem>
                      <SelectItem value="airdrop">空投网站</SelectItem>
                      <SelectItem value="tutorial">小白教程</SelectItem>
                      <SelectItem value="exchange">交易所邀请</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="tags">标签 (用逗号分隔)</Label>
                  <Input
                    id="tags"
                    value={formData.tags?.join(", ") || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        tags: e.target.value
                          .split(",")
                          .map((tag) => tag.trim())
                          .filter(Boolean),
                      })
                    }
                    placeholder="标签1, 标签2, 标签3"
                  />
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button onClick={handleCancel} variant="outline">
                  <X className="h-4 w-4 mr-2" />
                  取消
                </Button>
                <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                  <Save className="h-4 w-4 mr-2" />
                  保存
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* 网站列表 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {allSites.map((site, index) => (
            <motion.div
              key={site.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      {/* 网站Logo */}
                      <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-800">
                        {site.customLogo ? (
                          <img
                            src={site.customLogo || "/placeholder.svg"}
                            alt={site.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="h-5 w-5 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg truncate">{site.name}</CardTitle>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{site.section}</p>
                      </div>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(site)} className="h-8 w-8">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(site.id)}
                        className="h-8 w-8 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">{site.description}</p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {site.tags?.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <a
                    href={site.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 truncate block"
                  >
                    {site.url}
                  </a>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
