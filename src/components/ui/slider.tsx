"use client"

import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"

interface SliderProps extends React.ComponentProps<typeof SliderPrimitive.Root> {
  showValue?: boolean
  formatValue?: (value: number) => string
}

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  showValue = false,
  formatValue,
  ...props
}: SliderProps) {
  const _values = React.useMemo(
    () =>
      Array.isArray(value)
        ? value
        : Array.isArray(defaultValue)
          ? defaultValue
          : [min],
    [value, defaultValue, min]
  )

  const [isDragging, setIsDragging] = React.useState(false)

  const displayValue = formatValue
    ? formatValue(_values[0])
    : _values[0].toFixed(2)

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      onPointerDown={() => setIsDragging(true)}
      onPointerUp={() => setIsDragging(false)}
      onPointerLeave={() => setIsDragging(false)}
      className={cn(
        "relative flex w-full touch-none items-center select-none data-[disabled]:opacity-50 group",
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className="bg-white/[0.08] relative grow overflow-hidden rounded-full h-2 w-full cursor-pointer transition-all group-hover:bg-white/[0.12]"
      >
        <SliderPrimitive.Range
          data-slot="slider-range"
          className={cn(
            "absolute h-full rounded-full transition-all",
            "bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500",
            isDragging && "from-violet-400 via-purple-400 to-fuchsia-400"
          )}
        />
      </SliderPrimitive.Track>
      {Array.from({ length: _values.length }, (_, index) => (
        <SliderPrimitive.Thumb
          data-slot="slider-thumb"
          key={index}
          className={cn(
            "block size-5 shrink-0 rounded-full transition-all duration-150",
            "bg-white shadow-md shadow-black/30",
            "ring-2 ring-purple-500/50 ring-offset-1 ring-offset-black",
            "hover:scale-110 hover:ring-purple-400/70 hover:shadow-lg hover:shadow-purple-500/20",
            "focus-visible:outline-none focus-visible:scale-110 focus-visible:ring-purple-400/70",
            "active:scale-95",
            "disabled:pointer-events-none disabled:opacity-50",
            "cursor-grab active:cursor-grabbing"
          )}
        >
          {/* Value tooltip on drag */}
          {showValue && (
            <div
              className={cn(
                "absolute -top-9 left-1/2 -translate-x-1/2 px-2 py-1 rounded-md text-xs font-medium",
                "bg-white text-black shadow-lg",
                "opacity-0 scale-90 transition-all duration-150",
                "group-hover:opacity-100 group-hover:scale-100",
                isDragging && "opacity-100 scale-100"
              )}
            >
              {displayValue}
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rotate-45" />
            </div>
          )}
        </SliderPrimitive.Thumb>
      ))}
    </SliderPrimitive.Root>
  )
}

export { Slider }
