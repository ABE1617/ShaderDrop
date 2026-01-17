import type { Shader } from "@/types/shader"

export const plasmaCode = `"use client"

import { useEffect, useRef } from "react"

interface PlasmaShaderProps {
  className?: string
  color1?: string
  color2?: string
  color3?: string
  color4?: string
  speed?: number
  complexity?: number
  brightness?: number
}

function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\\d]{2})([a-f\\d]{2})([a-f\\d]{2})$/i.exec(hex)
  return result
    ? [
        parseInt(result[1], 16) / 255,
        parseInt(result[2], 16) / 255,
        parseInt(result[3], 16) / 255,
      ]
    : [0, 0, 0]
}

const vertexShader = \`
  attribute vec2 a_position;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
\`

const fragmentShader = \`
  precision highp float;

  uniform vec2 u_resolution;
  uniform float u_time;
  uniform vec3 u_color1;
  uniform vec3 u_color2;
  uniform vec3 u_color3;
  uniform vec3 u_color4;
  uniform float u_complexity;
  uniform float u_brightness;

  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    vec2 p = (uv - 0.5) * u_complexity;

    float t = u_time * 0.5;

    // Classic plasma formula with multiple sine waves
    float v1 = sin(p.x * 10.0 + t);
    float v2 = sin(10.0 * (p.x * sin(t / 2.0) + p.y * cos(t / 3.0)) + t);

    float cx = p.x + 0.5 * sin(t / 5.0);
    float cy = p.y + 0.5 * cos(t / 3.0);
    float v3 = sin(sqrt(100.0 * (cx * cx + cy * cy) + 1.0) + t);

    float cx2 = p.x + sin(t / 2.0);
    float cy2 = p.y + cos(t / 1.5);
    float v4 = sin(sqrt(50.0 * (cx2 * cx2 + cy2 * cy2) + 1.0) + t * 1.5);

    // Combine all plasma values
    float v = (v1 + v2 + v3 + v4) * 0.25;

    // Create smooth color transitions
    float colorVal = v * 0.5 + 0.5;

    // Four-way color mixing for rich gradients
    vec3 color;
    if (colorVal < 0.25) {
      color = mix(u_color1, u_color2, colorVal * 4.0);
    } else if (colorVal < 0.5) {
      color = mix(u_color2, u_color3, (colorVal - 0.25) * 4.0);
    } else if (colorVal < 0.75) {
      color = mix(u_color3, u_color4, (colorVal - 0.5) * 4.0);
    } else {
      color = mix(u_color4, u_color1, (colorVal - 0.75) * 4.0);
    }

    // Apply brightness
    color *= u_brightness;

    // Add subtle vignette
    float vignette = 1.0 - length(uv - 0.5) * 0.5;
    color *= vignette;

    gl_FragColor = vec4(color, 1.0);
  }
\`

export function PlasmaShader({
  className = "",
  color1 = "#ff0080",
  color2 = "#00ffff",
  color3 = "#ff8000",
  color4 = "#8000ff",
  speed = 1,
  complexity = 4,
  brightness = 1,
}: PlasmaShaderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)
  const startTimeRef = useRef<number>(Date.now())

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const gl = canvas.getContext("webgl", { antialias: true, alpha: false })
    if (!gl) {
      console.error("WebGL not supported")
      return
    }

    const vShader = gl.createShader(gl.VERTEX_SHADER)!
    gl.shaderSource(vShader, vertexShader)
    gl.compileShader(vShader)

    const fShader = gl.createShader(gl.FRAGMENT_SHADER)!
    gl.shaderSource(fShader, fragmentShader)
    gl.compileShader(fShader)

    const program = gl.createProgram()!
    gl.attachShader(program, vShader)
    gl.attachShader(program, fShader)
    gl.linkProgram(program)
    gl.useProgram(program)

    const positions = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1])
    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW)

    const positionLoc = gl.getAttribLocation(program, "a_position")
    gl.enableVertexAttribArray(positionLoc)
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0)

    const resolutionLoc = gl.getUniformLocation(program, "u_resolution")
    const timeLoc = gl.getUniformLocation(program, "u_time")
    const color1Loc = gl.getUniformLocation(program, "u_color1")
    const color2Loc = gl.getUniformLocation(program, "u_color2")
    const color3Loc = gl.getUniformLocation(program, "u_color3")
    const color4Loc = gl.getUniformLocation(program, "u_color4")
    const complexityLoc = gl.getUniformLocation(program, "u_complexity")
    const brightnessLoc = gl.getUniformLocation(program, "u_brightness")

    gl.uniform3fv(color1Loc, hexToRgb(color1))
    gl.uniform3fv(color2Loc, hexToRgb(color2))
    gl.uniform3fv(color3Loc, hexToRgb(color3))
    gl.uniform3fv(color4Loc, hexToRgb(color4))
    gl.uniform1f(complexityLoc, complexity)
    gl.uniform1f(brightnessLoc, brightness)

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2)
      canvas.width = canvas.clientWidth * dpr
      canvas.height = canvas.clientHeight * dpr
      gl.viewport(0, 0, canvas.width, canvas.height)
      gl.uniform2f(resolutionLoc, canvas.width, canvas.height)
    }

    resize()
    window.addEventListener("resize", resize)

    const render = () => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000
      gl.uniform1f(timeLoc, elapsed * speed)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
      animationRef.current = requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener("resize", resize)
      cancelAnimationFrame(animationRef.current)
      gl.deleteProgram(program)
      gl.deleteShader(vShader)
      gl.deleteShader(fShader)
    }
  }, [color1, color2, color3, color4, speed, complexity, brightness])

  return <canvas ref={canvasRef} className={className} style={{ width: "100%", height: "100%" }} />
}
`

export const plasma: Shader = {
  slug: "plasma",
  name: "Plasma Wave",
  description: "Classic psychedelic plasma effect with smooth, flowing color transitions and mesmerizing wave patterns.",
  tags: ["animated", "colorful", "retro", "psychedelic"],
  author: "ShaderDrop",
  createdAt: "2025-01-16",
  uniforms: [
    {
      name: "color1",
      label: "Color 1",
      type: "color",
      default: "#ff0080",
    },
    {
      name: "color2",
      label: "Color 2",
      type: "color",
      default: "#00ffff",
    },
    {
      name: "color3",
      label: "Color 3",
      type: "color",
      default: "#ff8000",
    },
    {
      name: "color4",
      label: "Color 4",
      type: "color",
      default: "#8000ff",
    },
    {
      name: "speed",
      label: "Animation Speed",
      type: "range",
      default: 1,
      min: 0.1,
      max: 3,
      step: 0.1,
    },
    {
      name: "complexity",
      label: "Pattern Complexity",
      type: "range",
      default: 4,
      min: 1,
      max: 8,
      step: 0.5,
    },
    {
      name: "brightness",
      label: "Brightness",
      type: "range",
      default: 1,
      min: 0.5,
      max: 1.5,
      step: 0.05,
    },
  ],
  code: plasmaCode,
  defaultProps: {
    color1: "#ff0080",
    color2: "#00ffff",
    color3: "#ff8000",
    color4: "#8000ff",
    speed: 1,
    complexity: 4,
    brightness: 1,
  },
}
