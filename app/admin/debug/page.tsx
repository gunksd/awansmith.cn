import { DebugLoginForm } from "@/components/admin/debug-login-form"

export default function DebugPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">登录调试页面</h1>
        <DebugLoginForm />
      </div>
    </div>
  )
}
