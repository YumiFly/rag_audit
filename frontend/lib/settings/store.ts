"use client"

import React from "react"

import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

export type Theme = "light" | "dark" | "system"
export type Language = "zh" | "en"

export interface UserSettings {
  // 外观设置
  theme: Theme
  language: Language
  fontSize: "small" | "medium" | "large"
  compactMode: boolean

  // 通知设置
  notifications: {
    desktop: boolean
    email: boolean
    push: boolean
    sound: boolean
    analysisComplete: boolean
    systemAlerts: boolean
    securityWarnings: boolean
  }

  // 分析设置
  analysis: {
    defaultTools: string[]
    autoStart: boolean
    saveHistory: boolean
    maxHistoryItems: number
  }

  // 界面设置
  interface: {
    showSidebar: boolean
    sidebarCollapsed: boolean
    showMinimap: boolean
    showLineNumbers: boolean
    wordWrap: boolean
  }

  // 快捷键设置
  shortcuts: Record<string, string>

  // 高级设置
  advanced: {
    enableExperimentalFeatures: boolean
    debugMode: boolean
    performanceMode: boolean
    cacheSize: number
  }
}

const defaultSettings: UserSettings = {
  theme: "dark",
  language: "zh",
  fontSize: "medium",
  compactMode: false,

  notifications: {
    desktop: true,
    email: false,
    push: true,
    sound: true,
    analysisComplete: true,
    systemAlerts: true,
    securityWarnings: true,
  },

  analysis: {
    defaultTools: ["slither"],
    autoStart: false,
    saveHistory: true,
    maxHistoryItems: 100,
  },

  interface: {
    showSidebar: true,
    sidebarCollapsed: false,
    showMinimap: false,
    showLineNumbers: true,
    wordWrap: true,
  },

  shortcuts: {
    "upload-file": "Ctrl+U",
    "send-message": "Ctrl+Enter",
    "show-help": "Ctrl+/",
    "close-modal": "Escape",
    "save-file": "Ctrl+S",
    search: "Ctrl+F",
    "new-analysis": "Ctrl+N",
    "toggle-sidebar": "Ctrl+B",
  },

  advanced: {
    enableExperimentalFeatures: false,
    debugMode: false,
    performanceMode: false,
    cacheSize: 100,
  },
}

interface SettingsStore {
  settings: UserSettings
  updateSettings: (updates: Partial<UserSettings>) => void
  resetSettings: () => void
  exportSettings: () => string
  importSettings: (settingsJson: string) => boolean
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      settings: defaultSettings,

      updateSettings: (updates) => {
        set((state) => ({
          settings: { ...state.settings, ...updates },
        }))
      },

      resetSettings: () => {
        set({ settings: defaultSettings })
      },

      exportSettings: () => {
        return JSON.stringify(get().settings, null, 2)
      },

      importSettings: (settingsJson) => {
        try {
          const importedSettings = JSON.parse(settingsJson)
          set({ settings: { ...defaultSettings, ...importedSettings } })
          return true
        } catch (error) {
          console.error("Failed to import settings:", error)
          return false
        }
      },
    }),
    {
      name: "user-settings",
      storage: createJSONStorage(() => localStorage),
    },
  ),
)

// 主题应用Hook
export function useTheme() {
  const { settings, updateSettings } = useSettingsStore()

  const setTheme = (theme: Theme) => {
    updateSettings({ theme })
    applyTheme(theme)
  }

  const applyTheme = (theme: Theme) => {
    const root = document.documentElement

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
      root.classList.toggle("dark", systemTheme === "dark")
    } else {
      root.classList.toggle("dark", theme === "dark")
    }
  }

  React.useEffect(() => {
    applyTheme(settings.theme)
  }, [settings.theme])

  return {
    theme: settings.theme,
    setTheme,
  }
}
