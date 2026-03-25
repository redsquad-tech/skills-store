"use client"

import { useState, useMemo } from "react"
import type { Skill, TagsIndex } from "@/lib/skills-data"
import { SkillsSearch } from "@/components/skills-search"
import { SkillCard } from "@/components/skill-card"

interface SkillsGridProps {
  skills: Skill[]
  tags: TagsIndex
}

export function SkillsGrid({ skills, tags }: SkillsGridProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTag, setSelectedTag] = useState<string | null>(null)

  const filteredSkills = useMemo(() => {
    return skills.filter((skill) => {
      const query = searchQuery.toLowerCase()
      
      const matchesSearch =
        !query ||
        skill.title.toLowerCase().includes(query) ||
        skill.short_description.toLowerCase().includes(query) ||
        skill.tags.some((tag) => tag.toLowerCase().includes(query)) ||
        skill.search_aliases.some((alias) => alias.toLowerCase().includes(query))

      const matchesTag = !selectedTag || skill.tags.includes(selectedTag)

      return matchesSearch && matchesTag
    })
  }, [skills, searchQuery, selectedTag])

  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
    if (selectedTag) setSelectedTag(null)
  }

  const handleTagSelect = (tag: string) => {
    setSelectedTag(tag === selectedTag ? null : tag)
    setSearchQuery("")
  }

  return (
    <div className="space-y-6">
      <SkillsSearch
        tags={tags}
        onSearchChange={handleSearchChange}
        onTagSelect={handleTagSelect}
        selectedTag={selectedTag}
      />

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[#111827]">
            {selectedTag ? `Тег: ${selectedTag}` : "Все скиллы"}
          </h2>
          <p className="text-sm text-[#6b7280] mt-0.5">
            {filteredSkills.length} {filteredSkills.length === 1 ? "скилл" : filteredSkills.length < 5 ? "скилла" : "скиллов"}
          </p>
        </div>
      </div>

      {filteredSkills.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSkills.map((skill) => (
            <SkillCard key={skill.slug} skill={skill} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-[#f9fafb] rounded-lg border border-[#e5e7eb]">
          <p className="text-[#111827] font-medium mb-2">Ничего не найдено</p>
          <p className="text-sm text-[#6b7280]">
            Попробуйте изменить запрос или убрать фильтры
          </p>
        </div>
      )}
    </div>
  )
}
