/**
 * Configuration for a customizable shader uniform
 */
export interface UniformConfig {
  /** Internal uniform name (e.g., 'u_speed') */
  name: string
  /** Display label for UI controls */
  label: string
  /** Control type to render */
  type: "range" | "color" | "boolean"
  /** Default value */
  default: number | string | boolean
  /** Minimum value (for range type) */
  min?: number
  /** Maximum value (for range type) */
  max?: number
  /** Step increment (for range type) */
  step?: number
}

/**
 * Shader definition with metadata and code
 */
export interface Shader {
  /** URL-friendly identifier */
  slug: string
  /** Display name */
  name: string
  /** Short description */
  description: string
  /** Tags for filtering */
  tags: string[]
  /** Creator name */
  author: string
  /** Creator's website/twitter */
  authorUrl?: string
  /** ISO date string */
  createdAt: string
  /** Customizable uniforms */
  uniforms: UniformConfig[]
  /** The actual component code (for display) */
  code: string
  /** Default values for preview */
  defaultProps: Record<string, unknown>
}
