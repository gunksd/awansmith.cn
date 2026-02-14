"use client"

import { WelcomeModal } from "./welcome-modal"
import { useNavigationData } from "./data-provider"

export function WelcomeModalWrapper() {
  const { sections, websites, loading } = useNavigationData()

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

  if (loading || sections.length === 0) {
    return null
  }

  return <WelcomeModal sections={sections} websites={websites} onSectionClick={scrollToSection} />
}
