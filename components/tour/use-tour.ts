import { useState, useCallback, useEffect } from "react"
import { TOUR_STEPS } from "./tour-steps"

const STORAGE_KEY = "scriptum_tour_completed"

export function useTour() {
  const [isActive, setIsActive] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

  // Auto-iniciar no primeiro acesso (desktop only)
  useEffect(() => {
    if (typeof window === "undefined") return
    if (window.innerWidth < 768) return

    const completed = localStorage.getItem(STORAGE_KEY)
    if (!completed) {
      const timer = setTimeout(() => {
        setIsActive(true)
        setCurrentStep(0)
      }, 800)
      return () => clearTimeout(timer)
    }
  }, [])

  const next = useCallback(() => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1)
    } else {
      setIsActive(false)
      localStorage.setItem(STORAGE_KEY, "true")
    }
  }, [currentStep])

  const prev = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
    }
  }, [currentStep])

  const skip = useCallback(() => {
    setIsActive(false)
    localStorage.setItem(STORAGE_KEY, "true")
  }, [])

  const restart = useCallback(() => {
    setCurrentStep(0)
    setIsActive(true)
  }, [])

  // Keyboard navigation
  useEffect(() => {
    if (!isActive) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "Enter") {
        e.preventDefault()
        next()
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault()
        prev()
      }
      if (e.key === "Escape") {
        e.preventDefault()
        skip()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isActive, next, prev, skip])

  return {
    isActive,
    currentStep,
    totalSteps: TOUR_STEPS.length,
    step: TOUR_STEPS[currentStep],
    next,
    prev,
    skip,
    restart,
  }
}
