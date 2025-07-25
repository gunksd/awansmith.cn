import { redirect } from "next/navigation"
import { checkAuth } from "@/lib/auth"
import { AdminDashboard } from "@/components/admin/dashboard"

export default async function AdminPage() {
  // 检查管理员权限
  const isAuthenticated = await checkAuth()

  if (!isAuthenticated) {
    redirect("/admin/login")
  }

  return <AdminDashboard />
}
