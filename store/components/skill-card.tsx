import Link from "next/link"
import { ArrowRight, ExternalLink, Scale } from "lucide-react"
import type { Skill } from "@/lib/skills-data"
import { statusLabels } from "@/lib/skills-data"

export function SkillCard({ skill }: { skill: Skill }) {
  const isReviewed = ["verified", "reviewed"].includes(skill.review.status)

  return (
    <Link href={`/skill/${skill.slug}`} className="block group">
      <article className="h-full p-5 bg-white border border-[#e5e7eb] rounded-lg hover:border-[#d1d5db] hover:shadow-sm transition-all">
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="font-semibold text-[#111827] leading-snug group-hover:text-[#2563eb] transition-colors">
            {skill.title}
          </h3>
          <ArrowRight className="w-4 h-4 text-[#9ca3af] shrink-0 mt-0.5 group-hover:text-[#2563eb] transition-colors" />
        </div>

        <div className="mb-3">
          <span className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full border ${isReviewed ? 'bg-[#f3e8ff] text-[#7c3aed] border-[#e9d5ff]' : 'bg-[#f9fafb] text-[#6b7280] border-[#e5e7eb]'}`}>
            {statusLabels[skill.review.status]}
          </span>
        </div>
        
        <p className="text-sm text-[#6b7280] leading-relaxed mb-4 line-clamp-2">
          {skill.short_description}
        </p>
        
        <div className="flex flex-wrap gap-1.5 mb-4">
          {skill.tags.slice(0, 3).map((tag) => (
            <span 
              key={tag} 
              className="px-2 py-0.5 text-xs font-medium text-[#374151] bg-[#f3f4f6] rounded"
            >
              {tag}
            </span>
          ))}
        </div>
        
        <div className="pt-3 border-t border-[#e5e7eb] space-y-2.5">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 text-xs text-[#6b7280]">
            <span className="flex items-start gap-1.5 min-w-0">
              <ExternalLink className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span className="line-clamp-2 break-all">{skill.source.label}</span>
            </span>
            <span className="flex items-center gap-1.5 whitespace-nowrap">
              <Scale className="w-3.5 h-3.5 shrink-0" />
              {skill.license.id}
            </span>
          </div>
        </div>
      </article>
    </Link>
  )
}
