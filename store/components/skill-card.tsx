import Link from "next/link"
import { ArrowRight, ExternalLink, Scale } from "lucide-react"
import type { Skill } from "@/lib/skills-data"
import { statusLabels, statusColors } from "@/lib/skills-data"

export function SkillCard({ skill }: { skill: Skill }) {
  return (
    <Link href={`/skill/${skill.slug}`} className="block group">
      <article className="h-full p-5 bg-white border border-[#e5e7eb] rounded-lg hover:border-[#d1d5db] hover:shadow-sm transition-all">
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="font-semibold text-[#111827] leading-snug group-hover:text-[#2563eb] transition-colors">
            {skill.title}
          </h3>
          <ArrowRight className="w-4 h-4 text-[#9ca3af] shrink-0 mt-0.5 group-hover:text-[#2563eb] transition-colors" />
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
          <div className="flex items-center gap-4 text-xs text-[#6b7280]">
            <span className="flex items-center gap-1.5">
              <ExternalLink className="w-3.5 h-3.5" />
              {skill.source.label}
            </span>
            <span className="flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5" />
              {skill.license.id}
            </span>
          </div>
          
          <div>
            <span className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-full border ${statusColors[skill.review.status]}`}>
              {skill.review.status === "verified" && (
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
              {skill.review.status === "basic-tested" && (
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
              {skill.review.status === "limitations" && (
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              )}
              {statusLabels[skill.review.status]}
            </span>
          </div>
        </div>
      </article>
    </Link>
  )
}
