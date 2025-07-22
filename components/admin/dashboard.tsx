"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Plus, Edit, Trash2, Save, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { websiteData } from "@/lib/data"
import type { Website } from "@/lib/types"

export function AdminDashboard() {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [formData, setFormData] = useState<Partial<Website>>({})
  const { toast } = useToast()

  const allSites = Object.entries(websiteData).flatMap(([section, sites]) =>
    sites.map((site) => ({ ...site, section })),
  )

  const handleEdit = (site: Website & { section: string }) => {
    setEditingId(site.id)
    setFormData(site)
    setIsAdding(false)
  }

  const handleAdd = () => {
    setIsAdding(true)
    setEditingId(null)
    setFormData({
      name: "",
      description: "",
      url: "",
      tags: [],
      section: "funding",
    })
  }

  const handleSave = async () => {
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
        setEditingId(null)
        setIsAdding(false)
        setFormData({})
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
    setEditingId(null)
    setIsAdding(false)
    setFormData({})
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

        {/* 添加/编辑表单 */}
        {(isAdding || editingId) && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <Card>
              <CardHeader>
                <CardTitle>{editingId ? "编辑网站" : "添加新网站"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">网站名称</Label>
                    <Input
                      id="name"
                      value={formData.name || ""}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="输入网站名称"
                    />
                  </div>
                  <div>
                    <Label htmlFor="url">网站链接</Label>
                    <Input
                      id="url"
                      value={formData.url || ""}
                      onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                      placeholder="https://example.com"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">网站描述</Label>
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

                <div className="flex gap-2">
                  <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                    <Save className="h-4 w-4 mr-2" />
                    保存
                  </Button>
                  <Button onClick={handleCancel} variant="outline">
                    <X className="h-4 w-4 mr-2" />
                    取消
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* 网站列表 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {allSites.map((site, index) => (
            <motion.div
              key={site.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{site.name}</CardTitle>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{site.section}</p>
                    </div>
                    <div className="flex gap-1">
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
