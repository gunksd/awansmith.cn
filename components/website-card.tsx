"use client"

import { motion } from "framer-motion"
import { ExternalLink } from "lucide-react"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import type { Website } from "@/lib/types"

const MAX_CARD_DELAY = 0.6

interface WebsiteCardProps {
  website: Website
  index?: number
  sectionDelay?: number
}

export function WebsiteCard({ website, index = 0, sectionDelay = 0 }: WebsiteCardProps) {
  const cardDelay = sectionDelay + Math.min(index * 0.03, MAX_CARD_DELAY - sectionDelay)

  const handleClick = () => {
    window.open(website.url, "_blank", "noopener,noreferrer")
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: cardDelay, duration: 0.3, ease: "easeOut" }}
      className="h-full"
    >
      <div
        onClick={handleClick}
        className="group relative h-full cursor-pointer rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 transition-all duration-200 hover:border-blue-300/60 dark:hover:border-blue-700/40 hover:shadow-lg hover:shadow-blue-500/[0.04] hover:-translate-y-0.5"
      >
        {/* Header */}
        <div className="flex items-start gap-3.5 mb-3">
          {/* Logo */}
          <div className="flex-shrink-0">
            {website.customLogo ? (
              <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-800 flex items-center justify-center ring-1 ring-slate-200/60 dark:ring-slate-700/60">
                <Image
                  src={website.customLogo}
                  alt={website.name}
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = "none"
                    const fallback = target.parentElement?.querySelector(".fallback") as HTMLElement
                    if (fallback) fallback.classList.remove("hidden")
                  }}
                />
                <div className="fallback hidden w-full h-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white font-semibold text-sm">
                  {website.name.charAt(0).toUpperCase()}
                </div>
              </div>
            ) : (
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                {website.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Title + link icon */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-sm text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 leading-snug">
                {website.name}
              </h3>
              <ExternalLink className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-slate-300 dark:text-slate-600 group-hover:text-blue-500 transition-colors" />
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-[13px] leading-relaxed text-muted-foreground line-clamp-2 mb-3.5">
          {website.description}
        </p>

        {/* Tags */}
        {website.tags && website.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-auto">
            {website.tags.slice(0, 3).map((tag, i) => (
              <Badge
                key={i}
                variant="secondary"
                className="text-[11px] px-2 py-0.5 bg-slate-50 dark:bg-slate-800/80 text-muted-foreground border-0 font-normal"
              >
                {tag}
              </Badge>
            ))}
            {website.tags.length > 3 && (
              <Badge
                variant="secondary"
                className="text-[11px] px-2 py-0.5 bg-slate-50 dark:bg-slate-800/80 text-muted-foreground/60 border-0 font-normal"
              >
                +{website.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}
