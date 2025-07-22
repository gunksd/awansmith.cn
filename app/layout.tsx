import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Web3导航 - 最全面的区块链资源导航",
  description: "专业的Web3导航网站，提供融资信息、交易数据工具、测试网水龙头、空投机会、新手教程和交易所邀请链接",
  keywords: "Web3, 区块链, 导航, 融资, 空投, 水龙头, DeFi, NFT, 交易数据",
  authors: [{ name: "Awan Smith" }],
  openGraph: {
    title: "Web3导航 - 最全面的区块链资源导航",
    description: "专业的Web3导航网站，一站式获取区块链相关资源",
    type: "website",
    locale: "zh_CN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Web3导航",
    description: "专业的Web3导航网站",
    creator: "@wnyn12075574",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
  generator: "v0.dev",
  // 移除icons配置，让Next.js自动使用app/icon.tsx和app/apple-icon.tsx
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="theme-color" content="#3b82f6" />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
