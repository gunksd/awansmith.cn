"use client"

import type React from "react"
import { useState, useEffect, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, Twitter, ExternalLink, Gift, Menu, X, Copy, Check } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useSidebar } from "@/components/sidebar-context"
import { useToast } from "@/hooks/use-toast"
import { createPortal } from "react-dom"

function CopyButton({ address, type }: { address: string; type: string }) {
  const [isCopied, setIsCopied] = useState(false)
  const { toast } = useToast()
  const timeoutRef = useRef<NodeJS.Timeout>()

  const handleCopy = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      try {
        await navigator.clipboard.writeText(address)
        setIsCopied(true)
        toast({ title: "复制成功", description: `${type}地址已复制到剪贴板`, duration: 2000, className: "z-[10000]" })
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
        timeoutRef.current = setTimeout(() => setIsCopied(false), 2000)
      } catch {
        toast({ title: "复制失败", description: "请手动复制地址", variant: "destructive", duration: 2000, className: "z-[10000]" })
      }
    },
    [address, type, toast],
  )

  useEffect(() => {
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current) }
  }, [])

  return (
    <Button variant="ghost" size="icon" onClick={handleCopy} className="h-7 w-7 flex-shrink-0">
      {isCopied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5 text-muted-foreground" />}
    </Button>
  )
}

const btcAddress = "bc1pwswdr8jand4v8a45wuauzr6tc2fl92k7qxveqxjlk6mphmkyz3cszsj8cl"
const ethAddress = "0x41d5408ce2b7dfd9490c0e769edd493dc878058f"

function DonationSection({ showDonation, toggleDonation }: { showDonation: boolean; toggleDonation: (e: React.MouseEvent) => void }) {
  return (
    <div className="space-y-3">
      <Button
        variant="outline"
        onClick={toggleDonation}
        className="w-full py-2.5 flex items-center justify-center gap-2 text-sm bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800"
      >
        <Gift className="h-4 w-4" />
        支持一下
      </Button>

      <div className={`space-y-3 transition-all duration-300 ${showDonation ? "opacity-100 max-h-[1000px]" : "opacity-0 max-h-0 overflow-hidden"}`}>
        {[
          { name: "Bitcoin", color: "text-orange-500", addr: btcAddress, qr: "/btc-qr.png" },
          { name: "Ethereum", color: "text-blue-500", addr: ethAddress, qr: "/eth-qr.png" },
        ].map((coin) => (
          <div key={coin.name} className="p-3.5 bg-slate-50/80 dark:bg-slate-800/50 rounded-lg border border-slate-200/60 dark:border-slate-700/40">
            <div className="text-center mb-2.5">
              <h4 className={`text-xs font-semibold ${coin.color} mb-2`}>{coin.name}</h4>
              <Image src={coin.qr} alt={`${coin.name} QR`} width={88} height={88} className="mx-auto rounded-md" />
            </div>
            <div className="flex items-center gap-1.5">
              <p className="text-[10px] text-muted-foreground break-all leading-relaxed flex-1 font-mono">
                {coin.addr}
              </p>
              <CopyButton address={coin.addr} type={coin.name} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function SocialLinks({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="space-y-1.5">
      {[
        { href: "https://x.com/wnyn12075574", icon: <Twitter className="h-4 w-4 text-blue-500" />, label: "Twitter" },
        { href: "https://linktr.ee/Awansmith", icon: <Image src="/logos/linktree.png" alt="Linktree" width={16} height={16} />, label: "Linktree" },
      ].map((link) => (
        <Link
          key={link.label}
          href={link.href}
          target="_blank"
          onClick={onNavigate}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors group"
        >
          {link.icon}
          <span className="text-sm font-medium text-foreground/80">{link.label}</span>
          <ExternalLink className="h-3.5 w-3.5 ml-auto text-muted-foreground/40 group-hover:text-muted-foreground/70 transition-colors" />
        </Link>
      ))}
    </div>
  )
}

function UserInfo({ size = "default" }: { size?: "default" | "compact" }) {
  const imgSize = size === "compact" ? 56 : 72
  return (
    <div className="text-center">
      <div className="relative inline-block">
        <Image
          src="/avatar.png"
          alt="Awan Avatar"
          width={imgSize}
          height={imgSize}
          className="rounded-full border-2 border-slate-200 dark:border-slate-700 shadow-sm"
        />
        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-slate-900"></div>
      </div>
      <div className="mt-3">
        <h3 className="font-bold text-base text-foreground">Awan Smith</h3>
        <p className="text-xs text-muted-foreground mt-0.5">永远学无止境</p>
      </div>
    </div>
  )
}

export function Sidebar() {
  const { isCollapsed, setIsCollapsed } = useSidebar()
  const [showDonation, setShowDonation] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const toggleDonation = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setShowDonation((prev) => !prev)
  }, [])

  // Mobile sidebar
  const MobileModal = () => (
    <AnimatePresence>
      {isMobileOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9998]"
          />
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 260 }}
            className="fixed left-0 top-0 h-full w-72 max-w-[80vw] bg-white dark:bg-slate-900 border-r border-slate-200/60 dark:border-slate-800 shadow-2xl z-[9999]"
          >
            <div className="p-5 h-full overflow-y-auto">
              <div className="flex justify-end mb-3">
                <Button variant="ghost" size="icon" onClick={() => setIsMobileOpen(false)} className="w-7 h-7">
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <UserInfo size="compact" />
              <Separator className="my-5" />
              <SocialLinks onNavigate={() => setIsMobileOpen(false)} />
              <Separator className="my-5" />
              <DonationSection showDonation={showDonation} toggleDonation={toggleDonation} />
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )

  const MobileMenuButton = () => (
    <>
      <Button variant="ghost" size="icon" onClick={() => setIsMobileOpen(true)} className="w-8 h-8">
        <Menu className="h-5 w-5" />
      </Button>
      {mounted && createPortal(<MobileModal />, document.body)}
    </>
  )

  // Desktop sidebar
  const DesktopSidebar = () => (
    <motion.aside
      initial="expanded"
      animate={isCollapsed ? "collapsed" : "expanded"}
      variants={{ expanded: { width: 320 }, collapsed: { width: 80 } }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="fixed left-0 top-0 h-screen bg-white dark:bg-slate-900 border-r border-slate-200/60 dark:border-slate-800 z-50"
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-6 z-10 w-6 h-6 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow"
      >
        {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </Button>

      <div className="p-5 h-full overflow-y-auto">
        {/* Avatar - always visible */}
        <div className="text-center mb-6">
          <div className="relative inline-block">
            <Image
              src="/avatar.png"
              alt="Awan Avatar"
              width={isCollapsed ? 48 : 72}
              height={isCollapsed ? 48 : 72}
              className="rounded-full border-2 border-slate-200 dark:border-slate-700 shadow-sm transition-all"
            />
            {!isCollapsed && (
              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-slate-900"></div>
            )}
          </div>

          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="mt-3"
            >
              <h3 className="font-bold text-base text-foreground">Awan Smith</h3>
              <p className="text-xs text-muted-foreground mt-0.5">永远学无止境</p>
            </motion.div>
          )}
        </div>

        {!isCollapsed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
            <Separator className="mb-5" />
            <SocialLinks />
            <Separator className="my-5" />
            <DonationSection showDonation={showDonation} toggleDonation={toggleDonation} />
          </motion.div>
        )}
      </div>
    </motion.aside>
  )

  return (
    <>
      <div className="md:hidden">
        <MobileMenuButton />
      </div>
      <div className="hidden md:block">
        <DesktopSidebar />
      </div>
    </>
  )
}
