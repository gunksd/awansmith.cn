"use client";

import type React from "react";
import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Twitter,
  ExternalLink,
  Gift,
  Menu,
  X,
  Copy,
  Check,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useSidebar } from "@/components/sidebar-context";
import { useToast } from "@/hooks/use-toast";
import { createPortal } from "react-dom";

/* ── Animated Avatar ── */
function AnimatedAvatar({ size = 72 }: { size?: number }) {
  const padding = 3;
  const outerSize = size + padding * 2 + 6; // ring thickness

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: outerSize, height: outerSize }}
    >
      {/* Rotating gradient ring */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "conic-gradient(from 0deg, #3b82f6, #8b5cf6, #ec4899, #f59e0b, #10b981, #3b82f6)",
          padding: 2.5,
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
      >
        <div className="w-full h-full rounded-full bg-white dark:bg-slate-900" />
      </motion.div>

      {/* Pulsing glow behind avatar */}
      <motion.div
        className="absolute rounded-full"
        style={{
          inset: 4,
          background:
            "conic-gradient(from 180deg, #3b82f6, #8b5cf6, #ec4899, #3b82f6)",
          filter: "blur(8px)",
          opacity: 0.3,
        }}
        animate={{ rotate: -360, scale: [1, 1.08, 1] }}
        transition={{
          rotate: { duration: 4, repeat: Infinity, ease: "linear" },
          scale: { duration: 2, repeat: Infinity, ease: "easeInOut" },
        }}
      />

      {/* Avatar image */}
      <div
        className="relative z-10 rounded-full overflow-hidden shadow-md"
        style={{ width: size, height: size }}
      >
        <Image
          src="/avatar.png"
          alt="Awan Avatar"
          width={size}
          height={size}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Online indicator */}
      <div className="absolute z-20 bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-slate-900">
        <motion.div
          className="absolute inset-0 rounded-full bg-green-400"
          animate={{ scale: [1, 1.6, 1], opacity: [0.7, 0, 0.7] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
    </div>
  );
}

/* ── Copy Button ── */
function CopyButton({ address, type }: { address: string; type: string }) {
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();
  const timeoutRef = useRef<NodeJS.Timeout>();

  const handleCopy = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      try {
        await navigator.clipboard.writeText(address);
        setIsCopied(true);
        toast({
          title: "复制成功",
          description: `${type}地址已复制到剪贴板`,
          duration: 2000,
          className: "z-[10000]",
        });
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => setIsCopied(false), 2000);
      } catch {
        toast({
          title: "复制失败",
          description: "请手动复制地址",
          variant: "destructive",
          duration: 2000,
          className: "z-[10000]",
        });
      }
    },
    [address, type, toast],
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleCopy}
      className="h-7 w-7 flex-shrink-0"
    >
      {isCopied ? (
        <Check className="h-3.5 w-3.5 text-green-500" />
      ) : (
        <Copy className="h-3.5 w-3.5 text-muted-foreground" />
      )}
    </Button>
  );
}

/* ── 3D Tilt Card for QR codes ── */
function TiltCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [hovering, setHovering] = useState(false);

  const onMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    setTilt({
      x: ((e.clientY - rect.top - cy) / cy) * -10,
      y: ((e.clientX - rect.left - cx) / cx) * 10,
    });
  }, []);

  return (
    <div className="[perspective:600px]">
      <div
        ref={ref}
        onMouseMove={onMove}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => {
          setHovering(false);
          setTilt({ x: 0, y: 0 });
        }}
        className={className}
        style={{
          transform: hovering
            ? `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(1.03)`
            : "rotateX(0) rotateY(0) scale(1)",
          transition: hovering
            ? "transform 0.1s ease-out"
            : "transform 0.4s ease-out",
          transformStyle: "preserve-3d",
        }}
      >
        {/* Shine */}
        {hovering && (
          <div
            className="pointer-events-none absolute inset-0 rounded-lg"
            style={{
              background: `radial-gradient(circle at ${((tilt.y / 10 + 1) / 2) * 100}% ${((tilt.x / -10 + 1) / 2) * 100}%, rgba(255,255,255,0.18) 0%, transparent 60%)`,
            }}
          />
        )}
        {children}
      </div>
    </div>
  );
}

const btcAddress =
  "bc1pwswdr8jand4v8a45wuauzr6tc2fl92k7qxveqxjlk6mphmkyz3cszsj8cl";
const ethAddress = "0x41d5408ce2b7dfd9490c0e769edd493dc878058f";

/* ── Donation Section with 3D cards ── */
function DonationSection({
  showDonation,
  toggleDonation,
}: {
  showDonation: boolean;
  toggleDonation: (e: React.MouseEvent) => void;
}) {
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

      <div
        className={`space-y-3 transition-all duration-300 ${showDonation ? "opacity-100 max-h-[1000px]" : "opacity-0 max-h-0 overflow-hidden"}`}
      >
        {[
          {
            name: "Bitcoin",
            color: "text-orange-500",
            borderColor:
              "hover:border-orange-300 dark:hover:border-orange-700/60",
            addr: btcAddress,
            qr: "/btc-qr.png",
          },
          {
            name: "Ethereum",
            color: "text-blue-500",
            borderColor: "hover:border-blue-300 dark:hover:border-blue-700/60",
            addr: ethAddress,
            qr: "/eth-qr.png",
          },
        ].map((coin) => (
          <TiltCard
            key={coin.name}
            className={`relative p-3.5 bg-slate-50/80 dark:bg-slate-800/50 rounded-lg border border-slate-200/60 dark:border-slate-700/40 ${coin.borderColor} transition-colors cursor-default`}
          >
            <div className="text-center mb-2.5">
              <h4 className={`text-xs font-semibold ${coin.color} mb-2`}>
                {coin.name}
              </h4>
              <Image
                src={coin.qr}
                alt={`${coin.name} QR`}
                width={88}
                height={88}
                className="mx-auto rounded-md"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <p className="text-[10px] text-muted-foreground break-all leading-relaxed flex-1 font-mono">
                {coin.addr}
              </p>
              <CopyButton address={coin.addr} type={coin.name} />
            </div>
          </TiltCard>
        ))}
      </div>
    </div>
  );
}

/* ── Social Links ── */
function SocialLinks({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="space-y-1.5">
      {[
        {
          href: "https://x.com/0xawansmith",
          icon: <Twitter className="h-4 w-4 text-blue-500" />,
          label: "Twitter",
        },
        {
          href: "https://linktr.ee/Awansmith",
          icon: (
            <Image
              src="/logos/linktree.png"
              alt="Linktree"
              width={16}
              height={16}
            />
          ),
          label: "Linktree",
        },
      ].map((link) => (
        <Link
          key={link.label}
          href={link.href}
          target="_blank"
          onClick={onNavigate}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors group"
        >
          {link.icon}
          <span className="text-sm font-medium text-foreground/80">
            {link.label}
          </span>
          <ExternalLink className="h-3.5 w-3.5 ml-auto text-muted-foreground/40 group-hover:text-muted-foreground/70 transition-colors" />
        </Link>
      ))}
    </div>
  );
}

/* ── Main Sidebar ── */
export function Sidebar({ variant }: { variant?: "mobile-trigger" }) {
  const { isCollapsed, setIsCollapsed } = useSidebar();
  const [showDonation, setShowDonation] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileOpen]);

  const toggleDonation = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDonation((prev) => !prev);
  }, []);

  // If this is just the mobile trigger button (rendered inside header)
  if (variant === "mobile-trigger") {
    return (
      <>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMobileOpen(true)}
          className="w-9 h-9 -ml-1 touch-manipulation"
          aria-label="打开菜单"
        >
          <Menu className="h-5 w-5" />
        </Button>
        {mounted &&
          createPortal(
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
                    className="fixed left-0 top-0 h-full w-72 max-w-[85vw] bg-white dark:bg-slate-900 border-r border-slate-200/60 dark:border-slate-800 shadow-2xl z-[9999] safe-top"
                  >
                    <div className="p-4 sm:p-5 h-full overflow-y-auto overscroll-contain">
                      <div className="flex justify-end mb-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setIsMobileOpen(false)}
                          className="w-8 h-8 touch-manipulation"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Avatar */}
                      <div className="text-center">
                        <AnimatedAvatar size={56} />
                        <div className="mt-3">
                          <h3 className="font-bold text-base text-foreground">
                            Awan Smith
                          </h3>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            永远学无止境
                          </p>
                        </div>
                      </div>

                      <Separator className="my-4" />
                      <SocialLinks onNavigate={() => setIsMobileOpen(false)} />
                      <Separator className="my-4" />
                      <DonationSection
                        showDonation={showDonation}
                        toggleDonation={toggleDonation}
                      />
                    </div>
                  </motion.aside>
                </>
              )}
            </AnimatePresence>,
            document.body,
          )}
      </>
    );
  }

  // Desktop sidebar (hidden on mobile)
  return (
    <div className="hidden md:block">
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
          {isCollapsed ? (
            <ChevronRight className="h-3 w-3" />
          ) : (
            <ChevronLeft className="h-3 w-3" />
          )}
        </Button>

        <div className="p-5 h-full overflow-y-auto">
          {/* Avatar */}
          <div className="text-center mb-6">
            <AnimatedAvatar size={isCollapsed ? 48 : 72} />

            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="mt-3"
              >
                <h3 className="font-bold text-base text-foreground">
                  Awan Smith
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  永远学无止境
                </p>
              </motion.div>
            )}
          </div>

          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
            >
              <Separator className="mb-5" />
              <SocialLinks />
              <Separator className="my-5" />
              <DonationSection
                showDonation={showDonation}
                toggleDonation={toggleDonation}
              />
            </motion.div>
          )}
        </div>
      </motion.aside>
    </div>
  );
}
