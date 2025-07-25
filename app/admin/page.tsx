import { redirect } from "next/navigation"
import { AdminDashboard } from "@/components/admin/dashboard"
import { checkAuth } from "@/lib/auth"

export default async function AdminPage() {
  const isAuthenticated = await checkAuth()

  if (!isAuthenticated) {
    redirect("/admin/login")
  }

  return <AdminDashboard />
}
