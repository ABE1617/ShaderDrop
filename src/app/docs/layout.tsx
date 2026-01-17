import Link from "next/link"
import { Book, Palette, Users, ChevronRight } from "lucide-react"

const docsNav = [
  {
    title: "Getting Started",
    href: "/docs",
    icon: Book,
    description: "Quick start guide",
  },
  {
    title: "Customization",
    href: "/docs/customization",
    icon: Palette,
    description: "Customize shaders",
  },
  {
    title: "Contributing",
    href: "/docs/contributing",
    icon: Users,
    description: "Help us grow",
  },
]

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative min-h-screen">
      {/* Fixed unified background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-[#0a0a0f] to-black" />
        <div className="absolute inset-0 grid-pattern opacity-50" />

        {/* Animated gradient orbs */}
        <div className="absolute top-[10%] left-[15%] w-[500px] h-[500px] bg-purple-500/15 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute top-[40%] right-[10%] w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[130px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-[70%] left-[20%] w-[350px] h-[350px] bg-pink-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-[50%] left-[50%] w-[600px] h-[600px] bg-violet-500/5 rounded-full blur-[180px]" />
      </div>

      <div className="relative z-10 container mx-auto pt-28 pb-12 px-4 max-w-6xl">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Sidebar */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="lg:sticky lg:top-28">
              <h2 className="text-sm font-semibold text-white/40 uppercase tracking-wider mb-4">
                Documentation
              </h2>
              <nav className="space-y-2">
                {docsNav.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="group flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.05] hover:border-white/[0.1] transition-all"
                  >
                    <item.icon className="h-5 w-5 text-purple-400" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-white/80">{item.title}</div>
                      <div className="text-xs text-white/40 truncate">
                        {item.description}
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-white/30 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </Link>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  )
}
