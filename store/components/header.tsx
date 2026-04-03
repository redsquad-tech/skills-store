import Link from "next/link"
import Image from "next/image"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-white">
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center">
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/is-logo.svg"
            alt="Insightstream"
            width={32}
            height={32}
            className="w-8 h-8 rounded-lg"
          />
          <span className="font-semibold text-[#111827]">Insightstream</span>
        </Link>
      </div>
    </header>
  )
}
