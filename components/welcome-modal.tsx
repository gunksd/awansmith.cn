"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { X, Twitter, ExternalLink } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import type { Section, Website } from "@/lib/types";

interface WelcomeModalProps {
  sections: Section[];
  websites: Website[];
  onSectionClick: (sectionKey: string) => void;
}

export function WelcomeModal({
  sections,
  websites,
  onSectionClick,
}: WelcomeModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const closeTimerRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (sections.length === 0) return;
    // Delay show to let the page settle first
    const timer = setTimeout(() => {
      setIsOpen(true);
      // Trigger CSS transition on next frame
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setIsVisible(true));
      });
    }, 1000);
    return () => clearTimeout(timer);
  }, [sections.length]);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(() => setIsOpen(false), 200);
    if (dontShowAgain) {
      localStorage.setItem("welcome-modal-dismissed", "true");
    }
  }, [dontShowAgain]);

  const handleSectionClick = useCallback(
    (sectionKey: string) => {
      onSectionClick(sectionKey);
      setIsVisible(false);
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
      closeTimerRef.current = setTimeout(() => setIsOpen(false), 200);
      if (dontShowAgain) {
        localStorage.setItem("welcome-modal-dismissed", "true");
      }
    },
    [onSectionClick, dontShowAgain],
  );

  const sectionsWithWebsites = useMemo(() => {
    return sections
      .filter((s) => websites.some((w) => w.section === s.key))
      .sort((a, b) => a.sort_order - b.sort_order);
  }, [sections, websites]);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay - solid color on mobile, no blur */}
      <div
        onClick={handleClose}
        className="fixed inset-0 z-[9999] transition-opacity duration-200"
        style={{
          backgroundColor: isVisible ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0)",
        }}
      />

      {/* Modal container */}
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-4 pointer-events-none">
        <div
          role="dialog"
          aria-modal="true"
          aria-label="欢迎来到Web3的世界"
          onKeyDown={(e) => {
            if (e.key === "Escape") handleClose();
          }}
          className="pointer-events-auto w-full max-w-2xl max-h-[90vh] sm:max-h-[85vh] overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-xl mx-1 sm:mx-4 transition-all duration-200 ease-out"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible
              ? "scale(1) translateY(0)"
              : "scale(0.97) translateY(8px)",
          }}
        >
          {/* Header */}
          <div className="relative pb-2 sm:pb-3 px-4 sm:px-6 pt-4 sm:pt-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="absolute right-2 top-2 sm:right-3 sm:top-3 w-8 h-8 rounded-full touch-manipulation z-10"
            >
              <X className="h-4 w-4" />
            </Button>

            <div className="text-center pr-6 sm:pr-10">
              <div className="text-4xl sm:text-5xl mb-2 sm:mb-3">🌟</div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gradient mb-1 sm:mb-1.5">
                欢迎来到Web3的世界
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                祝您的梦想和财富都能在这里找到完美答案！
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[60vh] space-y-4 sm:space-y-5 px-4 sm:px-6 pb-4 sm:pb-6">
            {/* Twitter follow */}
            <div className="flex items-center justify-between gap-3 p-3 sm:p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200/50 dark:border-blue-800/30">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-blue-400/60 shadow-sm flex-shrink-0">
                  <Image
                    src="/avatar.png"
                    alt="Awan"
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900">
                    <Twitter className="w-2.5 h-2.5 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-sm">关注我的推特</h3>
                  <p className="text-xs text-muted-foreground">
                    获取最新的Web3资讯
                  </p>
                </div>
              </div>
              <Button
                asChild
                size="sm"
                className="bg-blue-500 hover:bg-blue-600 text-white shadow-sm flex-shrink-0"
              >
                <a
                  href="https://x.com/0xawansmith"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5"
                >
                  关注 <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </Button>
            </div>

            <Separator />

            {/* Section directory */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                📚 网站分区目录
                <span className="text-xs font-normal text-muted-foreground">
                  (点击跳转)
                </span>
              </h3>

              <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
                {sectionsWithWebsites.map((section) => {
                  const count = websites.filter(
                    (w) => w.section === section.key,
                  ).length;
                  return (
                    <button
                      key={section.id}
                      onClick={() => handleSectionClick(section.key)}
                      className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg bg-white dark:bg-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700/40 hover:border-blue-300/60 dark:hover:border-blue-700/40 transition-colors text-left active:scale-[0.97] touch-manipulation"
                    >
                      <div className="text-lg sm:text-xl w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-md bg-slate-50 dark:bg-slate-700/60 flex-shrink-0">
                        {section.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-xs sm:text-sm text-foreground truncate">
                          {section.title}
                        </h4>
                        <p className="text-[10px] sm:text-xs text-muted-foreground">
                          {count} 个网站
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-200/60 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="dont-show-again"
                  checked={dontShowAgain}
                  onCheckedChange={(checked) =>
                    setDontShowAgain(checked as boolean)
                  }
                />
                <label
                  htmlFor="dont-show-again"
                  className="text-xs text-muted-foreground cursor-pointer select-none"
                >
                  不再显示此欢迎页面
                </label>
              </div>
              <Button
                onClick={handleClose}
                size="sm"
                className="bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 text-white shadow-sm"
              >
                开始探索
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
