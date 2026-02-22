"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { useNavigationData } from "./data-provider"

// Lazy load the modal - don't include in main bundle
const WelcomeModal = dynamic(
  () => import("./welcome-modal").then((mod) => ({ default: mod.WelcomeModal })),
  { ssr: false },
)

export function WelcomeModalWrapper() {
  const { sections, websites, loading } = useNavigationData()
  const [shouldShow, setShouldShow] = useState(false)

  useEffect(() => {
    // Check localStorage early - skip mounting modal entirely if dismissed
    if (localStorage.getItem("welcome-modal-dismissed") === "true") return
    setShouldShow(true)
  }, [])

  const scrollToSection = (sectionKey: string) => {
    const element = document.getElementById(`section-${sectionKey}`)
    if (element) {
      const offset = 100
      window.scrollTo({
        top: element.offsetTop - offset,
        behavior: "smooth",
      })
    }
  }

  // Don't mount the modal at all if dismissed or data not ready
  if (!shouldShow || loading || sections.length === 0) {
    return null
  }

  return (
    <WelcomeModal
      sections={sections}
      websites={websites}
      onSectionClick={scrollToSection}
    />
  )
}
