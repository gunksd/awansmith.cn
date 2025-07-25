"use client"

import type React from "react"
import { useState, useEffect, useMemo, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  ExternalLink,
  Copy,
  Grid3X3,
  List,
  Globe,
  Settings,
  Activity,
  Layers,
  ToggleLeft,
  ToggleRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import type { Website } from "@/lib/types"

// 分区接口定义
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

interface SectionStats {
  totalSections: number
  activeSections: number
  websiteCount: { [key: string]: number }
}

// 统计卡片组件
const StatsCard = ({
  title,
  value,
  icon: Icon,
  gradient,
  change,
}: {
  title: string
  value: string | number
  icon: React.ElementType
  gradient: string
  change?: string
}) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden">
    <Card className="border-0 shadow-lg backdrop-blur-sm bg-white/80 dark:bg-gray-900/80">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
            {change && <p className="text-sm text-green-600 dark:text-green-400 mt-1">{change}</p>}
          </div>
          <div className={`p-3 rounded-full bg-gradient-to-r ${gradient}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
)

// 网站卡片组件
const WebsiteCard = ({
  website,
  onEdit,
  onDelete,
  onToggleVisibility,
  viewMode,
}: {
  website: Website
  onEdit: (website: Website) => void
  onDelete: (id: number) => void
  onToggleVisibility: (id: number, isVisible: boolean) => void
  viewMode: "grid" | "list"
}) => {
  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(website.url)
    toast.success("链接已复制到剪贴板")
  }, [website.url])

  const handleVisit = useCallback(() => {
    window.open(website.url, "_blank")
  }, [website.url])

  if (viewMode === "list") {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-lg border border-gray-200/50 dark:border-gray-700/50 p-4 hover:shadow-lg transition-all duration-200"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
              {website.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 dark:text-white truncate">{website.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{website.description}</p>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant={website.is_visible ? "default" : "secondary"}>
                  {website.is_visible ? "可见" : "隐藏"}
                </Badge>
                <span className="text-xs text-gray-500">{website.section_key}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={handleCopyLink}>
              <Copy className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleVisit}>
              <ExternalLink className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => onEdit(website)}>
                  <Edit className="h-4 w-4 mr-2" />
                  编辑
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onToggleVisibility(website.id, !website.is_visible)}>
                  {website.is_visible ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                  {website.is_visible ? "隐藏" : "显示"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDelete(website.id)} className="text-red-600">
                  <Trash2 className="h-4 w-4 mr-2" />
                  删除
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -5 }}
      className="group"
    >
      <Card className="border-0 shadow-lg backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 hover:shadow-xl transition-all duration-300 overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
              {website.name.charAt(0)}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => onEdit(website)}>
                  <Edit className="h-4 w-4 mr-2" />
                  编辑
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onToggleVisibility(website.id, !website.is_visible)}>
                  {website.is_visible ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                  {website.is_visible ? "隐藏" : "显示"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDelete(website.id)} className="text-red-600">
                  <Trash2 className="h-4 w-4 mr-2" />
                  删除
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-1">{website.name}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">{website.description}</p>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Badge variant={website.is_visible ? "default" : "secondary"}>
                {website.is_visible ? "可见" : "隐藏"}
              </Badge>
              <span className="text-xs text-gray-500">{website.section_key}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Button variant="ghost" size="sm" onClick={handleCopyLink}>
                <Copy className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleVisit}>
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// 分区卡片组件
const SectionCard = ({
  section,
  websiteCount,
  onEdit,
  onDelete,
  onToggleStatus,
}: {
  section: Section
  websiteCount: number
  onEdit: (section: Section) => void
  onDelete: (id: number) => void
  onToggleStatus: (id: number, isActive: boolean) => void
}) => (
  <motion.div
    layout
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    whileHover={{ y: -5 }}
    className="group"
  >
    <Card className="border-0 shadow-lg backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 hover:shadow-xl transition-all duration-300 overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="text-2xl">{section.icon}</div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                <Settings className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => onEdit(section)}>
                <Edit className="h-4 w-4 mr-2" />
                编辑
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onToggleStatus(section.id, !section.is_active)}>
                {section.is_active ? <ToggleLeft className="h-4 w-4 mr-2" /> : <ToggleRight className="h-4 w-4 mr-2" />}
                {section.is_active ? "禁用" : "启用"}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(section.id)}
                className="text-red-600"
                disabled={websiteCount > 0}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                删除
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{section.title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">{section.description}</p>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Badge variant={section.is_active ? "default" : "secondary"}>{section.is_active ? "启用" : "禁用"}</Badge>
            <span className="text-xs text-gray-500">#{section.key}</span>
          </div>
          <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400">
            <Globe className="h-4 w-4" />
            <span>{websiteCount}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
)

// 主组件
export function AdminDashboard() {
  // 状态管理
  const [websites, setWebsites] = useState<Website[]>([])
  const [sections, setSections] = useState<Section[]>([])
  const [sectionStats, setSectionStats] = useState<SectionStats>({
    totalSections: 0,
    activeSections: 0,
    websiteCount: {},
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSection, setSelectedSection] = useState<string>("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [activeTab, setActiveTab] = useState("websites")

  // 对话框状态
  const [isWebsiteDialogOpen, setIsWebsiteDialogOpen] = useState(false)
  const [isSectionDialogOpen, setIsSectionDialogOpen] = useState(false)
  const [editingWebsite, setEditingWebsite] = useState<Website | null>(null)
  const [editingSection, setEditingSection] = useState<Section | null>(null)

  // 表单状态
  const [websiteForm, setWebsiteForm] = useState({
    name: "",
    url: "",
    description: "",
    section_key: "",
    is_visible: true,
  })

  const [sectionForm, setSectionForm] = useState({
    key: "",
    title: "",
    description: "",
    icon: "",
    sort_order: 0,
    is_active: true,
  })

  // 获取数据
  const fetchWebsites = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/websites")
      const data = await response.json()
      if (data.success) {
        setWebsites(data.data)
      }
    } catch (error) {
      console.error("获取网站列表失败:", error)
      toast.error("获取网站列表失败")
    }
  }, [])

  const fetchSections = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/sections")
      const data = await response.json()
      if (data.success) {
        setSections(data.data)
        setSectionStats(data.stats)
      }
    } catch (error) {
      console.error("获取分区列表失败:", error)
      toast.error("获取分区列表失败")
    }
  }, [])

  const fetchData = useCallback(async () => {
    setLoading(true)
    await Promise.all([fetchWebsites(), fetchSections()])
    setLoading(false)
  }, [fetchWebsites, fetchSections])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // 过滤和搜索
  const filteredWebsites = useMemo(() => {
    return websites.filter((website) => {
      const matchesSearch =
        website.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        website.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesSection = selectedSection === "all" || website.section_key === selectedSection
      return matchesSearch && matchesSection
    })
  }, [websites, searchTerm, selectedSection])

  const filteredSections = useMemo(() => {
    return sections.filter(
      (section) =>
        section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        section.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        section.key.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }, [sections, searchTerm])

  // 统计数据
  const stats = useMemo(() => {
    const totalWebsites = websites.length
    const visibleWebsites = websites.filter((w) => w.is_visible).length
    const totalSections = sections.length
    const activeSections = sections.filter((s) => s.is_active).length

    return {
      totalWebsites,
      visibleWebsites,
      totalSections,
      activeSections,
    }
  }, [websites, sections])

  // 网站操作
  const handleCreateWebsite = async () => {
    try {
      const response = await fetch("/api/admin/websites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(websiteForm),
      })
      const data = await response.json()

      if (data.success) {
        toast.success("网站创建成功")
        setIsWebsiteDialogOpen(false)
        resetWebsiteForm()
        fetchWebsites()
      } else {
        toast.error(data.error || "创建失败")
      }
    } catch (error) {
      toast.error("创建网站失败")
    }
  }

  const handleUpdateWebsite = async () => {
    if (!editingWebsite) return

    try {
      const response = await fetch(`/api/admin/websites/${editingWebsite.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(websiteForm),
      })
      const data = await response.json()

      if (data.success) {
        toast.success("网站更新成功")
        setIsWebsiteDialogOpen(false)
        resetWebsiteForm()
        fetchWebsites()
      } else {
        toast.error(data.error || "更新失败")
      }
    } catch (error) {
      toast.error("更新网站失败")
    }
  }

  const handleDeleteWebsite = async (id: number) => {
    if (!confirm("确定要删除这个网站吗？")) return

    try {
      const response = await fetch(`/api/admin/websites/${id}`, {
        method: "DELETE",
      })
      const data = await response.json()

      if (data.success) {
        toast.success("网站删除成功")
        fetchWebsites()
      } else {
        toast.error(data.error || "删除失败")
      }
    } catch (error) {
      toast.error("删除网站失败")
    }
  }

  const handleToggleWebsiteVisibility = async (id: number, isVisible: boolean) => {
    try {
      const response = await fetch(`/api/admin/websites/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_visible: isVisible }),
      })
      const data = await response.json()

      if (data.success) {
        toast.success(`网站已${isVisible ? "显示" : "隐藏"}`)
        fetchWebsites()
      } else {
        toast.error(data.error || "操作失败")
      }
    } catch (error) {
      toast.error("操作失败")
    }
  }

  // 分区操作
  const handleCreateSection = async () => {
    try {
      const response = await fetch("/api/admin/sections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sectionForm),
      })
      const data = await response.json()

      if (data.success) {
        toast.success("分区创建成功")
        setIsSectionDialogOpen(false)
        resetSectionForm()
        fetchSections()
      } else {
        toast.error(data.error || "创建失败")
      }
    } catch (error) {
      toast.error("创建分区失败")
    }
  }

  const handleUpdateSection = async () => {
    if (!editingSection) return

    try {
      const response = await fetch(`/api/admin/sections/${editingSection.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sectionForm),
      })
      const data = await response.json()

      if (data.success) {
        toast.success("分区更新成功")
        setIsSectionDialogOpen(false)
        resetSectionForm()
        fetchSections()
      } else {
        toast.error(data.error || "更新失败")
      }
    } catch (error) {
      toast.error("更新分区失败")
    }
  }

  const handleDeleteSection = async (id: number) => {
    const section = sections.find((s) => s.id === id)
    const websiteCount = sectionStats.websiteCount[section?.key || ""] || 0

    if (websiteCount > 0) {
      toast.error("无法删除分区，还有网站关联到此分区")
      return
    }

    if (!confirm("确定要删除这个分区吗？")) return

    try {
      const response = await fetch(`/api/admin/sections/${id}`, {
        method: "DELETE",
      })
      const data = await response.json()

      if (data.success) {
        toast.success("分区删除成功")
        fetchSections()
      } else {
        toast.error(data.error || "删除失败")
      }
    } catch (error) {
      toast.error("删除分区失败")
    }
  }

  const handleToggleSectionStatus = async (id: number, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/sections/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: isActive }),
      })
      const data = await response.json()

      if (data.success) {
        toast.success(`分区已${isActive ? "启用" : "禁用"}`)
        fetchSections()
      } else {
        toast.error(data.error || "操作失败")
      }
    } catch (error) {
      toast.error("操作失败")
    }
  }

  // 表单处理
  const resetWebsiteForm = () => {
    setWebsiteForm({
      name: "",
      url: "",
      description: "",
      section_key: "",
      is_visible: true,
    })
    setEditingWebsite(null)
  }

  const resetSectionForm = () => {
    setSectionForm({
      key: "",
      title: "",
      description: "",
      icon: "",
      sort_order: 0,
      is_active: true,
    })
    setEditingSection(null)
  }

  const openWebsiteDialog = (website?: Website) => {
    if (website) {
      setEditingWebsite(website)
      setWebsiteForm({
        name: website.name,
        url: website.url,
        description: website.description,
        section_key: website.section_key,
        is_visible: website.is_visible,
      })
    } else {
      resetWebsiteForm()
    }
    setIsWebsiteDialogOpen(true)
  }

  const openSectionDialog = (section?: Section) => {
    if (section) {
      setEditingSection(section)
      setSectionForm({
        key: section.key,
        title: section.title,
        description: section.description,
        icon: section.icon,
        sort_order: section.sort_order,
        is_active: section.is_active,
      })
    } else {
      resetSectionForm()
    }
    setIsSectionDialogOpen(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* 页面标题 */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">管理面板</h1>
          <p className="text-gray-600 dark:text-gray-400">管理您的网站和分区</p>
        </motion.div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="总网站数"
            value={stats.totalWebsites}
            icon={Globe}
            gradient="from-blue-500 to-blue-600"
            change="+12% 本月"
          />
          <StatsCard
            title="可见网站"
            value={stats.visibleWebsites}
            icon={Eye}
            gradient="from-green-500 to-green-600"
            change="+8% 本月"
          />
          <StatsCard
            title="总分区数"
            value={stats.totalSections}
            icon={Layers}
            gradient="from-purple-500 to-purple-600"
            change="+2 本月"
          />
          <StatsCard
            title="活跃分区"
            value={stats.activeSections}
            icon={Activity}
            gradient="from-orange-500 to-orange-600"
            change="稳定"
          />
        </div>

        {/* 主要内容 */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
            <TabsTrigger value="websites" className="flex items-center space-x-2">
              <Globe className="h-4 w-4" />
              <span>网站管理</span>
            </TabsTrigger>
            <TabsTrigger value="sections" className="flex items-center space-x-2">
              <Layers className="h-4 w-4" />
              <span>分区管理</span>
            </TabsTrigger>
          </TabsList>

          {/* 网站管理 */}
          <TabsContent value="websites" className="space-y-6">
            {/* 工具栏 */}
            <Card className="border-0 shadow-lg backdrop-blur-sm bg-white/80 dark:bg-gray-900/80">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="搜索网站..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-full sm:w-64"
                      />
                    </div>
                    <Select value={selectedSection} onValueChange={setSelectedSection}>
                      <SelectTrigger className="w-full sm:w-48">
                        <SelectValue placeholder="选择分区" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">所有分区</SelectItem>
                        {sections.map((section) => (
                          <SelectItem key={section.key} value={section.key}>
                            {section.icon} {section.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant={viewMode === "grid" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setViewMode("grid")}
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === "list" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setViewMode("list")}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                    <Button onClick={() => openWebsiteDialog()}>
                      <Plus className="h-4 w-4 mr-2" />
                      添加网站
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 网站列表 */}
            <AnimatePresence mode="wait">
              {filteredWebsites.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-12"
                >
                  <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">没有找到网站</p>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={
                    viewMode === "grid"
                      ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                      : "space-y-4"
                  }
                >
                  {filteredWebsites.map((website, index) => (
                    <motion.div
                      key={website.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <WebsiteCard
                        website={website}
                        onEdit={openWebsiteDialog}
                        onDelete={handleDeleteWebsite}
                        onToggleVisibility={handleToggleWebsiteVisibility}
                        viewMode={viewMode}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>

          {/* 分区管理 */}
          <TabsContent value="sections" className="space-y-6">
            {/* 工具栏 */}
            <Card className="border-0 shadow-lg backdrop-blur-sm bg-white/80 dark:bg-gray-900/80">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="搜索分区..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-full sm:w-64"
                    />
                  </div>
                  <Button onClick={() => openSectionDialog()}>
                    <Plus className="h-4 w-4 mr-2" />
                    添加分区
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 分区列表 */}
            <AnimatePresence mode="wait">
              {filteredSections.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-12"
                >
                  <Layers className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">没有找到分区</p>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                >
                  {filteredSections.map((section, index) => (
                    <motion.div
                      key={section.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <SectionCard
                        section={section}
                        websiteCount={sectionStats.websiteCount[section.key] || 0}
                        onEdit={openSectionDialog}
                        onDelete={handleDeleteSection}
                        onToggleStatus={handleToggleSectionStatus}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>
        </Tabs>

        {/* 网站对话框 */}
        <Dialog open={isWebsiteDialogOpen} onOpenChange={setIsWebsiteDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingWebsite ? "编辑网站" : "添加网站"}</DialogTitle>
              <DialogDescription>{editingWebsite ? "修改网站信息" : "添加新的网站到导航"}</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  名称
                </Label>
                <Input
                  id="name"
                  value={websiteForm.name}
                  onChange={(e) => setWebsiteForm({ ...websiteForm, name: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="url" className="text-right">
                  链接
                </Label>
                <Input
                  id="url"
                  value={websiteForm.url}
                  onChange={(e) => setWebsiteForm({ ...websiteForm, url: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  描述
                </Label>
                <Textarea
                  id="description"
                  value={websiteForm.description}
                  onChange={(e) => setWebsiteForm({ ...websiteForm, description: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="section" className="text-right">
                  分区
                </Label>
                <Select
                  value={websiteForm.section_key}
                  onValueChange={(value) => setWebsiteForm({ ...websiteForm, section_key: value })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="选择分区" />
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
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="visible" className="text-right">
                  可见
                </Label>
                <Switch
                  id="visible"
                  checked={websiteForm.is_visible}
                  onCheckedChange={(checked) => setWebsiteForm({ ...websiteForm, is_visible: checked })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsWebsiteDialogOpen(false)}>
                取消
              </Button>
              <Button onClick={editingWebsite ? handleUpdateWebsite : handleCreateWebsite}>
                {editingWebsite ? "更新" : "创建"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 分区对话框 */}
        <Dialog open={isSectionDialogOpen} onOpenChange={setIsSectionDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingSection ? "编辑分区" : "添加分区"}</DialogTitle>
              <DialogDescription>{editingSection ? "修改分区信息" : "添加新的分区"}</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="key" className="text-right">
                  标识符
                </Label>
                <Input
                  id="key"
                  value={sectionForm.key}
                  onChange={(e) => setSectionForm({ ...sectionForm, key: e.target.value })}
                  className="col-span-3"
                  placeholder="例如: funding"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  标题
                </Label>
                <Input
                  id="title"
                  value={sectionForm.title}
                  onChange={(e) => setSectionForm({ ...sectionForm, title: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  描述
                </Label>
                <Textarea
                  id="description"
                  value={sectionForm.description}
                  onChange={(e) => setSectionForm({ ...sectionForm, description: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="icon" className="text-right">
                  图标
                </Label>
                <Input
                  id="icon"
                  value={sectionForm.icon}
                  onChange={(e) => setSectionForm({ ...sectionForm, icon: e.target.value })}
                  className="col-span-3"
                  placeholder="例如: 🚀"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="sort_order" className="text-right">
                  排序
                </Label>
                <Input
                  id="sort_order"
                  type="number"
                  value={sectionForm.sort_order}
                  onChange={(e) => setSectionForm({ ...sectionForm, sort_order: Number.parseInt(e.target.value) || 0 })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="active" className="text-right">
                  启用
                </Label>
                <Switch
                  id="active"
                  checked={sectionForm.is_active}
                  onCheckedChange={(checked) => setSectionForm({ ...sectionForm, is_active: checked })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsSectionDialogOpen(false)}>
                取消
              </Button>
              <Button onClick={editingSection ? handleUpdateSection : handleCreateSection}>
                {editingSection ? "更新" : "创建"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

// 默认导出
export default AdminDashboard
