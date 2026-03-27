"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  FileText,
  Users,
  History,
  Settings,
  ChevronLeft,
  ChevronRight,
  Layers,
} from "lucide-react"
import { useState } from "react"
import "../tour/tour.css"

const navigation = [
  {
    name: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    tourId: "nav-dashboard",
  },
  {
    name: "Modelos",
    href: "/modelos",
    icon: Layers,
    tourId: "nav-modelos",
  },
  {
    name: "Documentos",
    href: "/documentos",
    icon: FileText,
    tourId: "nav-documentos",
  },
  {
    name: "Usuários",
    href: "/usuarios",
    icon: Users,
    tourId: "nav-usuarios",
  },
  {
    name: "Histórico",
    href: "/historico",
    icon: History,
    tourId: "nav-historico",
  },
]

const secondaryNavigation = [
  {
    name: "Configurações",
    href: "/configuracoes",
    icon: Settings,
  },
]

interface SidebarProps {
  onHelpClick?: () => void
}

export function Sidebar({ onHelpClick }: SidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        "flex flex-col h-screen border-r border-border bg-sidebar transition-all duration-300",
        collapsed ? "w-[72px]" : "w-[260px]"
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-center h-16 border-b border-border">
        <Link href="/" className="flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.jpeg"
            alt="MLC Advocacia"
            className="object-contain transition-all duration-300"
            style={{ 
              width: collapsed ? 36 : 120, 
              height: "auto"
            }}
          />
        </Link>
      </div>

      {/* Navigation */}
      <nav data-tour="sidebar" className="flex-1 px-3 py-6 overflow-y-auto">
        <div className="flex flex-col gap-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href))

            return (
              <Link
                key={item.name}
                href={item.href}
                data-tour={item.tourId}
                className={cn(
                  "flex items-center gap-3 h-10 px-3 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-[#E8F0EC] text-[#005230] font-semibold"
                    : "text-foreground-secondary hover:bg-accent hover:text-foreground"
                )}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Help Button */}
      {onHelpClick && (
        <div className="px-3 pb-2 flex justify-center">
          <button
            data-tour="help-button"
            onClick={onHelpClick}
            title="Repetir tour guiado"
            className="tour-help-btn"
          >
            ?
          </button>
        </div>
      )}

      {/* Secondary Navigation */}
      <div className="px-3 py-4 border-t border-border flex flex-col gap-1">
        {secondaryNavigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href)
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 h-10 px-3 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-[#E8F0EC] text-[#005230] font-semibold"
                  : "text-foreground-secondary hover:bg-accent hover:text-foreground"
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          )
        })}

        {/* Collapse Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center w-full gap-3 h-10 px-3 rounded-lg text-sm font-medium text-foreground-secondary hover:bg-accent hover:text-foreground transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5" />
              <span>Recolher</span>
            </>
          )}
        </button>
      </div>
    </aside>
  )
}
