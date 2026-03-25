import fs from "fs"
import path from "path"
import { Header } from "@/components/header"
import { SkillsGrid } from "@/components/skills-grid"
import { ShieldCheck, FileCheck, Scale, GitBranch } from "lucide-react"

function getData() {
  const dataDir = path.join(process.cwd(), 'public', 'data')
  
  const catalog = JSON.parse(fs.readFileSync(path.join(dataDir, 'catalog.json'), 'utf-8'))
  const tags = JSON.parse(fs.readFileSync(path.join(dataDir, 'tags.json'), 'utf-8'))

  return { catalog, tags }
}

export default async function Home() {
  const { catalog, tags } = getData()

  return (
    <div className="min-h-screen bg-[#ffffff]">
      <Header />

      <main>
        <section className="pt-12 pb-10 md:pt-16 md:pb-12 border-b border-[#e5e7eb]">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-[#111827] mb-4 text-balance leading-tight">
              Проверенные скиллы для бизнес-задач
            </h1>
            <p className="text-base md:text-lg text-[#6b7280] max-w-2xl mx-auto mb-10 leading-relaxed">
              Каталог скиллов для работы с документами, файлами, отчётами и рутинными задачами. У каждого скилла указан источник, лицензия и статус проверки.
            </p>
          </div>
        </section>

        <section className="py-6 bg-[#f9fafb] border-b border-[#e5e7eb]">
          <div className="max-w-5xl mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-[#e5e7eb]">
                <div className="w-9 h-9 rounded-lg bg-[#ecfdf5] flex items-center justify-center shrink-0">
                  <GitBranch className="w-4 h-4 text-[#059669]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#111827]">Источник указан</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-[#e5e7eb]">
                <div className="w-9 h-9 rounded-lg bg-[#eff6ff] flex items-center justify-center shrink-0">
                  <Scale className="w-4 h-4 text-[#2563eb]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#111827]">Лицензия проверена</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-[#e5e7eb]">
                <div className="w-9 h-9 rounded-lg bg-[#fef3c7] flex items-center justify-center shrink-0">
                  <FileCheck className="w-4 h-4 text-[#d97706]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#111827]">Версия зафиксирована</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-[#e5e7eb]">
                <div className="w-9 h-9 rounded-lg bg-[#f3e8ff] flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4 text-[#7c3aed]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#111827]">Пройдена проверка</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-10 md:py-12">
          <div className="max-w-5xl mx-auto px-6">
            <SkillsGrid skills={catalog} tags={tags} />
          </div>
        </section>

        <section className="py-8 border-t border-[#e5e7eb] bg-[#f9fafb]">
          <div className="max-w-5xl mx-auto px-6">
            <div className="grid md:grid-cols-3 gap-6 text-sm">
              <div>
                <h4 className="font-semibold text-[#111827] mb-2">Как мы проверяем</h4>
                <p className="text-[#6b7280] leading-relaxed">
                  Каждый скилл проходит проверку структуры, источника и лицензии перед добавлением в каталог.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-[#111827] mb-2">Статусы проверки</h4>
                <p className="text-[#6b7280] leading-relaxed">
                  «Проверен» — полная проверка. «Базово протестирован» — базовая проверка. «Есть ограничения» — работает с оговорками.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-[#111827] mb-2">Лицензии</h4>
                <p className="text-[#6b7280] leading-relaxed">
                  Для каждого скилла указан тип лицензии и возможность коммерческого использования.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
