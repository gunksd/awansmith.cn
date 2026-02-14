"use client"

import { useRef, useState, useCallback } from "react"
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
  const cardRef = useRef<HTMLDivElement>(null)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current
    if (!card) return
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    // Max 8 degrees tilt
    setTilt({
      x: ((y - centerY) / centerY) * -8,
      y: ((x - centerX) / centerX) * 8,
    })
  }, [])

  const handleMouseEnter = useCallback(() => setIsHovering(true), [])
  const handleMouseLeave = useCallback(() => {
    setIsHovering(false)
    setTilt({ x: 0, y: 0 })
  }, [])

  const handleClick = () => {
    window.open(website.url, "_blank", "noopener,noreferrer")
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: cardDelay, duration: 0.3, ease: "easeOut" }}
      className="h-full [perspective:800px]"
    >
      <div
        ref={cardRef}
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="group relative h-full cursor-pointer rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 transition-shadow duration-300 hover:shadow-xl hover:shadow-blue-500/[0.08] dark:hover:shadow-blue-500/[0.04]"
        style={{
          transform: isHovering
            ? `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateY(-4px) scale(1.02)`
            : "rotateX(0deg) rotateY(0deg) translateY(0px) scale(1)",
          transition: isHovering
            ? "transform 0.1s ease-out, box-shadow 0.3s ease"
            : "transform 0.4s ease-out, box-shadow 0.3s ease",
          transformStyle: "preserve-3d",
        }}
      >
        {/* Shine overlay */}
        <div
          className="pointer-events-none absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: isHovering
              ? `radial-gradient(circle at ${((tilt.y / 8 + 1) / 2) * 100}% ${((tilt.x / -8 + 1) / 2) * 100}%, rgba(255,255,255,0.15) 0%, transparent 60%)`
              : "none",
          }}
        />

        {/* Header */}
        <div className="flex items-start gap-3.5 mb-3" style={{ transform: "translateZ(20px)" }}>
          {/* Logo with spin on hover */}
          <motion.div
            className="flex-shrink-0"
            whileHover={{ rotate: 360, scale: 1.1 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          >
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
          </motion.div>

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
