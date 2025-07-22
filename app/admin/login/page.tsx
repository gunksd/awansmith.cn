import { LoginForm } from "@/components/admin/login-form"

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200">管理后台</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">请登录以管理网站内容</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
