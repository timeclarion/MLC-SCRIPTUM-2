"use client"

import { Bell, Search, User, LogOut, Settings } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface HeaderProps {
  title: string
  description?: string
}

export function Header({ title, description }: HeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState(false)

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between h-16 px-6 lg:px-8 bg-background border-b border-border">
      <div>
        <h1 className="font-serif text-xl font-semibold text-foreground tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-foreground-secondary mt-0.5">{description}</p>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Search */}
        <button data-tour="search" className="flex items-center gap-2 px-3 py-2 text-sm text-foreground-secondary bg-secondary rounded-lg hover:bg-accent transition-colors">
          <Search className="w-4 h-4" />
          <span className="hidden sm:inline">Buscar...</span>
          <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 text-xs font-mono bg-background rounded border border-border">
            <span className="text-xs">⌘</span>K
          </kbd>
        </button>

        {/* Notifications */}
        <button className="relative flex items-center justify-center w-9 h-9 rounded-lg text-foreground-secondary hover:bg-accent transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
        </button>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-accent transition-colors"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#E8F0EC] text-[#005230]">
              <User className="w-4 h-4" />
            </div>
          </button>

          {showUserMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowUserMenu(false)}
              />
              <div className="absolute right-0 z-20 w-56 mt-2 bg-popover border border-border rounded-xl shadow-lg overflow-hidden">
                <div className="px-4 py-3 border-b border-border">
                  <p className="text-sm font-medium text-foreground">MLC Advocacia</p>
                  <p className="text-xs text-foreground-secondary">Sistema Scriptum</p>
                </div>
                <div className="py-1">
                  <a
                    href="/configuracoes"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-foreground-secondary hover:bg-accent hover:text-foreground transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    Configurações
                  </a>
                  <button className="flex items-center gap-2 w-full px-4 py-2 text-sm text-foreground-secondary hover:bg-accent hover:text-foreground transition-colors">
                    <LogOut className="w-4 h-4" />
                    Sair
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
