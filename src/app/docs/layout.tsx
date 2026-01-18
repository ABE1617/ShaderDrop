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

        {/* Animated gradient orbs - responsive sizes */}
        <div className="absolute top-[10%] left-[15%] w-[200px] h-[200px] sm:w-[350px] sm:h-[350px] lg:w-[500px] lg:h-[500px] bg-purple-500/15 rounded-full blur-[80px] sm:blur-[120px] lg:blur-[150px] animate-pulse" />
        <div className="absolute top-[40%] right-[10%] w-[150px] h-[150px] sm:w-[280px] sm:h-[280px] lg:w-[400px] lg:h-[400px] bg-blue-500/10 rounded-full blur-[60px] sm:blur-[100px] lg:blur-[130px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-[70%] left-[20%] w-[120px] h-[120px] sm:w-[240px] sm:h-[240px] lg:w-[350px] lg:h-[350px] bg-pink-500/10 rounded-full blur-[50px] sm:blur-[90px] lg:blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-[50%] left-[50%] w-[250px] h-[250px] sm:w-[400px] sm:h-[400px] lg:w-[600px] lg:h-[600px] bg-violet-500/5 rounded-full blur-[100px] sm:blur-[140px] lg:blur-[180px]" />
      </div>

      <div className="relative z-10 container mx-auto pt-24 sm:pt-28 lg:pt-32 pb-8 sm:pb-12 px-3 sm:px-4 max-w-6xl">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">
          {/* Sidebar - horizontal scroll on mobile, vertical on desktop */}
          <aside className="w-full lg:w-64 flex-shrink-0">
            <div className="lg:sticky lg:top-28">
              <h2 className="text-xs sm:text-sm font-semibold text-white/40 uppercase tracking-wider mb-3 lg:mb-4">
                Documentation
              </h2>
              {/* Horizontal scrollable nav on mobile */}
              <nav className="flex lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0 -mx-3 px-3 lg:mx-0 lg:px-0 scrollbar-hide">
                {docsNav.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="group flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.05] hover:border-white/[0.1] transition-all flex-shrink-0 lg:flex-shrink min-w-[140px] sm:min-w-[160px] lg:min-w-0"
                  >
                    <item.icon className="h-4 w-4 sm:h-5 sm:w-5 text-purple-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-xs sm:text-sm text-white/80 whitespace-nowrap lg:whitespace-normal">{item.title}</div>
                      <div className="text-[10px] sm:text-xs text-white/40 truncate hidden sm:block">
                        {item.description}
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-white/30 hidden lg:block opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
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
