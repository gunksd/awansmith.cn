"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function DebugLoginForm() {
  const [username, setUsername] = useState("awan")
  const [password, setPassword] = useState("awansmith123")
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setDebugInfo(null)

    try {
      const response = await fetch("/api/admin/debug-full-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()
      setDebugInfo({
        status: response.status,
        statusText: response.statusText,
        data: data,
      })
    } catch (error) {
      setDebugInfo({
        error: String(error),
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>调试登录表单</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">用户名</label>
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="输入用户名"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">密码</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="输入密码"
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "登录中..." : "调试登录"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {debugInfo && (
        <Card>
          <CardHeader>
            <CardTitle>调试信息</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">{JSON.stringify(debugInfo, null, 2)}</pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
