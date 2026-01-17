import type { Shader } from "@/types/shader"

export const liquidMetalCode = `"use client"

import { useEffect, useRef } from "react"

interface LiquidMetalShaderProps {
  className?: string
  baseColor?: string
  highlightColor?: string
  speed?: number
  distortion?: number
  reflectivity?: number
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
  uniform vec3 u_baseColor;
  uniform vec3 u_highlightColor;
  uniform float u_distortion;
  uniform float u_reflectivity;

  // Noise functions
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(
              i.z + vec4(0.0, i1.z, i2.z, 1.0))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    vec2 p = (uv - 0.5) * 2.0;
    p.x *= u_resolution.x / u_resolution.y;

    float t = u_time * 0.3;

    // Create liquid metal surface with 3D noise
    float n1 = snoise(vec3(p * 2.0 * u_distortion, t));
    float n2 = snoise(vec3(p * 4.0 * u_distortion + 10.0, t * 1.3));
    float n3 = snoise(vec3(p * 8.0 * u_distortion + 20.0, t * 0.7));

    // Combine noise layers for surface detail
    float surface = n1 * 0.5 + n2 * 0.3 + n3 * 0.2;

    // Calculate surface normal for lighting
    float eps = 0.01;
    float nx = snoise(vec3((p + vec2(eps, 0.0)) * 3.0 * u_distortion, t)) -
               snoise(vec3((p - vec2(eps, 0.0)) * 3.0 * u_distortion, t));
    float ny = snoise(vec3((p + vec2(0.0, eps)) * 3.0 * u_distortion, t)) -
               snoise(vec3((p - vec2(0.0, eps)) * 3.0 * u_distortion, t));

    vec3 normal = normalize(vec3(nx * 2.0, ny * 2.0, 1.0));

    // Light direction (animated)
    vec3 lightDir = normalize(vec3(
      sin(t * 0.5) * 0.5,
      cos(t * 0.4) * 0.5 + 0.5,
      1.0
    ));

    // Calculate diffuse and specular lighting
    float diffuse = max(dot(normal, lightDir), 0.0);

    vec3 viewDir = vec3(0.0, 0.0, 1.0);
    vec3 halfDir = normalize(lightDir + viewDir);
    float specular = pow(max(dot(normal, halfDir), 0.0), 64.0) * u_reflectivity;

    // Fresnel effect for metallic look
    float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 3.0) * u_reflectivity;

    // Color mixing
    vec3 color = u_baseColor * (0.3 + diffuse * 0.4);
    color += u_highlightColor * specular;
    color += u_highlightColor * fresnel * 0.5;

    // Add environment reflection simulation
    float envReflect = snoise(vec3(normal.xy * 3.0 + t * 0.2, 0.0)) * 0.5 + 0.5;
    color += u_highlightColor * envReflect * 0.1 * u_reflectivity;

    // Subtle color variation based on surface
    color += surface * 0.1 * u_baseColor;

    gl_FragColor = vec4(color, 1.0);
  }
\`

export function LiquidMetalShader({
  className = "",
  baseColor = "#1a1a2e",
  highlightColor = "#c0c0c0",
  speed = 1,
  distortion = 1,
  reflectivity = 1.5,
}: LiquidMetalShaderProps) {
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
    const baseColorLoc = gl.getUniformLocation(program, "u_baseColor")
    const highlightColorLoc = gl.getUniformLocation(program, "u_highlightColor")
    const distortionLoc = gl.getUniformLocation(program, "u_distortion")
    const reflectivityLoc = gl.getUniformLocation(program, "u_reflectivity")

    gl.uniform3fv(baseColorLoc, hexToRgb(baseColor))
    gl.uniform3fv(highlightColorLoc, hexToRgb(highlightColor))
    gl.uniform1f(distortionLoc, distortion)
    gl.uniform1f(reflectivityLoc, reflectivity)

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
  }, [baseColor, highlightColor, speed, distortion, reflectivity])

  return <canvas ref={canvasRef} className={className} style={{ width: "100%", height: "100%" }} />
}
`

export const liquidMetal: Shader = {
  slug: "liquid-metal",
  name: "Liquid Metal",
  description: "Sleek, reflective liquid metal surface with realistic lighting and smooth, organic distortions.",
  tags: ["animated", "metallic", "3d", "premium"],
  author: "ShaderDrop",
  createdAt: "2025-01-16",
  uniforms: [
    {
      name: "baseColor",
      label: "Base Color",
      type: "color",
      default: "#1a1a2e",
    },
    {
      name: "highlightColor",
      label: "Highlight Color",
      type: "color",
      default: "#c0c0c0",
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
      name: "distortion",
      label: "Surface Distortion",
      type: "range",
      default: 1,
      min: 0.3,
      max: 2,
      step: 0.1,
    },
    {
      name: "reflectivity",
      label: "Reflectivity",
      type: "range",
      default: 1.5,
      min: 0.5,
      max: 3,
      step: 0.1,
    },
  ],
  code: liquidMetalCode,
  defaultProps: {
    baseColor: "#1a1a2e",
    highlightColor: "#c0c0c0",
    speed: 1,
    distortion: 1,
    reflectivity: 1.5,
  },
}
