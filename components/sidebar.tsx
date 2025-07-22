"use client"

import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, Twitter, ExternalLink, Gift } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useSidebar } from "@/components/sidebar-context"
import { useState } from "react"

export function Sidebar() {
  const { isCollapsed, setIsCollapsed } = useSidebar()
  const [showDonation, setShowDonation] = useState(false)

  const sidebarVariants = {
    expanded: { width: 320 },
    collapsed: { width: 80 },
  }

  const contentVariants = {
    expanded: { opacity: 1, x: 0 },
    collapsed: { opacity: 0, x: -20 },
  }

  return (
    <motion.aside
      initial="expanded"
      animate={isCollapsed ? "collapsed" : "expanded"}
      variants={sidebarVariants}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="fixed left-0 top-0 h-screen bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 shadow-xl z-50"
    >
      {/* 折叠按钮 */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-6 z-10 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-md hover:shadow-lg transition-all"
      >
        {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </Button>

      <div className="p-6 h-full overflow-y-auto">
        {/* 用户头像区域 */}
        <motion.div
          variants={contentVariants}
          animate={isCollapsed ? "collapsed" : "expanded"}
          className="text-center mb-8"
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="relative inline-block">
            <Image
              src="/avatar.png"
              alt="Awan Avatar"
              width={80}
              height={80}
              className="rounded-full mx-auto border-4 border-gradient-to-r from-blue-500 to-purple-600 shadow-lg"
            />
            <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-2 border-white dark:border-slate-900"></div>
          </motion.div>

          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-4"
            >
              <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">Awan Smith</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">永远学无止境</p>
            </motion.div>
          )}
        </motion.div>

        {!isCollapsed && (
          <>
            <Separator className="mb-6" />

            {/* 社交链接 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-3 mb-8"
            >
              <Link
                href="https://x.com/wnyn12075574"
                target="_blank"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
              >
                <Twitter className="h-5 w-5 text-blue-500 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium">Twitter</span>
                <ExternalLink className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>

              <Link
                href="https://linktr.ee/Awansmith"
                target="_blank"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
              >
                <Image
                  src="https://linktr.ee/favicon.ico"
                  alt="Linktree"
                  width={20}
                  height={20}
                  className="group-hover:scale-110 transition-transform"
                />
                <span className="text-sm font-medium">Linktree</span>
                <ExternalLink className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            </motion.div>

            <Separator className="mb-6" />

            {/* 打赏区域 */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <Button variant="outline" onClick={() => setShowDonation(!showDonation)} className="w-full mb-4 group">
                <Gift className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                支持一下
              </Button>

              <AnimatePresence>
                {showDonation && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    <Card>
                      <CardContent className="p-4 text-center">
                        <h4 className="font-semibold mb-2 text-orange-600">Bitcoin</h4>
                        <Image
                          src="/btc-qr.png"
                          alt="Bitcoin QR Code"
                          width={120}
                          height={120}
                          className="mx-auto mb-2 rounded-lg"
                        />
                        <p className="text-xs text-slate-600 dark:text-slate-400 break-all">
                          bc1pwswdr8jand4v8a45wuauzr6tc2fl92k7qxveqxjlk6mphmkyz3cszsj8cl
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4 text-center">
                        <h4 className="font-semibold mb-2 text-blue-600">Ethereum</h4>
                        <Image
                          src="/eth-qr.png"
                          alt="Ethereum QR Code"
                          width={120}
                          height={120}
                          className="mx-auto mb-2 rounded-lg"
                        />
                        <p className="text-xs text-slate-600 dark:text-slate-400 break-all">
                          0x41d5408ce2b7dfd9490c0e769edd493dc878058f
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </>
        )}
      </div>
    </motion.aside>
  )
}
