import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 获取网站favicon的URL
 * @param url 网站URL
 * @returns favicon URL
 */
export function getFaviconUrl(url: string): string {
  try {
    const domain = new URL(url).hostname

    // 对于需要梯子的网站，使用备用方案
    const blockedDomains = [
      "x.com",
      "twitter.com",
      "github.com",
      "youtube.com",
      "google.com",
      "facebook.com",
      "instagram.com",
      "telegram.org",
      "discord.com",
      "reddit.com",
    ]

    const isBlocked = blockedDomains.some((blocked) => domain.includes(blocked))

    if (isBlocked) {
      // 使用国内可访问的favicon服务或返回默认图标
      return `/placeholder.svg?height=32&width=32&text=${encodeURIComponent(domain.charAt(0).toUpperCase())}`
    }

    // 使用多个备用favicon服务
    const faviconServices = [
      `https://favicon.yandex.net/favicon/${domain}`,
      `https://www.google.com/s2/favicons?sz=64&domain_url=${domain}`,
      `https://icons.duckduckgo.com/ip3/${domain}.ico`,
    ]

    // 返回第一个服务，如果失败会在组件中fallback
    return faviconServices[0]
  } catch {
    return "/placeholder.svg?height=32&width=32&text=🌐"
  }
}

/**
 * 防抖函数
 * @param func 要防抖的函数
 * @param wait 等待时间（毫秒）
 * @returns 防抖后的函数
 */
export function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout)
    }

    timeout = setTimeout(() => {
      func(...args)
    }, wait)
  }
}

/**
 * 节流函数
 * @param func 要节流的函数
 * @param limit 时间限制（毫秒）
 * @returns 节流后的函数
 */
export function throttle<T extends (...args: any[]) => any>(func: T, limit: number): (...args: Parameters<T>) => void {
  let inThrottle = false

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => {
        inThrottle = false
      }, limit)
    }
  }
}
