import { redirect } from "next/navigation"
import { verifyAuth } from "@/lib/auth"
import { AdminDashboard } from "@/components/admin/dashboard"

export default async function AdminPage() {
  console.log("[ADMIN PAGE] 检查认证状态...")

  // 服务器端认证检查
  const isAuthenticated = await verifyAuth()

  if (!isAuthenticated) {
    console.log("[ADMIN PAGE] 未认证，重定向到登录页")
    redirect("/admin/login")
  }

  console.log("[ADMIN PAGE] 认证成功，显示管理面板")

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <AdminDashboard />
    </div>
  )
}
