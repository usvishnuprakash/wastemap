'use client'

import { FilterStatus } from '@/lib/types'
import { FILTER_OPTIONS } from '@/lib/constants'

interface FilterBarProps {
  activeFilter: FilterStatus
  onFilterChange: (filter: FilterStatus) => void
}

export default function FilterBar({ activeFilter, onFilterChange }: FilterBarProps) {
  return (
    <div className="fixed top-[72px] left-0 right-0 z-[1000] bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="px-4 py-2 overflow-x-auto scrollbar-hide">
        <div className="flex gap-2">
          {FILTER_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => onFilterChange(option.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeFilter === option.value
                  ? 'bg-primary text-white'
                  : 'bg-surface text-muted hover:bg-border'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
