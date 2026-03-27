"use client"

import { Sidebar } from "./sidebar"
import { Header } from "./header"
import { Tour } from "../tour/tour"
import { useTour } from "../tour/use-tour"

interface AppLayoutProps {
  children: React.ReactNode
  title: string
  description?: string
}

export function AppLayout({ children, title, description }: AppLayoutProps) {
  const tour = useTour()

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar onHelpClick={tour.restart} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header title={title} description={description} />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-[1120px] mx-auto px-6 py-6 lg:px-8 lg:py-8">
            {children}
          </div>
        </main>
      </div>

      {/* Tour — renderiza so quando ativo */}
      {tour.isActive && (
        <Tour
          step={tour.step}
          currentStep={tour.currentStep}
          totalSteps={tour.totalSteps}
          onNext={tour.next}
          onPrev={tour.prev}
          onSkip={tour.skip}
        />
      )}
    </div>
  )
}
