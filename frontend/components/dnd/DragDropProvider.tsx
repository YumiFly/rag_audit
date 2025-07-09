"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback } from "react"
import { DndContext, type DragEndEvent, DragOverlay, type DragStartEvent, closestCenter } from "@dnd-kit/core"
import { SortableContext, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

interface DragDropContextType {
  activeId: string | null
  items: any[]
  setItems: (items: any[]) => void
  onDragStart: (event: DragStartEvent) => void
  onDragEnd: (event: DragEndEvent) => void
}

const DragDropContext = createContext<DragDropContextType | null>(null)

export const useDragDrop = () => {
  const context = useContext(DragDropContext)
  if (!context) {
    throw new Error("useDragDrop must be used within DragDropProvider")
  }
  return context
}

interface DragDropProviderProps {
  children: React.ReactNode
  items: any[]
  onItemsChange: (items: any[]) => void
}

export const DragDropProvider: React.FC<DragDropProviderProps> = ({ children, items, onItemsChange }) => {
  const [activeId, setActiveId] = useState<string | null>(null)

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }, [])

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event

      if (over && active.id !== over.id) {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)

        const newItems = arrayMove(items, oldIndex, newIndex)
        onItemsChange(newItems)
      }

      setActiveId(null)
    },
    [items, onItemsChange],
  )

  const contextValue: DragDropContextType = {
    activeId,
    items,
    setItems: onItemsChange,
    onDragStart: handleDragStart,
    onDragEnd: handleDragEnd,
  }

  return (
    <DragDropContext.Provider value={contextValue}>
      <DndContext collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
          {children}
        </SortableContext>
        <DragOverlay>
          {activeId ? (
            <div className="bg-gray-800 border border-gray-600 rounded-lg p-4 shadow-lg opacity-90">拖拽中...</div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </DragDropContext.Provider>
  )
}

interface SortableItemProps {
  id: string
  children: React.ReactNode
  className?: string
}

export const SortableItem: React.FC<SortableItemProps> = ({ id, children, className }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} className={className} {...attributes} {...listeners}>
      {children}
    </div>
  )
}
