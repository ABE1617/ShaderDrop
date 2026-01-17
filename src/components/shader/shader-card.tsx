import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import type { Shader } from "@/types/shader"
import { cn } from "@/lib/utils"
import { ArrowUpRight } from "lucide-react"
import { ShaderThumbnail } from "./shader-thumbnail"

interface ShaderCardProps {
  shader: Shader
  className?: string
}

export function ShaderCard({ shader, className }: ShaderCardProps) {
  return (
    <Link href={`/shaders/${shader.slug}`} className="group block">
      <div className={cn(
        "relative overflow-hidden rounded-2xl transition-all duration-500",
        "bg-white/[0.02] border border-white/[0.08]",
        "hover:bg-white/[0.04] hover:border-white/[0.15]",
        "hover:shadow-2xl hover:shadow-purple-500/10",
        "hover:-translate-y-1",
        className
      )}>
        {/* Shader thumbnail */}
        <div className="aspect-video relative overflow-hidden">
          <ShaderThumbnail
            slug={shader.slug}
            className="absolute inset-0 transition-transform duration-700 group-hover:scale-105"
          />

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500" />

          {/* Arrow indicator */}
          <div className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
            <ArrowUpRight className="h-5 w-5 text-white" />
          </div>
        </div>

        {/* Content */}
        <div className="p-5 h-[140px] flex flex-col">
          {/* Title and Description */}
          <div className="space-y-1.5 flex-1">
            <h3 className="text-lg font-semibold text-white group-hover:text-purple-300 transition-colors duration-300">
              {shader.name}
            </h3>
            <p className="text-sm text-white/50 line-clamp-2 leading-relaxed">
              {shader.description}
            </p>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 pt-2">
            {shader.tags.slice(0, 3).map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="bg-white/[0.05] hover:bg-white/[0.08] border-white/[0.08] text-white/60 text-xs px-2.5 py-0.5 transition-colors"
              >
                {tag}
              </Badge>
            ))}
            {shader.tags.length > 3 && (
              <Badge
                variant="secondary"
                className="bg-white/[0.05] border-white/[0.08] text-white/40 text-xs px-2.5 py-0.5"
              >
                +{shader.tags.length - 3}
              </Badge>
            )}
          </div>
        </div>

        {/* Bottom gradient line on hover */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
      </div>
    </Link>
  )
}
