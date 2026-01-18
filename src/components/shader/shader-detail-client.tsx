"use client"

import { useState, useCallback } from "react"
import { ExternalLink } from "lucide-react"
import { ShaderPreview } from "./shader-preview"
import { ShaderControls } from "./shader-controls"
import { ShaderCode } from "./shader-code"
import { Badge } from "@/components/ui/badge"
import type { Shader } from "@/types/shader"
import type { ShaderSlug } from "@/lib/shaders/components"

interface ShaderDetailClientProps {
  shader: Shader
  showMeta?: boolean
}

export function ShaderDetailClient({ shader, showMeta = false }: ShaderDetailClientProps) {
  const [values, setValues] = useState<Record<string, number | string | boolean>>(
    () => {
      const initial: Record<string, number | string | boolean> = {}
      shader.uniforms.forEach((u) => {
        initial[u.name] = u.default
      })
      return initial
    }
  )

  const handleChange = useCallback((name: string, value: number | string | boolean) => {
    setValues((prev) => ({ ...prev, [name]: value }))
  }, [])

  const handleReset = useCallback(() => {
    const initial: Record<string, number | string | boolean> = {}
    shader.uniforms.forEach((u) => {
      initial[u.name] = u.default
    })
    setValues(initial)
  }, [shader.uniforms])

  return (
    <div className="space-y-8">
      {/* Preview + Controls Section */}
      <section>
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
          {/* Shader Preview */}
          <div className="flex-1 min-w-0 h-[280px] sm:h-[350px] md:h-[450px] lg:h-[550px]">
            <ShaderPreview
              slug={shader.slug as ShaderSlug}
              uniforms={values}
              aspectRatio="none"
              className="h-full"
            />
          </div>

          {/* Controls Panel - with proper scroll containment */}
          {shader.uniforms.length > 0 && (
            <div className="w-full lg:w-80 xl:w-96 flex-shrink-0 h-auto lg:h-[550px]">
              <div
                className="h-full max-h-[400px] sm:max-h-[450px] lg:max-h-[550px] overflow-y-auto overscroll-contain custom-scrollbar rounded-2xl bg-white/[0.02] border border-white/[0.06]"
                onWheel={(e) => e.stopPropagation()}
              >
                <ShaderControls
                  uniforms={shader.uniforms}
                  values={values}
                  onChange={handleChange}
                  onReset={handleReset}
                />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Description & Tags - Below Preview */}
      {showMeta && (
        <section className="rounded-2xl bg-white/[0.02] border border-white/[0.06] p-4 sm:p-6">
          <p className="text-white/60 mb-4 sm:mb-5 leading-relaxed text-sm sm:text-base">
            {shader.description}
          </p>
          <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {shader.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="bg-white/[0.04] border border-white/[0.08] text-white/70 px-3 py-1.5 hover:bg-white/[0.08] transition-colors text-xs sm:text-sm"
                >
                  {tag}
                </Badge>
              ))}
            </div>
            {shader.author && (
              <span className="text-sm text-white/40 flex items-center gap-1.5 sm:ml-auto">
                by{" "}
                {shader.authorUrl ? (
                  <a
                    href={shader.authorUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 hover:text-white transition-colors font-medium text-white/60"
                  >
                    {shader.author}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                ) : (
                  <span className="font-medium text-white/60">{shader.author}</span>
                )}
              </span>
            )}
          </div>
        </section>
      )}

      {/* Code Section */}
      <section>
        <h2 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-4">
          Source Code
        </h2>
        <ShaderCode shader={shader} />
      </section>
    </div>
  )
}
