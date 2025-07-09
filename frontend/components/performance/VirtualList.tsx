"use client"

import type React from "react"
import { FixedSizeList as List } from "react-window"
import InfiniteLoader from "react-window-infinite-loader"

interface VirtualListProps<T> {
  items: T[]
  height: number
  itemHeight: number
  hasNextPage: boolean
  isNextPageLoading: boolean
  loadNextPage: () => Promise<void>
  renderItem: ({ index, style, data }: { index: number; style: React.CSSProperties; data: T[] }) => React.ReactNode
  className?: string
}

export function VirtualList<T>({
  items,
  height,
  itemHeight,
  hasNextPage,
  isNextPageLoading,
  loadNextPage,
  renderItem,
  className,
}: VirtualListProps<T>) {
  const itemCount = hasNextPage ? items.length + 1 : items.length

  const isItemLoaded = (index: number) => !!items[index]

  const Item = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    if (!isItemLoaded(index)) {
      return (
        <div style={style} className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500" />
        </div>
      )
    }

    return renderItem({ index, style, data: items })
  }

  return (
    <div className={className}>
      <InfiniteLoader isItemLoaded={isItemLoaded} itemCount={itemCount} loadMoreItems={loadNextPage}>
        {({ onItemsRendered, ref }) => (
          <List
            ref={ref}
            height={height}
            itemCount={itemCount}
            itemSize={itemHeight}
            itemData={items}
            onItemsRendered={onItemsRendered}
          >
            {Item}
          </List>
        )}
      </InfiniteLoader>
    </div>
  )
}
