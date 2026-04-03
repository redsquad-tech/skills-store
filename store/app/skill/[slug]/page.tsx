import fs from "fs"
import path from "path"
import { notFound } from "next/navigation"
import { ArrowLeft, ExternalLink, Scale, GitBranch, ShieldCheck } from "lucide-react"
import { Header } from "@/components/header"
import { statusLabels, type Skill } from "@/lib/skills-data"
import Link from "next/link"

function getSkills(): Skill[] {
  const dataDir = path.join(process.cwd(), 'public', 'data')
  const catalogPath = path.join(dataDir, 'catalog.json')
  return JSON.parse(fs.readFileSync(catalogPath, 'utf-8'))
}

export async function generateStaticParams() {
  const skills = getSkills()
  return skills.map((skill) => ({
    slug: skill.slug
  }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const skills = getSkills()
  const skill = skills.find(s => s.slug === slug)
  
  return {
    title: `${skill?.title} | Skill Store`,
    description: skill?.short_description
  }
}

export default async function SkillPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const skills = getSkills()
  const skill = skills.find((s) => s.slug === slug)

  if (!skill) {
    notFound()
  }

  const relatedSkills = skills
    .filter((s) => s.tags.some(t => skill.tags.includes(t)) && s.slug !== skill.slug)
    .slice(0, 3)

  const hasSource = Boolean(skill.source?.url?.trim())
  const isReviewPassed = ["verified", "reviewed", "basic-tested", "limitations"].includes(skill.review.status)
  const reviewLabel = skill.review.status === "reviewed" ? "Проверен" : statusLabels[skill.review.status]

  return (
    <div className="min-h-screen bg-[#ffffff]">
      <Header />

      <main className="py-8 md:py-10">
        <div className="max-w-4xl mx-auto px-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-[#6b7280] hover:text-[#111827] transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Назад в каталог
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div>
                <div className="flex items-center gap-3 mb-3 flex-wrap">
                  <h1 className="text-2xl font-bold text-[#111827]">{skill.title}</h1>
                </div>
                <p className="text-[#6b7280] leading-relaxed">{skill.short_description}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                {skill.tags.map((tag) => (
                  <span 
                    key={tag} 
                    className="px-3 py-1 text-sm font-medium text-[#374151] bg-[#f3f4f6] rounded-md"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="bg-white border border-[#e5e7eb] rounded-lg overflow-hidden">
                <div className="px-5 py-3 border-b border-[#e5e7eb] bg-[#f9fafb]">
                  <h2 className="font-semibold text-[#111827]">Описание</h2>
                </div>
                <div className="p-5">
                  <p className="text-[#374151] leading-relaxed">{skill.full_description}</p>
                </div>
              </div>

              <div className="bg-white border border-[#e5e7eb] rounded-lg overflow-hidden">
                <div className="px-5 py-3 border-b border-[#e5e7eb] bg-[#f9fafb]">
                  <h2 className="font-semibold text-[#111827]">Источник</h2>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${hasSource ? 'bg-[#ecfdf5]' : 'bg-[#f3f4f6]'}`}>
                      <GitBranch className={`w-5 h-5 ${hasSource ? 'text-[#059669]' : 'text-[#6b7280]'}`} />
                    </div>
                    <div>
                      <a 
                        href={skill.source.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-[#2563eb] hover:underline flex items-center gap-1"
                      >
                        {skill.source.label}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-[#e5e7eb] rounded-lg overflow-hidden">
                <div className="px-5 py-3 border-b border-[#e5e7eb] bg-[#f9fafb]">
                  <h2 className="font-semibold text-[#111827]">Лицензия</h2>
                </div>
                <div className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#eff6ff] flex items-center justify-center shrink-0">
                      <Scale className="w-5 h-5 text-[#2563eb]" />
                    </div>
                    <div>
                      <p className="font-medium text-[#111827]">{skill.license.id}</p>
                      {skill.license.url && (
                        <a 
                          href={skill.license.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-[#2563eb] hover:underline flex items-center gap-1 mt-1"
                        >
                          Подробнее
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-[#e5e7eb] rounded-lg overflow-hidden">
                <div className="px-5 py-3 border-b border-[#e5e7eb] bg-[#f9fafb]">
                  <h2 className="font-semibold text-[#111827]">Результат проверки</h2>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 text-sm text-[#374151]">
                    <div className={`w-7 h-7 rounded-md flex items-center justify-center ${isReviewPassed ? 'bg-[#f3e8ff]' : ''}`}>
                      <ShieldCheck className={`w-4 h-4 ${isReviewPassed ? 'text-[#7c3aed]' : 'text-[#6b7280]'}`} />
                    </div>
                    <span>{reviewLabel}</span>
                  </div>
                  {skill.review.summary && (
                    <p className="text-[#374151] leading-relaxed mt-3">{skill.review.summary}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white border border-[#e5e7eb] rounded-lg p-5 sticky top-20">
                <a 
                  href={`isgoose://skill/${skill.slug}`}
                  role="button"
                  className="flex items-center justify-center gap-2 w-full h-11 bg-[#2563eb] text-white font-medium rounded-lg hover:bg-[#1d4ed8] transition-colors"
                >
                  Установить
                </a>
                <a 
                  href={skill.source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full h-11 mt-3 bg-[#111827] text-white font-medium rounded-lg hover:bg-[#1f2937] transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Открыть источник
                </a>
                <Link
                  href="/"
                  className="flex items-center justify-center gap-2 w-full h-11 mt-3 bg-white text-[#374151] font-medium rounded-lg border border-[#e5e7eb] hover:bg-[#f9fafb] transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Вернуться в каталог
                </Link>
              </div>

              {relatedSkills.length > 0 && (
                <div className="bg-white border border-[#e5e7eb] rounded-lg overflow-hidden">
                  <div className="px-5 py-3 border-b border-[#e5e7eb] bg-[#f9fafb]">
                    <h3 className="font-semibold text-[#111827] text-sm">Похожие скиллы</h3>
                  </div>
                  <div className="divide-y divide-[#e5e7eb]">
                    {relatedSkills.map((related) => (
                      <Link
                        key={related.slug}
                        href={`/skill/${related.slug}`}
                        className="block p-4 hover:bg-[#f9fafb] transition-colors"
                      >
                        <p className="font-medium text-[#111827] text-sm mb-1">{related.title}</p>
                        <p className="text-xs text-[#6b7280] line-clamp-2">{related.short_description}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
