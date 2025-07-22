"use client"

import { motion } from "framer-motion"
import { ExternalLink } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getFaviconUrl } from "@/lib/utils"
import type { Website } from "@/lib/types"

interface WebsiteCardProps {
  site: Website
}

export function WebsiteCard({ site }: WebsiteCardProps) {
  // 优先使用自定义logo，否则使用favicon
  const logoUrl = site.customLogo || getFaviconUrl(site.url)

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="h-full"
    >
      <Card className="h-full bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-2xl transition-all duration-300 group overflow-hidden flex flex-col">
        <CardHeader className="pb-3 flex-shrink-0">
          <div className="flex items-start gap-3">
            <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.5 }} className="flex-shrink-0">
              <Image
                src={logoUrl || "/placeholder.svg"}
                alt={`${site.name} logo`}
                width={32}
                height={32}
                className="rounded-lg shadow-sm object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = "/placeholder.svg?height=32&width=32&text=🌐"
                }}
              />
            </motion.div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-slate-800 dark:text-slate-200 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {site.name}
              </h3>
              {site.tags && site.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {site.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs px-2 py-0.5">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="pb-4 flex-1 flex flex-col">
          <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed flex-1">
            {site.description}
          </p>
        </CardContent>

        <CardFooter className="pt-0 flex-shrink-0">
          <Link href={site.url} target="_blank" rel="noopener noreferrer" className="w-full">
            <Button
              className="w-full group/btn bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 shadow-md hover:shadow-lg transition-all duration-300"
              size="sm"
            >
              <span className="mr-2">访问网站</span>
              <ExternalLink className="h-4 w-4 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform duration-200" />
            </Button>
          </Link>
        </CardFooter>

        {/* 悬浮效果装饰 */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          initial={false}
        />
      </Card>
    </motion.div>
  )
}
