"use client"

import { Search } from "lucide-react"
import type { TagsIndex } from "@/lib/skills-data"

interface SkillsSearchProps {
  tags: TagsIndex
  onSearchChange: (query: string) => void
  onTagSelect: (tag: string) => void
  selectedTag: string | null
}

export function SkillsSearch({
  tags,
  onSearchChange,
  onTagSelect,
  selectedTag,
}: SkillsSearchProps) {
  const popularTags = Object.entries(tags)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([tag]) => tag)

  return (
    <div className="space-y-5">
      <div className="relative max-w-lg mx-auto">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9ca3af]" />
        <input
          type="text"
          placeholder="Например: excel, pdf, договоры, отчёты"
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-12 pr-4 h-12 bg-white border border-[#e5e7eb] rounded-lg text-[#111827] placeholder:text-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] transition-all"
        />
      </div>

      <div className="flex flex-wrap gap-2 justify-center">
        {popularTags.map((tag) => (
          <button
            key={tag}
            onClick={() => onTagSelect(tag)}
            className={`px-3 py-1.5 text-sm font-medium rounded-full transition-all ${
              selectedTag === tag
                ? "bg-[#2563eb] text-white"
                : "bg-[#f3f4f6] text-[#6b7280] hover:bg-[#e5e7eb] hover:text-[#374151]"
            }`}
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  )
}
