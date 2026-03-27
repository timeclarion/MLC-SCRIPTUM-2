"use client"

import { useEffect, useState, useCallback } from "react"
import type { TourStep } from "./tour-steps"
import "./tour.css"

interface TourProps {
  step: TourStep
  currentStep: number
  totalSteps: number
  onNext: () => void
  onPrev: () => void
  onSkip: () => void
}

interface TargetRect {
  top: number
  left: number
  width: number
  height: number
}

const PADDING = 8

export function Tour({
  step,
  currentStep,
  totalSteps,
  onNext,
  onPrev,
  onSkip,
}: TourProps) {
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null)
  const [tooltipKey, setTooltipKey] = useState(0)

  const updateRect = useCallback(() => {
    const el = document.querySelector(step.target)
    if (!el) {
      // Elemento nao encontrado — pular passo
      onNext()
      return
    }
    const rect = el.getBoundingClientRect()
    setTargetRect({
      top: rect.top - PADDING,
      left: rect.left - PADDING,
      width: rect.width + PADDING * 2,
      height: rect.height + PADDING * 2,
    })
  }, [step.target, onNext])

  // Recalcular posicao ao mudar de passo
  useEffect(() => {
    updateRect()
    setTooltipKey((k) => k + 1)
  }, [updateRect])

  // Recalcular em resize/scroll
  useEffect(() => {
    window.addEventListener("resize", updateRect)
    window.addEventListener("scroll", updateRect, true)
    return () => {
      window.removeEventListener("resize", updateRect)
      window.removeEventListener("scroll", updateRect, true)
    }
  }, [updateRect])

  if (!targetRect) return null

  const tooltipStyle = getTooltipPosition(targetRect, step.position)
  const isLast = currentStep === totalSteps - 1
  const isFirst = currentStep === 0

  return (
    <>
      {/* Spotlight */}
      <div
        className="tour-spotlight tour-spotlight-enter"
        style={{
          top: targetRect.top,
          left: targetRect.left,
          width: targetRect.width,
          height: targetRect.height,
        }}
      />

      {/* Tooltip */}
      <div
        key={tooltipKey}
        className="tour-tooltip"
        data-position={step.position}
        style={tooltipStyle}
      >
        <div className="tour-tooltip-arrow" />

        <button className="tour-btn-skip" onClick={onSkip}>
          Pular tour
        </button>

        <h3 className="tour-tooltip-title">{step.title}</h3>
        <p className="tour-tooltip-description">{step.description}</p>

        <div className="tour-tooltip-footer">
          <span className="tour-tooltip-progress">
            {currentStep + 1} de {totalSteps}
          </span>

          <div className="tour-tooltip-buttons">
            {!isFirst && (
              <button className="tour-btn-prev" onClick={onPrev}>
                Anterior
              </button>
            )}
            <button className="tour-btn-next" onClick={onNext}>
              {isLast ? "Concluir" : "Proximo"}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

function getTooltipPosition(
  rect: TargetRect,
  position: TourStep["position"]
): React.CSSProperties {
  const GAP = 16

  switch (position) {
    case "right":
      return {
        top: rect.top,
        left: rect.left + rect.width + GAP,
      }
    case "left":
      return {
        top: rect.top,
        right: window.innerWidth - rect.left + GAP,
      }
    case "bottom":
      return {
        top: rect.top + rect.height + GAP,
        left: rect.left,
      }
    case "top":
      return {
        bottom: window.innerHeight - rect.top + GAP,
        left: rect.left,
      }
  }
}
