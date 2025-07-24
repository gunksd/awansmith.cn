import type { Website } from "./types"

// 默认数据作为fallback，实际数据从数据库获取
export const websiteData: Record<string, Website[]> = {
  funding: [],
  tradingData: [],
  faucet: [],
  airdrop: [],
  tutorial: [],
  exchange: [],
}

// 从API获取数据的函数
export async function fetchWebsiteData(): Promise<Record<string, Website[]>> {
  try {
    const response = await fetch("/api/websites")
    if (!response.ok) {
      throw new Error("获取数据失败")
    }
    return await response.json()
  } catch (error) {
    console.error("获取网站数据失败:", error)
    return websiteData // 返回默认数据
  }
}
