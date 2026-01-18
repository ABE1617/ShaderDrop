"use client"

import { useRef, useCallback, useState } from "react"
import { RotateCcw, ChevronDown, Palette, Sliders } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

interface UniformConfig {
  name: string
  label: string
  type: "range" | "color" | "boolean"
  default: number | string | boolean
  min?: number
  max?: number
  step?: number
}

interface ShaderControlsProps {
  uniforms: UniformConfig[]
  values: Record<string, number | string | boolean>
  onChange: (name: string, value: number | string | boolean) => void
  onReset?: () => void
  className?: string
}

// Custom slider component with better touch handling
function CustomSlider({
  value,
  min,
  max,
  step,
  onChange,
  id,
}: {
  value: number
  min: number
  max: number
  step: number
  onChange: (value: number) => void
  id: string
}) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const percent = ((value - min) / (max - min)) * 100

  const updateValue = useCallback(
    (clientX: number) => {
      if (!trackRef.current) return
      const rect = trackRef.current.getBoundingClientRect()
      const x = Math.max(0, Math.min(clientX - rect.left, rect.width))
      const newPercent = x / rect.width
      const newValue = min + newPercent * (max - min)
      const steppedValue = Math.round(newValue / step) * step
      const clampedValue = Math.max(min, Math.min(max, steppedValue))
      onChange(clampedValue)
    },
    [min, max, step, onChange]
  )

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(true)
      ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
      updateValue(e.clientX)
    },
    [updateValue]
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging) return
      e.preventDefault()
      e.stopPropagation()
      updateValue(e.clientX)
    },
    [isDragging, updateValue]
  )

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    e.preventDefault()
    setIsDragging(false)
    ;(e.target as HTMLElement).releasePointerCapture(e.pointerId)
  }, [])

  return (
    <div
      ref={trackRef}
      id={id}
      className="relative h-2 w-full cursor-pointer touch-none select-none group"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* Track background */}
      <div className="absolute inset-0 rounded-full bg-white/[0.08] group-hover:bg-white/[0.12] transition-colors" />

      {/* Filled track */}
      <div
        className={cn(
          "absolute h-full rounded-full transition-colors",
          "bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500",
          isDragging && "from-violet-400 via-purple-400 to-fuchsia-400"
        )}
        style={{ width: `${percent}%` }}
      />

      {/* Thumb */}
      <div
        className={cn(
          "absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 rounded-full",
          "bg-white shadow-md shadow-black/30",
          "ring-2 ring-purple-500/50 ring-offset-1 ring-offset-black",
          "transition-transform duration-150",
          isDragging ? "scale-110 ring-purple-400/70" : "hover:scale-110 hover:ring-purple-400/70",
          "cursor-grab active:cursor-grabbing"
        )}
        style={{ left: `${percent}%` }}
      />
    </div>
  )
}

export function ShaderControls({
  uniforms,
  values,
  onChange,
  onReset,
  className,
}: ShaderControlsProps) {
  const [colorsExpanded, setColorsExpanded] = useState(true)
  const [paramsExpanded, setParamsExpanded] = useState(true)

  // Separate uniforms by type
  const colorUniforms = uniforms.filter((u) => u.type === "color")
  const rangeUniforms = uniforms.filter((u) => u.type === "range")
  const booleanUniforms = uniforms.filter((u) => u.type === "boolean")

  const renderRangeControl = (uniform: UniformConfig) => {
    const value = values[uniform.name]
    const numValue = typeof value === "number" ? value : (uniform.default as number)
    const min = uniform.min ?? 0
    const max = uniform.max ?? 100
    const step = uniform.step ?? 0.01

    return (
      <div key={uniform.name} className="space-y-3 py-1">
        <div className="flex items-center justify-between">
          <Label htmlFor={uniform.name} className="text-sm font-medium text-white/80">
            {uniform.label}
          </Label>
          <span className="text-xs tabular-nums text-white/50 font-mono px-2 py-1 rounded-md bg-white/[0.05]">
            {numValue.toFixed(2)}
          </span>
        </div>
        <CustomSlider
          id={uniform.name}
          value={numValue}
          min={min}
          max={max}
          step={step}
          onChange={(newValue) => onChange(uniform.name, newValue)}
        />
      </div>
    )
  }

  const renderColorControl = (uniform: UniformConfig) => {
    const value = values[uniform.name]
    const colorValue = typeof value === "string" ? value : (uniform.default as string)

    return (
      <div key={uniform.name} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
        <label
          htmlFor={uniform.name}
          className="relative flex-shrink-0 w-12 h-12 rounded-xl cursor-pointer overflow-hidden group"
        >
          {/* Color preview */}
          <div
            className="absolute inset-0 rounded-xl transition-transform group-hover:scale-105"
            style={{ backgroundColor: colorValue }}
          />
          {/* Border overlay */}
          <div className="absolute inset-0 rounded-xl border-2 border-white/20 group-hover:border-white/40 transition-colors" />
          {/* Hidden input */}
          <input
            id={uniform.name}
            type="color"
            value={colorValue}
            onChange={(e) => onChange(uniform.name, e.target.value)}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
        </label>
        <div className="flex-1 min-w-0">
          <Label htmlFor={uniform.name} className="text-sm font-medium text-white/80 block truncate cursor-pointer">
            {uniform.label}
          </Label>
          <span className="text-xs text-white/50 font-mono uppercase">
            {colorValue}
          </span>
        </div>
      </div>
    )
  }

  const renderBooleanControl = (uniform: UniformConfig) => {
    const value = values[uniform.name]
    const boolValue = typeof value === "boolean" ? value : (uniform.default as boolean)

    return (
      <div key={uniform.name} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
        <Label htmlFor={uniform.name} className="text-sm text-white/80">{uniform.label}</Label>
        <Switch
          id={uniform.name}
          checked={boolValue}
          onCheckedChange={(checked) => onChange(uniform.name, checked)}
        />
      </div>
    )
  }

  return (
    <div className={cn("overflow-hidden", className)}>
      {/* Header */}
      <div className="sticky top-0 z-10 px-4 sm:px-5 py-3 sm:py-4 flex items-center justify-between bg-black/60 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-br from-purple-500/20 to-fuchsia-500/20 flex items-center justify-center flex-shrink-0">
            <Sliders className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-400" />
          </div>
          <span className="font-semibold text-sm sm:text-base text-white/90">Customize</span>
        </div>
        {onReset && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="text-white/40 hover:text-white hover:bg-white/[0.08] h-8 px-2 sm:px-3 text-xs rounded-lg"
          >
            <RotateCcw className="h-3.5 w-3.5 sm:mr-1.5" />
            <span className="hidden sm:inline">Reset</span>
          </Button>
        )}
      </div>

      <div className="p-4 sm:p-5 space-y-5 sm:space-y-6">
        {/* Color Controls Section */}
        {colorUniforms.length > 0 && (
          <div className="space-y-3">
            <button
              onClick={() => setColorsExpanded(!colorsExpanded)}
              className="w-full flex items-center justify-between py-1 group"
            >
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-white/40" />
                <span className="text-xs font-semibold text-white/60 uppercase tracking-wider">Colors</span>
              </div>
              <ChevronDown
                className={cn(
                  "w-4 h-4 text-white/40 transition-transform duration-200",
                  colorsExpanded && "rotate-180"
                )}
              />
            </button>
            <div
              className={cn(
                "grid transition-all duration-200",
                colorsExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              )}
            >
              <div className="overflow-hidden">
                <div className="space-y-1">
                  {colorUniforms.map(renderColorControl)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Range Controls Section */}
        {rangeUniforms.length > 0 && (
          <div className="space-y-3">
            <button
              onClick={() => setParamsExpanded(!paramsExpanded)}
              className="w-full flex items-center justify-between py-1 group"
            >
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-white/40" />
                <span className="text-xs font-semibold text-white/60 uppercase tracking-wider">Parameters</span>
              </div>
              <ChevronDown
                className={cn(
                  "w-4 h-4 text-white/40 transition-transform duration-200",
                  paramsExpanded && "rotate-180"
                )}
              />
            </button>
            <div
              className={cn(
                "grid transition-all duration-200",
                paramsExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              )}
            >
              <div className="overflow-hidden">
                <div className="space-y-5 pt-2">
                  {rangeUniforms.map(renderRangeControl)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Boolean Controls Section */}
        {booleanUniforms.length > 0 && (
          <div className="space-y-3 pt-3 border-t border-white/[0.06]">
            <span className="text-xs font-semibold text-white/60 uppercase tracking-wider">Options</span>
            <div className="space-y-2">
              {booleanUniforms.map(renderBooleanControl)}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export type { UniformConfig, ShaderControlsProps }
