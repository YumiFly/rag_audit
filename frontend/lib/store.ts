"use client"

import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

// 用户设置状态
interface UserSettings {
  theme: "light" | "dark" | "system"
  language: "zh" | "en"
  notifications: {
    email: boolean
    push: boolean
    desktop: boolean
  }
  preferences: {
    autoSave: boolean
    showTips: boolean
    compactMode: boolean
  }
}

interface UserSettingsStore {
  settings: UserSettings
  updateSettings: (settings: Partial<UserSettings>) => void
  resetSettings: () => void
}

const defaultUserSettings: UserSettings = {
  theme: "dark",
  language: "zh",
  notifications: {
    email: true,
    push: true,
    desktop: false,
  },
  preferences: {
    autoSave: true,
    showTips: true,
    compactMode: false,
  },
}

export const useUserSettingsStore = create<UserSettingsStore>()(
  persist(
    (set) => ({
      settings: defaultUserSettings,
      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),
      resetSettings: () => set({ settings: defaultUserSettings }),
    }),
    {
      name: "user-settings",
      storage: createJSONStorage(() => localStorage),
    },
  ),
)

// API状态管理
interface ApiState {
  isLoading: boolean
  error: string | null
  lastRequestTime: number | null
}

interface ApiStore extends ApiState {
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
  updateLastRequestTime: () => void
}

export const useApiStore = create<ApiStore>((set) => ({
  isLoading: false,
  error: null,
  lastRequestTime: null,
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
  updateLastRequestTime: () => set({ lastRequestTime: Date.now() }),
}))

// 应用全局状态
interface AppState {
  sidebarOpen: boolean
  currentPage: string
  breadcrumbs: Array<{ label: string; href?: string }>
}

interface AppStore extends AppState {
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
  setCurrentPage: (page: string) => void
  setBreadcrumbs: (breadcrumbs: Array<{ label: string; href?: string }>) => void
}

export const useAppStore = create<AppStore>((set) => ({
  sidebarOpen: true,
  currentPage: "",
  breadcrumbs: [],
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setCurrentPage: (page) => set({ currentPage: page }),
  setBreadcrumbs: (breadcrumbs) => set({ breadcrumbs }),
}))

// 分析结果状态
interface AnalysisResult {
  id: string
  contractName: string
  timestamp: string
  status: "pending" | "running" | "completed" | "failed"
  findings: number
  severity: Record<string, number>
}

interface AnalysisStore {
  results: AnalysisResult[]
  currentAnalysis: AnalysisResult | null
  addResult: (result: AnalysisResult) => void
  updateResult: (id: string, updates: Partial<AnalysisResult>) => void
  removeResult: (id: string) => void
  setCurrentAnalysis: (result: AnalysisResult | null) => void
  clearResults: () => void
}

export const useAnalysisStore = create<AnalysisStore>()(
  persist(
    (set) => ({
      results: [],
      currentAnalysis: null,
      addResult: (result) =>
        set((state) => ({
          results: [result, ...state.results],
        })),
      updateResult: (id, updates) =>
        set((state) => ({
          results: state.results.map((result) => (result.id === id ? { ...result, ...updates } : result)),
        })),
      removeResult: (id) =>
        set((state) => ({
          results: state.results.filter((result) => result.id !== id),
        })),
      setCurrentAnalysis: (result) => set({ currentAnalysis: result }),
      clearResults: () => set({ results: [], currentAnalysis: null }),
    }),
    {
      name: "analysis-results",
      storage: createJSONStorage(() => localStorage),
    },
  ),
)

// 聊天历史状态
interface ChatMessage {
  id: string
  type: "user" | "ai"
  content: string
  timestamp: Date
  feedback?: "like" | "dislike" | null
}

interface ChatStore {
  messages: ChatMessage[]
  isLoading: boolean
  addMessage: (message: Omit<ChatMessage, "id">) => void
  updateMessage: (id: string, updates: Partial<ChatMessage>) => void
  clearMessages: () => void
  setLoading: (loading: boolean) => void
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set) => ({
      messages: [],
      isLoading: false,
      addMessage: (message) =>
        set((state) => ({
          messages: [
            ...state.messages,
            {
              ...message,
              id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            },
          ],
        })),
      updateMessage: (id, updates) =>
        set((state) => ({
          messages: state.messages.map((msg) => (msg.id === id ? { ...msg, ...updates } : msg)),
        })),
      clearMessages: () => set({ messages: [] }),
      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: "chat-history",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ messages: state.messages }), // 只持久化消息，不持久化loading状态
    },
  ),
)
