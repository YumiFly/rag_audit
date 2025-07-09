"use client"

import { useEffect, useCallback } from "react"
import { useSettingsStore } from "@/lib/settings/store"

interface ShortcutAction {
  key: string
  action: () => void
  description: string
}

export function useKeyboardShortcuts(actions: ShortcutAction[]) {
  const { settings } = useSettingsStore()

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const pressedKey = [
        event.ctrlKey && "Ctrl",
        event.altKey && "Alt",
        event.shiftKey && "Shift",
        event.metaKey && "Meta",
        event.key !== "Control" && event.key !== "Alt" && event.key !== "Shift" && event.key !== "Meta" && event.key,
      ]
        .filter(Boolean)
        .join("+")

      // 查找匹配的快捷键
      const matchedAction = actions.find((action) => {
        const configuredKey = settings.shortcuts[action.key]
        return configuredKey === pressedKey
      })

      if (matchedAction) {
        event.preventDefault()
        matchedAction.action()
      }
    },
    [actions, settings.shortcuts],
  )

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [handleKeyDown])
}

// 全局快捷键Hook
export function useGlobalShortcuts() {
  const shortcuts: ShortcutAction[] = [
    {
      key: "upload-file",
      action: () => {
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
        fileInput?.click()
      },
      description: "快速上传文件",
    },
    {
      key: "show-help",
      action: () => {
        // 显示帮助对话框
        const helpEvent = new CustomEvent("show-help")
        window.dispatchEvent(helpEvent)
      },
      description: "显示快捷键帮助",
    },
    {
      key: "close-modal",
      action: () => {
        // 关闭当前模态框
        const escEvent = new KeyboardEvent("keydown", { key: "Escape" })
        document.dispatchEvent(escEvent)
      },
      description: "关闭模态框",
    },
    {
      key: "search",
      action: () => {
        const searchInput = document.querySelector("[data-search-input]") as HTMLInputElement
        searchInput?.focus()
      },
      description: "聚焦搜索框",
    },
    {
      key: "toggle-sidebar",
      action: () => {
        const toggleEvent = new CustomEvent("toggle-sidebar")
        window.dispatchEvent(toggleEvent)
      },
      description: "切换侧边栏",
    },
  ]

  useKeyboardShortcuts(shortcuts)
}
