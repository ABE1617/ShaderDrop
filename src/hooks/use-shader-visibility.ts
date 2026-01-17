"use client"

import { useEffect, useRef, useState } from "react"

interface UseShaderVisibilityOptions {
  threshold?: number
  rootMargin?: string
}

export function useShaderVisibility(options: UseShaderVisibilityOptions = {}) {
  const { threshold = 0.1, rootMargin = "50px" } = options
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting)
      },
      {
        threshold,
        rootMargin,
      }
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [threshold, rootMargin])

  return { ref, isVisible }
}
