"use client"

import { useEffect, useRef, useCallback } from "react"

function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? [
        parseInt(result[1], 16) / 255,
        parseInt(result[2], 16) / 255,
        parseInt(result[3], 16) / 255,
      ]
    : [0, 0, 0]
}

// Performance: Cap DPR at 1.0 for smooth performance
const MAX_DPR = 1.0
// Performance: Target 30fps instead of 60fps
const FRAME_INTERVAL = 1000 / 30

const vertexShader = `
  attribute vec2 a_position;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`

// Shared hook for all shaders - handles WebGL setup, visibility, and frame throttling
function useShaderRenderer(
  fragmentShader: string,
  uniformSetup: (gl: WebGLRenderingContext, program: WebGLProgram) => void,
  timeMultiplier: number,
  isPlaying: boolean
) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)
  const startTimeRef = useRef<number>(Date.now())
  const lastFrameRef = useRef<number>(0)
  const glRef = useRef<WebGLRenderingContext | null>(null)
  const programRef = useRef<WebGLProgram | null>(null)
  const isVisibleRef = useRef<boolean>(true)

  const render = useCallback(() => {
    const gl = glRef.current
    const program = programRef.current
    if (!gl || !program || !isPlaying || !isVisibleRef.current) return

    const now = Date.now()
    // Frame rate throttling
    if (now - lastFrameRef.current < FRAME_INTERVAL) {
      animationRef.current = requestAnimationFrame(render)
      return
    }
    lastFrameRef.current = now

    const elapsed = (now - startTimeRef.current) / 1000
    gl.uniform1f(gl.getUniformLocation(program, "u_time"), elapsed * timeMultiplier)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    animationRef.current = requestAnimationFrame(render)
  }, [timeMultiplier, isPlaying])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // IntersectionObserver for visibility detection
    const observer = new IntersectionObserver(
      (entries) => {
        isVisibleRef.current = entries[0]?.isIntersecting ?? false
        if (isVisibleRef.current && isPlaying) {
          cancelAnimationFrame(animationRef.current)
          render()
        }
      },
      { threshold: 0.1 }
    )
    observer.observe(canvas)

    const gl = canvas.getContext("webgl", {
      antialias: false,
      alpha: false,
      powerPreference: "low-power",
      preserveDrawingBuffer: false,
    })
    if (!gl) return

    glRef.current = gl

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
    programRef.current = program

    const positions = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1])
    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW)

    const positionLoc = gl.getAttribLocation(program, "a_position")
    gl.enableVertexAttribArray(positionLoc)
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0)

    uniformSetup(gl, program)

    const resolutionLoc = gl.getUniformLocation(program, "u_resolution")
    const resize = () => {
      if (!canvas.clientWidth || !canvas.clientHeight) return
      const dpr = Math.min(window.devicePixelRatio, MAX_DPR)
      canvas.width = canvas.clientWidth * dpr
      canvas.height = canvas.clientHeight * dpr
      gl.viewport(0, 0, canvas.width, canvas.height)
      gl.uniform2f(resolutionLoc, canvas.width, canvas.height)
    }

    // Use ResizeObserver for more reliable sizing on mobile
    const resizeObserver = new ResizeObserver(() => {
      resize()
    })
    resizeObserver.observe(canvas)

    resize()
    window.addEventListener("resize", resize)
    if (isPlaying) render()

    return () => {
      observer.disconnect()
      resizeObserver.disconnect()
      window.removeEventListener("resize", resize)
      cancelAnimationFrame(animationRef.current)
      // Clean up WebGL resources
      gl.deleteProgram(program)
      gl.deleteShader(vShader)
      gl.deleteShader(fShader)
      gl.deleteBuffer(buffer)
    }
  }, [fragmentShader, uniformSetup, render, isPlaying])

  useEffect(() => {
    if (isPlaying && isVisibleRef.current) {
      render()
    } else {
      cancelAnimationFrame(animationRef.current)
    }
  }, [isPlaying, render])

  return canvasRef
}

// ============================================
// LIQUID METAL SHADER (Premium Quality)
// ============================================
const liquidMetalFragmentShader = `
  precision highp float;

  uniform vec2 u_resolution;
  uniform float u_time;
  uniform vec3 u_baseColor;
  uniform vec3 u_highlightColor;
  uniform float u_distortion;
  uniform float u_reflectivity;
  uniform float u_scale;
  uniform float u_lightIntensity;
  uniform float u_fresnelStrength;

  // 3D Simplex noise for smooth organic movement
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

    vec3 i = floor(v + dot(v, C.yyy));
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

    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);

    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);

    vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    vec2 p = (uv - 0.5) * 2.0;
    p.x *= u_resolution.x / u_resolution.y;

    // Apply scale to the UV coordinates
    p *= u_scale;

    float t = u_time * 0.3;

    // Multi-octave noise for rich surface detail
    float n1 = snoise(vec3(p * 1.2 * u_distortion, t * 0.4));
    float n2 = snoise(vec3(p * 2.4 * u_distortion + 5.0, t * 0.5));
    float n3 = snoise(vec3(p * 4.8 * u_distortion + 10.0, t * 0.3));
    float surface = n1 * 0.5 + n2 * 0.3 + n3 * 0.2;

    // Calculate normals for realistic lighting
    float eps = 0.015;
    float nx = snoise(vec3((p + vec2(eps, 0.0)) * 2.0 * u_distortion, t * 0.4)) -
               snoise(vec3((p - vec2(eps, 0.0)) * 2.0 * u_distortion, t * 0.4));
    float ny = snoise(vec3((p + vec2(0.0, eps)) * 2.0 * u_distortion, t * 0.4)) -
               snoise(vec3((p - vec2(0.0, eps)) * 2.0 * u_distortion, t * 0.4));

    vec3 normal = normalize(vec3(nx * 4.0, ny * 4.0, 1.0));

    // Dynamic main light with intensity control
    vec3 lightDir1 = normalize(vec3(
      sin(t * 0.5) * 0.6,
      cos(t * 0.4) * 0.4 + 0.5,
      1.0
    ));

    // Secondary fill light
    vec3 lightDir2 = normalize(vec3(-0.5, -0.3, 0.8));

    // Diffuse lighting with intensity multiplier
    float diffuse1 = max(dot(normal, lightDir1), 0.0) * u_lightIntensity;
    float diffuse2 = max(dot(normal, lightDir2), 0.0) * 0.3 * u_lightIntensity;

    // Specular highlights (Blinn-Phong) with intensity
    vec3 viewDir = vec3(0.0, 0.0, 1.0);
    vec3 halfDir1 = normalize(lightDir1 + viewDir);
    vec3 halfDir2 = normalize(lightDir2 + viewDir);

    float specular1 = pow(max(dot(normal, halfDir1), 0.0), 80.0) * u_reflectivity * u_lightIntensity;
    float specular2 = pow(max(dot(normal, halfDir2), 0.0), 40.0) * u_reflectivity * 0.4 * u_lightIntensity;

    // Fresnel rim lighting with strength control
    float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 4.0) * u_reflectivity * u_fresnelStrength;

    // Environment reflection simulation
    float envReflect = snoise(vec3(normal.xy * 3.0 + p * 0.5, t * 0.2)) * 0.5 + 0.5;

    // Compose final color
    vec3 color = u_baseColor * (0.15 + diffuse1 * 0.5 + diffuse2);
    color += u_highlightColor * (specular1 + specular2);
    color += mix(u_highlightColor, vec3(1.0), 0.3) * fresnel * 0.5;
    color += u_baseColor * surface * 0.1;
    color += u_highlightColor * envReflect * 0.08 * u_reflectivity;

    // Subtle vignette
    float vignette = 1.0 - length(uv - 0.5) * 0.3;
    color *= vignette;

    gl_FragColor = vec4(color, 1.0);
  }
`

interface LiquidMetalShaderProps {
  className?: string
  baseColor?: string
  highlightColor?: string
  speed?: number
  scale?: number
  distortion?: number
  reflectivity?: number
  lightIntensity?: number
  fresnelStrength?: number
  isPlaying?: boolean
}

export function LiquidMetalShader({
  className = "",
  baseColor = "#1a1a2e",
  highlightColor = "#ffffff",
  speed = 1,
  scale = 1,
  distortion = 1,
  reflectivity = 1.5,
  lightIntensity = 1,
  fresnelStrength = 1,
  isPlaying = true,
}: LiquidMetalShaderProps) {
  const uniformSetup = useCallback(
    (gl: WebGLRenderingContext, program: WebGLProgram) => {
      gl.uniform3fv(gl.getUniformLocation(program, "u_baseColor"), hexToRgb(baseColor))
      gl.uniform3fv(gl.getUniformLocation(program, "u_highlightColor"), hexToRgb(highlightColor))
      gl.uniform1f(gl.getUniformLocation(program, "u_distortion"), distortion)
      gl.uniform1f(gl.getUniformLocation(program, "u_reflectivity"), reflectivity)
      gl.uniform1f(gl.getUniformLocation(program, "u_scale"), scale)
      gl.uniform1f(gl.getUniformLocation(program, "u_lightIntensity"), lightIntensity)
      gl.uniform1f(gl.getUniformLocation(program, "u_fresnelStrength"), fresnelStrength)
    },
    [baseColor, highlightColor, distortion, reflectivity, scale, lightIntensity, fresnelStrength]
  )

  const canvasRef = useShaderRenderer(liquidMetalFragmentShader, uniformSetup, speed, isPlaying)
  return <canvas ref={canvasRef} className={`w-full h-full block ${className || ''}`} />
}

// ============================================
// NEON HORIZON - Premium Synthwave
// ============================================
const neonHorizonFragmentShader = `
  precision highp float;

  uniform vec2 u_resolution;
  uniform float u_time;
  uniform vec3 u_skyColor1;
  uniform vec3 u_skyColor2;
  uniform vec3 u_gridColor;
  uniform vec3 u_sunColor;
  uniform float u_gridSpeed;
  uniform float u_sunSize;
  uniform float u_glowIntensity;

  // Smooth noise for mountains
  float hash(float n) { return fract(sin(n) * 43758.5453); }
  float noise(float x) {
    float i = floor(x);
    float f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    return mix(hash(i), hash(i + 1.0), f);
  }

  // Mountain silhouette
  float mountain(float x, float scale, float height, float offset) {
    float m = 0.0;
    m += noise(x * scale + offset) * height;
    m += noise(x * scale * 2.0 + offset) * height * 0.5;
    m += noise(x * scale * 4.0 + offset) * height * 0.25;
    return m;
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    float aspect = u_resolution.x / u_resolution.y;

    // Sky gradient with more depth
    float skyGrad = pow(uv.y, 0.5);
    vec3 sky = mix(u_skyColor1, u_skyColor2, skyGrad);

    // Add color bands in sky
    sky += vec3(0.12, 0.0, 0.18) * sin(skyGrad * 3.14159) * 0.4;
    sky += u_sunColor * 0.08 * exp(-abs(uv.y - 0.5) * 4.0); // Warm band

    // Sun position and distance
    vec2 sunPos = vec2(0.5, 0.42);
    vec2 sunUV = (uv - sunPos) * vec2(aspect, 1.0);
    float sunDist = length(sunUV);
    float sunRadius = u_sunSize * 0.18;

    // Smooth sun disc with soft edge
    float sun = smoothstep(sunRadius, sunRadius - 0.025, sunDist);

    // Animated horizontal stripes on sun
    float stripeFreq = 18.0;
    float stripeY = (uv.y - sunPos.y + sunRadius) / (sunRadius * 2.0);
    float stripeAnim = stripeY - u_time * 0.08; // Stripes move downward
    float stripe = sin(stripeAnim * stripeFreq * 3.14159) * 0.5 + 0.5;
    stripe = smoothstep(0.2, 0.8, stripe);

    // Only apply stripes to lower half of sun, increasing toward bottom
    float stripeMask = smoothstep(0.6, 0.3, stripeY);
    sun *= mix(1.0, stripe, stripeMask * 0.85);

    // Multi-layered glow
    float innerGlow = exp(-sunDist * 5.0) * 1.5;
    float outerGlow = exp(-sunDist * 2.0) * 0.6;
    float wideGlow = exp(-sunDist * 1.0) * 0.15;
    float totalGlow = (innerGlow + outerGlow + wideGlow) * u_glowIntensity;

    // Sun color gradient (orange center to pink edges)
    vec3 sunCol = mix(u_sunColor, u_sunColor * vec3(1.0, 0.5, 0.7), clamp(sunDist / sunRadius, 0.0, 1.0));

    // Mountain silhouettes
    float horizon = 0.35;
    float mountainX = uv.x * aspect;

    // Back mountain layer (darker, further)
    float mountain1 = mountain(mountainX, 2.0, 0.08, 0.0);
    float mountainMask1 = smoothstep(horizon + mountain1 + 0.02, horizon + mountain1, uv.y);

    // Front mountain layer (lighter, closer)
    float mountain2 = mountain(mountainX, 3.5, 0.05, 10.0);
    float mountainMask2 = smoothstep(horizon + mountain2 + 0.015, horizon + mountain2, uv.y);

    // Apply mountains to sky
    vec3 mountainColor1 = vec3(0.02, 0.0, 0.04);
    vec3 mountainColor2 = vec3(0.04, 0.0, 0.06);
    sky = mix(sky, mountainColor1, mountainMask1 * 0.9);
    sky = mix(sky, mountainColor2, mountainMask2 * 0.95);

    // Atmospheric haze at horizon
    float haze = exp(-abs(uv.y - horizon) * 8.0) * 0.4;
    sky += mix(u_gridColor, u_sunColor, 0.3) * haze * u_glowIntensity;

    // Horizon glow line
    float horizonGlow = exp(-abs(uv.y - horizon) * 40.0) * 0.5;

    // Grid floor
    if (uv.y < horizon) {
      float perspY = (horizon - uv.y) / horizon;
      float z = 1.0 / (perspY + 0.0001);
      float x = (uv.x - 0.5) * z * aspect;

      // Better anti-aliased grid using screen-space derivatives approximation
      float gridScale = 0.35;
      float zLine = z * 0.2 - u_time * u_gridSpeed;

      // Calculate grid with proper AA
      float gridXcoord = x * gridScale;
      float gridZcoord = zLine;

      // Line thickness that scales with distance
      float lineThicknessX = 0.03 * z * 0.3;
      float lineThicknessZ = 0.025;

      // Smooth grid lines
      float gridX = abs(fract(gridXcoord) - 0.5);
      float gridZ = abs(fract(gridZcoord) - 0.5);

      // Anti-aliased lines using smooth falloff
      float aaScale = 0.5 / u_resolution.y * z;
      float lineX = smoothstep(lineThicknessX + aaScale, lineThicknessX - aaScale, gridX);
      float lineZ = smoothstep(lineThicknessZ + aaScale * 5.0, lineThicknessZ - aaScale * 5.0, gridZ);

      float grid = max(lineX, lineZ);

      // Smooth fade at horizon (stronger fade to hide AA issues)
      grid *= smoothstep(0.0, 0.25, perspY);
      // Fade in distance
      grid *= 1.0 - perspY * 0.7;

      // Ground base color with depth fog
      vec3 groundColor = mix(vec3(0.01, 0.0, 0.02), vec3(0.03, 0.0, 0.05), perspY * 0.5);

      // Grid color with glow effect
      vec3 gridCol = u_gridColor * grid;
      gridCol *= 1.2 + (1.0 - perspY) * 0.8; // Brighter near camera

      // Add subtle grid glow
      float gridGlow = grid * exp(-perspY * 2.0) * 0.3;
      gridCol += u_gridColor * gridGlow;

      // Sun reflection path on grid
      float reflectX = abs(uv.x - 0.5);
      float reflectionPath = exp(-reflectX * 10.0) * exp(-perspY * 2.5);
      float reflectionShimmer = sin(z * 2.0 - u_time * 2.0) * 0.15 + 0.85;
      reflectionPath *= reflectionShimmer * 0.5 * u_glowIntensity;

      groundColor += gridCol;
      groundColor += u_sunColor * reflectionPath;

      // Fog in distance
      float fog = perspY * perspY * 0.6;
      groundColor = mix(groundColor, u_skyColor1 + u_gridColor * 0.1, fog);

      sky = groundColor;
    }

    // Compose final color
    vec3 color = sky;
    color += sunCol * sun;
    color += sunCol * totalGlow;
    color += u_gridColor * horizonGlow;

    // Subtle vignette
    float vignette = 1.0 - length((uv - 0.5) * vec2(1.3, 1.0)) * 0.4;
    color *= vignette;

    // Tone mapping for smoother colors
    color = color / (1.0 + color * 0.2);

    gl_FragColor = vec4(color, 1.0);
  }
`

interface NeonHorizonShaderProps {
  className?: string
  skyColor1?: string
  skyColor2?: string
  gridColor?: string
  sunColor?: string
  speed?: number
  gridSpeed?: number
  sunSize?: number
  glowIntensity?: number
  isPlaying?: boolean
}

export function NeonHorizonShader({
  className = "",
  skyColor1 = "#0a0015",
  skyColor2 = "#1a0030",
  gridColor = "#ff00ff",
  sunColor = "#ffaa00",
  speed = 1,
  gridSpeed = 1,
  sunSize = 1,
  glowIntensity = 1,
  isPlaying = true,
}: NeonHorizonShaderProps) {
  const uniformSetup = useCallback(
    (gl: WebGLRenderingContext, program: WebGLProgram) => {
      gl.uniform3fv(gl.getUniformLocation(program, "u_skyColor1"), hexToRgb(skyColor1))
      gl.uniform3fv(gl.getUniformLocation(program, "u_skyColor2"), hexToRgb(skyColor2))
      gl.uniform3fv(gl.getUniformLocation(program, "u_gridColor"), hexToRgb(gridColor))
      gl.uniform3fv(gl.getUniformLocation(program, "u_sunColor"), hexToRgb(sunColor))
      gl.uniform1f(gl.getUniformLocation(program, "u_gridSpeed"), gridSpeed)
      gl.uniform1f(gl.getUniformLocation(program, "u_sunSize"), sunSize)
      gl.uniform1f(gl.getUniformLocation(program, "u_glowIntensity"), glowIntensity)
    },
    [skyColor1, skyColor2, gridColor, sunColor, gridSpeed, sunSize, glowIntensity]
  )

  const canvasRef = useShaderRenderer(neonHorizonFragmentShader, uniformSetup, speed, isPlaying)
  return <canvas ref={canvasRef} className={`w-full h-full block ${className || ''}`} />
}

// ============================================
// VORONOI CELLS - Ultra Premium Organic Pattern
// ============================================
const voronoiFragmentShader = `
  precision highp float;

  uniform vec2 u_resolution;
  uniform float u_time;
  uniform vec3 u_color1;
  uniform vec3 u_color2;
  uniform vec3 u_edgeColor;
  uniform float u_scale;
  uniform float u_edgeWidth;
  uniform float u_glowIntensity;
  uniform float u_energyFlow;
  uniform float u_cellDepth;
  uniform float u_movement;
  uniform float u_rgbSplit;

  // High quality hash
  vec2 hash2(vec2 p) {
    p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
    return fract(sin(p) * 43758.5453);
  }

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  // Smooth noise for inner cell patterns
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  // FBM for complex patterns
  float fbm(vec2 p) {
    float v = 0.0;
    v += 0.5 * noise(p); p *= 2.0;
    v += 0.25 * noise(p); p *= 2.0;
    v += 0.125 * noise(p);
    return v;
  }

  // Voronoi with full data
  void voronoi(vec2 p, float t, out float d1, out float d2, out vec2 cellCenter, out vec2 cellId) {
    vec2 n = floor(p);
    vec2 f = fract(p);

    d1 = 10.0;
    d2 = 10.0;

    for (int j = -1; j <= 1; j++) {
      for (int i = -1; i <= 1; i++) {
        vec2 g = vec2(float(i), float(j));
        vec2 cell = n + g;
        vec2 o = hash2(cell);

        // Organic movement with movement control
        float phase = dot(cell, vec2(1.0, 1.7));
        o = 0.5 + u_movement * 0.4 * sin(t + 6.2831 * o + phase);

        vec2 r = g + o - f;
        float d = length(r);

        if (d < d1) {
          d2 = d1;
          d1 = d;
          cellCenter = p - f + g + o;
          cellId = cell;
        } else if (d < d2) {
          d2 = d;
        }
      }
    }
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    float aspect = u_resolution.x / u_resolution.y;
    vec2 p = vec2(uv.x * aspect, uv.y) * u_scale;
    float t = u_time * 0.3;

    // Main voronoi
    float d1, d2;
    vec2 cellCenter, cellId;
    voronoi(p, t, d1, d2, cellCenter, cellId);

    // Edge distance
    float edge = d2 - d1;

    // Cell properties
    float id1 = hash(cellId);
    float id2 = hash(cellId + 100.0);
    float id3 = hash(cellId + 200.0);

    // ========== CELL DEPTH (3D-like shading) ==========
    // Radial gradient from cell center
    float radialDist = d1 * 2.0;

    // Fake 3D dome lighting
    float dome = 1.0 - radialDist * radialDist;
    dome = max(0.0, dome);
    float highlight = pow(dome, 3.0) * u_cellDepth;

    // Edge shadow (cells appear raised)
    float edgeShadow = smoothstep(0.0, 0.15, edge);
    float depth3d = mix(0.4, 1.0, edgeShadow) + highlight * 0.5;

    // ========== CELL COLORS ==========
    vec3 baseColor = mix(u_color1, u_color2, id1);

    // Add variation
    baseColor = mix(baseColor, baseColor * vec3(1.2, 0.9, 1.1), id2 * 0.4);

    // Inner cell pattern (organic texture)
    vec2 cellLocalUV = (p - cellCenter) * 8.0;
    float innerPattern = fbm(cellLocalUV + id1 * 10.0 + t * 0.2);
    baseColor *= 0.85 + innerPattern * 0.3;

    // Apply 3D depth
    baseColor *= depth3d;

    // Cell pulse (breathing effect)
    float pulse = sin(t * 2.0 + id1 * 6.28) * 0.5 + 0.5;
    baseColor *= 0.9 + pulse * 0.2;

    // ========== ENERGY FLOW on edges ==========
    // Animated energy traveling along edges
    float edgeDist = smoothstep(u_edgeWidth * 2.0, 0.0, edge);

    // Energy waves flowing through edges
    float energyPhase = t * 3.0 * u_energyFlow;
    float energy1 = sin(cellCenter.x * 10.0 + cellCenter.y * 7.0 + energyPhase) * 0.5 + 0.5;
    float energy2 = sin(cellCenter.x * 7.0 - cellCenter.y * 11.0 + energyPhase * 1.3) * 0.5 + 0.5;
    float energyFlow = energy1 * energy2;
    energyFlow = pow(energyFlow, 0.5);

    // Sparks along edges
    float spark = noise(p * 30.0 + t * 5.0 * u_energyFlow);
    spark = pow(spark, 8.0) * edgeDist * 3.0;

    // ========== EDGE GLOW LAYERS ==========
    float edgeCore = smoothstep(u_edgeWidth * 0.4, 0.0, edge);
    float edgeMid = smoothstep(u_edgeWidth * 1.5, u_edgeWidth * 0.3, edge);
    float edgeOuter = smoothstep(u_edgeWidth * 3.0, u_edgeWidth, edge);

    // Animated glow intensity
    float glowPulse = 0.7 + pulse * 0.3 + energyFlow * 0.3 * u_energyFlow;
    vec3 glowColor = u_edgeColor * glowPulse * u_glowIntensity;

    // ========== RGB SPLIT on edges ==========
    float rgbOffset = u_rgbSplit * 0.003 * edgeMid;
    vec2 dir = normalize(p - cellCenter + 0.001);

    // Sample edge at offset positions for RGB split
    float d1R, d2R, d1B, d2B;
    vec2 ccR, ccB, ciR, ciB;
    voronoi(p + dir * rgbOffset, t, d1R, d2R, ccR, ciR);
    voronoi(p - dir * rgbOffset, t, d1B, d2B, ccB, ciB);

    float edgeR = smoothstep(u_edgeWidth * 0.5, 0.0, d2R - d1R);
    float edgeB = smoothstep(u_edgeWidth * 0.5, 0.0, d2B - d1B);

    // ========== COMPOSE FINAL COLOR ==========
    vec3 color = baseColor;

    // Inner glow tint
    color = mix(color, u_edgeColor * 0.2, edgeOuter * 0.4 * u_glowIntensity);

    // Mid glow
    color = mix(color, glowColor * 0.7, edgeMid);

    // Core glow
    color = mix(color, glowColor, edgeCore);

    // Bloom
    color += glowColor * edgeCore * 0.8;

    // Energy flow highlight
    color += u_edgeColor * energyFlow * edgeMid * 0.5 * u_energyFlow;

    // Sparks
    color += u_edgeColor * spark * u_energyFlow;

    // RGB split effect
    color.r += edgeR * u_edgeColor.r * u_rgbSplit * 0.5;
    color.b += edgeB * u_edgeColor.b * u_rgbSplit * 0.5;

    // ========== AMBIENT & ATMOSPHERE ==========
    // Subtle overall glow
    float ambientGlow = edgeOuter * 0.1 * u_glowIntensity;
    color += u_edgeColor * ambientGlow;

    // Second voronoi layer for depth (subtle)
    float d1b, d2b;
    vec2 cc2, ci2;
    voronoi(p * 0.5 + 10.0, t * 0.5, d1b, d2b, cc2, ci2);
    float bgEdge = smoothstep(0.1, 0.0, d2b - d1b);
    color += u_edgeColor * bgEdge * 0.05 * u_glowIntensity;

    // Vignette
    float vignette = 1.0 - length(uv - 0.5) * 0.4;
    color *= vignette;

    // Tone mapping
    color = color / (1.0 + color * 0.2);

    // Slight contrast boost
    color = pow(color, vec3(0.95));

    gl_FragColor = vec4(color, 1.0);
  }
`

interface VoronoiShaderProps {
  className?: string
  color1?: string
  color2?: string
  edgeColor?: string
  speed?: number
  scale?: number
  edgeWidth?: number
  glowIntensity?: number
  energyFlow?: number
  cellDepth?: number
  movement?: number
  rgbSplit?: number
  isPlaying?: boolean
}

export function VoronoiShader({
  className = "",
  color1 = "#1a1a3e",
  color2 = "#2d1b4e",
  edgeColor = "#00ffff",
  speed = 1,
  scale = 5,
  edgeWidth = 0.05,
  glowIntensity = 1,
  energyFlow = 1,
  cellDepth = 1,
  movement = 1,
  rgbSplit = 0.5,
  isPlaying = true,
}: VoronoiShaderProps) {
  const uniformSetup = useCallback(
    (gl: WebGLRenderingContext, program: WebGLProgram) => {
      gl.uniform3fv(gl.getUniformLocation(program, "u_color1"), hexToRgb(color1))
      gl.uniform3fv(gl.getUniformLocation(program, "u_color2"), hexToRgb(color2))
      gl.uniform3fv(gl.getUniformLocation(program, "u_edgeColor"), hexToRgb(edgeColor))
      gl.uniform1f(gl.getUniformLocation(program, "u_scale"), scale)
      gl.uniform1f(gl.getUniformLocation(program, "u_edgeWidth"), edgeWidth)
      gl.uniform1f(gl.getUniformLocation(program, "u_glowIntensity"), glowIntensity)
      gl.uniform1f(gl.getUniformLocation(program, "u_energyFlow"), energyFlow)
      gl.uniform1f(gl.getUniformLocation(program, "u_cellDepth"), cellDepth)
      gl.uniform1f(gl.getUniformLocation(program, "u_movement"), movement)
      gl.uniform1f(gl.getUniformLocation(program, "u_rgbSplit"), rgbSplit)
    },
    [color1, color2, edgeColor, scale, edgeWidth, glowIntensity, energyFlow, cellDepth, movement, rgbSplit]
  )

  const canvasRef = useShaderRenderer(voronoiFragmentShader, uniformSetup, speed, isPlaying)
  return <canvas ref={canvasRef} className={`w-full h-full block ${className || ''}`} />
}

// ============================================
// PIXEL ART - Premium Retro Sunset Scene
// ============================================
const pixelArtFragmentShader = `
  precision highp float;

  uniform vec2 u_resolution;
  uniform float u_time;
  uniform vec3 u_skyColor1;
  uniform vec3 u_skyColor2;
  uniform vec3 u_sunColor;
  uniform vec3 u_waterColor;
  uniform float u_pixelSize;
  uniform float u_waveIntensity;
  uniform float u_starDensity;
  uniform float u_starShine;
  uniform float u_shootingStars;
  uniform float u_timeOfDay;

  // High quality hash
  float hash(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
  }

  float hash1(float n) { return fract(sin(n) * 43758.5453); }

  // Pixelate
  vec2 pixelate(vec2 uv, float size) {
    return floor(uv * size) / size;
  }

  // Dithering pattern (Bayer 4x4)
  float dither(vec2 pos) {
    int x = int(mod(pos.x, 4.0));
    int y = int(mod(pos.y, 4.0));
    int index = x + y * 4;
    float limit = 0.0;
    if (index == 0) limit = 0.0625;
    else if (index == 1) limit = 0.5625;
    else if (index == 2) limit = 0.1875;
    else if (index == 3) limit = 0.6875;
    else if (index == 4) limit = 0.8125;
    else if (index == 5) limit = 0.3125;
    else if (index == 6) limit = 0.9375;
    else if (index == 7) limit = 0.4375;
    else if (index == 8) limit = 0.25;
    else if (index == 9) limit = 0.75;
    else if (index == 10) limit = 0.125;
    else if (index == 11) limit = 0.625;
    else if (index == 12) limit = 1.0;
    else if (index == 13) limit = 0.5;
    else if (index == 14) limit = 0.875;
    else limit = 0.375;
    return limit;
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    float aspect = u_resolution.x / u_resolution.y;

    // Pixelation
    float pixelRes = 120.0 / u_pixelSize;
    vec2 pxCoord = floor(uv * pixelRes);
    vec2 pxUV = pxCoord / pixelRes;
    vec2 pxUVaspect = vec2(pxUV.x * aspect, pxUV.y);

    float t = u_time;

    // ========== TIME OF DAY CALCULATIONS ==========
    // u_timeOfDay: 0 = dawn, 0.5 = sunset (default), 1 = dusk/night
    float tod = u_timeOfDay;

    // Time-based adjustments
    float nightAmount = smoothstep(0.6, 1.0, tod);  // How much night influence
    float dawnAmount = 1.0 - smoothstep(0.0, 0.4, tod);  // Dawn influence
    float sunsetAmount = 1.0 - abs(tod - 0.5) * 2.0;  // Peak at 0.5

    // Adjust base colors based on time
    vec3 todSkyColor1 = u_skyColor1;
    vec3 todSkyColor2 = u_skyColor2;
    vec3 todSunColor = u_sunColor;

    // Dusk/night: darker, more blue
    todSkyColor1 = mix(todSkyColor1, todSkyColor1 * vec3(0.3, 0.3, 0.5), nightAmount);
    todSkyColor2 = mix(todSkyColor2, todSkyColor2 * vec3(0.2, 0.25, 0.4), nightAmount);
    todSunColor = mix(todSunColor, todSunColor * vec3(0.8, 0.4, 0.3), nightAmount);

    // Dawn: more pink/orange
    todSkyColor1 = mix(todSkyColor1, todSkyColor1 * vec3(1.1, 0.8, 1.0), dawnAmount);
    todSkyColor2 = mix(todSkyColor2, todSkyColor2 * vec3(1.0, 0.9, 1.1), dawnAmount);
    todSunColor = mix(todSunColor, u_sunColor * vec3(1.2, 0.9, 0.7), dawnAmount);

    // ========== SKY COLOR BANDS (retro style) ==========
    float skyY = pxUV.y;
    vec3 color;

    // Create distinct color bands like classic pixel art
    vec3 skyTop = todSkyColor2;
    vec3 skyMid = mix(todSkyColor2, todSunColor, 0.3);
    vec3 skyLow = mix(todSunColor, todSkyColor1, 0.2);
    vec3 skyHorizon = todSunColor * 1.2;

    float band = floor(skyY * 12.0) / 12.0;
    if (skyY > 0.75) color = mix(skyTop, todSkyColor2, (band - 0.75) * 4.0);
    else if (skyY > 0.55) color = mix(skyMid, skyTop, (band - 0.55) * 5.0);
    else if (skyY > 0.4) color = mix(skyLow, skyMid, (band - 0.4) * 6.67);
    else color = mix(skyHorizon, skyLow, band * 2.5);

    // Dithering between bands
    float ditherVal = dither(pxCoord);
    float bandFrac = fract(skyY * 12.0);
    if (bandFrac > 0.7 && ditherVal > bandFrac) {
      color *= 1.05;
    }

    // Overall brightness adjustment based on time
    float brightnessMod = 1.0 - nightAmount * 0.4;
    color *= brightnessMod;

    // ========== TWINKLING STARS ==========
    // Stars become more visible at night
    float starVisibility = 0.5 + nightAmount * 0.5;  // More stars at night
    float starMinHeight = 0.55 - nightAmount * 0.15;  // Stars visible lower at night

    if (pxUV.y > starMinHeight) {
      float starField = hash(pxCoord * 0.5);

      // Multiple twinkle frequencies for random shine pattern
      float twinkleBase = sin(t * 2.0 * u_starShine + starField * 100.0) * 0.5 + 0.5;
      float twinkleFast = sin(t * 5.0 * u_starShine + starField * 173.0) * 0.5 + 0.5;
      float twinkleSlow = sin(t * 0.8 * u_starShine + starField * 57.0) * 0.5 + 0.5;

      // Combine for irregular twinkling
      float twinkle = twinkleBase * 0.5 + twinkleFast * 0.3 + twinkleSlow * 0.2;
      twinkle = pow(twinkle, 1.5);  // Sharper twinkle

      // Some stars shine brighter at random times
      float shineTime = floor(t * u_starShine + starField * 50.0);
      float randomShine = hash(vec2(shineTime, starField * 100.0));
      float shineBurst = step(0.92, randomShine) * sin(fract(t * u_starShine + starField * 50.0) * 3.14159);
      twinkle += shineBurst * 0.5;

      // Density increases with time of day (more stars at night)
      float density = u_starDensity * 0.018 * smoothstep(starMinHeight, 0.92, pxUV.y) * starVisibility;
      if (starField > 1.0 - density) {
        // Different star sizes and colors
        float starSize = hash(pxCoord * 0.3);
        float brightness = 0.4 + twinkle * 0.6;

        // Big bright stars
        if (starSize > 0.97) {
          brightness = 0.9 + twinkle * 0.1;
        }
        // Medium stars
        else if (starSize > 0.9) {
          brightness = 0.7 + twinkle * 0.3;
        }

        // Stars brighter at night
        brightness *= (0.7 + nightAmount * 0.3);

        // Star color variation (some slightly blue, some warm)
        vec3 starColor = vec3(1.0, 0.98, 0.9);
        if (starSize > 0.85 && starSize < 0.9) starColor = vec3(0.9, 0.95, 1.0);  // Blue-ish
        if (starSize > 0.93 && starSize < 0.97) starColor = vec3(1.0, 0.95, 0.85); // Warm

        color = mix(color, starColor, brightness);
      }
    }

    // ========== REALISTIC SHOOTING STARS ==========
    for (int i = 0; i < 3; i++) {
      float fi = float(i);
      float starCycle = 5.0 + fi * 1.5;  // Different cycle lengths
      float starTime = mod(t * 0.25 * u_shootingStars + fi * 2.7, starCycle);
      float shootDuration = 1.2;

      if (starTime < shootDuration && u_shootingStars > 0.0) {
        float progress = starTime / shootDuration;
        float startX = hash1(fi * 73.156 + floor(t / starCycle) * 13.0) * 0.5 + 0.25;
        float startY = 0.75 + hash1(fi * 91.423 + floor(t / starCycle) * 17.0) * 0.2;

        // Curved trajectory (slight arc)
        float arcAmount = 0.02 * sin(progress * 3.14159);
        vec2 starPos = vec2(
          startX + progress * 0.35,
          startY - progress * 0.18 + arcAmount
        );

        // Pixelate shooting star position
        vec2 pxStarPos = floor(starPos * pixelRes) / pixelRes;
        float dist = length(pxUV - pxStarPos);

        // Bright head with glow
        float headBrightness = 1.0 - progress * 0.3;  // Fade as it travels
        if (dist < 0.012) {
          color = mix(color, vec3(1.0, 1.0, 0.95), headBrightness);
        }

        // Long fading tail (6 segments)
        for (int j = 1; j < 7; j++) {
          float fj = float(j);
          float tailOffset = fj * 0.012;
          vec2 tailPos = starPos - vec2(tailOffset, -tailOffset * 0.5);
          vec2 pxTailPos = floor(tailPos * pixelRes) / pixelRes;
          float tailDist = length(pxUV - pxTailPos);

          float tailBrightness = (1.0 - fj / 7.0) * headBrightness * 0.8;
          float tailSize = 0.008 * (1.0 - fj * 0.1);

          if (tailDist < tailSize) {
            vec3 tailColor = mix(vec3(1.0, 1.0, 0.9), vec3(0.8, 0.85, 1.0), fj / 7.0);
            color = mix(color, tailColor, tailBrightness);
          }
        }
      }
    }

    // ========== SUN (clean, no stripes) ==========
    vec2 sunPos = vec2(0.5, 0.52);
    vec2 sunUV = (pxUV - sunPos) * vec2(aspect, 1.0);
    float sunDist = length(sunUV);
    float sunRadius = 0.13;

    if (sunDist < sunRadius) {
      // Sun base color with warm gradient - clean solid sun
      float sunGrad = sunDist / sunRadius;
      vec3 sunCol = mix(u_sunColor * 1.5, u_sunColor * vec3(1.0, 0.5, 0.3), sunGrad * 0.7);
      color = sunCol;
    }
    // Sun glow layers (softer)
    else if (sunDist < sunRadius + 0.018) {
      color = mix(color, u_sunColor * 1.3, 0.7);
    }
    else if (sunDist < sunRadius + 0.04) {
      color = mix(color, u_sunColor, 0.4);
    }
    else if (sunDist < sunRadius + 0.07) {
      color = mix(color, u_sunColor * 0.7, 0.2);
    }
    else if (sunDist < sunRadius + 0.1) {
      color = mix(color, u_sunColor * 0.4, 0.1);
    }

    // ========== SUN RAYS ==========
    float rayAngle = atan(sunUV.y, sunUV.x);
    float rayPattern = sin(rayAngle * 12.0) * 0.5 + 0.5;
    float rayDist = sunDist - sunRadius;
    float rayFade = smoothstep(0.0, 0.15, rayDist) * (1.0 - smoothstep(0.15, 0.35, rayDist));
    float rays = rayPattern * rayFade * 0.15;
    color += u_sunColor * rays;

    // ========== PIXEL CLOUDS (well separated) ==========
    for (int i = 0; i < 3; i++) {
      float fi = float(i);
      float cloudY = 0.68 + fi * 0.1;  // More vertical spread
      float cloudSpeed = 0.012 + fi * 0.004;
      // Much wider horizontal separation between clouds
      float cloudX = mod(t * cloudSpeed + fi * 0.55, 1.8) - 0.3;

      // Cloud shape (multiple puffs)
      float cloudW = 0.07 + hash1(fi * 31.0) * 0.03;
      float puff1 = step(length((pxUV - vec2(cloudX, cloudY)) * vec2(1.0, 2.0)), cloudW * 0.4);
      float puff2 = step(length((pxUV - vec2(cloudX - cloudW * 0.3, cloudY - 0.01)) * vec2(1.0, 2.2)), cloudW * 0.3);
      float puff3 = step(length((pxUV - vec2(cloudX + cloudW * 0.35, cloudY - 0.008)) * vec2(1.0, 2.0)), cloudW * 0.35);
      float puff4 = step(length((pxUV - vec2(cloudX + cloudW * 0.1, cloudY + 0.015)) * vec2(1.0, 2.5)), cloudW * 0.25);

      float cloud = max(max(puff1, puff2), max(puff3, puff4));

      // Cloud color (pink/orange tinted from sunset)
      vec3 cloudCol = mix(vec3(0.9, 0.85, 0.95), u_sunColor * 0.4, 0.3);
      cloudCol = mix(cloudCol, vec3(0.7, 0.5, 0.6), fi * 0.15); // Darker clouds further back

      color = mix(color, cloudCol, cloud * (0.85 - fi * 0.1));
    }

    // ========== MOUNTAINS (3 layers with parallax) ==========
    float horizon = 0.32;

    // Mountain layer 3 (furthest - hazy purple)
    float m3x = pxUVaspect.x * 1.2;
    float m3 = sin(m3x * 0.5) * 0.12 + sin(m3x * 1.1 + 2.0) * 0.06 + sin(m3x * 2.3) * 0.03;
    m3 = max(0.0, m3) + 0.02;
    if (pxUV.y < horizon + m3 + 0.08 && pxUV.y > horizon) {
      vec3 m3col = mix(u_skyColor1, vec3(0.25, 0.15, 0.35), 0.5);
      // Snow caps on peaks
      float peakZone = smoothstep(horizon + m3 + 0.05, horizon + m3 + 0.08, pxUV.y);
      m3col = mix(m3col, vec3(0.6, 0.55, 0.7), peakZone * 0.5);
      color = m3col;
    }

    // Mountain layer 2 (middle - darker purple)
    float m2x = pxUVaspect.x * 1.8 + 1.0;
    float m2 = sin(m2x * 0.7 + 0.5) * 0.09 + sin(m2x * 1.5) * 0.045 + sin(m2x * 3.0 + 1.0) * 0.02;
    m2 = max(0.0, m2);
    if (pxUV.y < horizon + m2 + 0.04 && pxUV.y > horizon - 0.01) {
      vec3 m2col = vec3(0.15, 0.08, 0.22);
      float peakZone2 = smoothstep(horizon + m2 + 0.01, horizon + m2 + 0.04, pxUV.y);
      m2col = mix(m2col, vec3(0.4, 0.35, 0.5), peakZone2 * 0.4);
      color = m2col;
    }

    // Mountain layer 1 (closest - dark silhouette)
    float m1x = pxUVaspect.x * 2.5 - 0.5;
    float m1 = sin(m1x * 0.9) * 0.05 + sin(m1x * 2.0 + 1.5) * 0.025 + sin(m1x * 4.0) * 0.012;
    m1 = max(0.0, m1);
    if (pxUV.y < horizon + m1 + 0.01 && pxUV.y > horizon - 0.02) {
      color = vec3(0.06, 0.03, 0.1);
    }

    // Palm tree silhouettes
    float palmX = 0.78;
    if (abs(pxUV.x - palmX) < 0.007 && pxUV.y > horizon - 0.01 && pxUV.y < horizon + 0.075) {
      color = vec3(0.03, 0.01, 0.05);
    }
    // Palm leaves
    float leafY = horizon + 0.065;
    for (int i = 0; i < 5; i++) {
      float fi = float(i);
      float angle = (fi - 2.0) * 0.4;
      float leafLen = 0.038 + hash1(fi) * 0.018;
      vec2 leafDir = vec2(cos(angle + 1.57), sin(angle + 1.57));
      vec2 leafStart = vec2(palmX, leafY);
      vec2 toPixel = pxUV - leafStart;
      float proj = dot(toPixel, leafDir);
      float perp = abs(dot(toPixel, vec2(-leafDir.y, leafDir.x)));
      if (proj > 0.0 && proj < leafLen && perp < 0.005 * (1.0 - proj / leafLen)) {
        color = vec3(0.03, 0.01, 0.05);
      }
    }

    // Second palm (smaller, left side)
    float palm2X = 0.18;
    if (abs(pxUV.x - palm2X) < 0.005 && pxUV.y > horizon - 0.015 && pxUV.y < horizon + 0.045) {
      color = vec3(0.03, 0.01, 0.05);
    }
    float leaf2Y = horizon + 0.038;
    for (int i = 0; i < 5; i++) {
      float fi = float(i);
      float angle = (fi - 2.0) * 0.35;
      float leafLen = 0.025 + hash1(fi + 10.0) * 0.012;
      vec2 leafDir = vec2(cos(angle + 1.57), sin(angle + 1.57));
      vec2 leafStart = vec2(palm2X, leaf2Y);
      vec2 toPixel = pxUV - leafStart;
      float proj = dot(toPixel, leafDir);
      float perp = abs(dot(toPixel, vec2(-leafDir.y, leafDir.x)));
      if (proj > 0.0 && proj < leafLen && perp < 0.004 * (1.0 - proj / leafLen)) {
        color = vec3(0.03, 0.01, 0.05);
      }
    }

    // ========== ULTRA PREMIUM WATER / OCEAN ==========
    if (pxUV.y < horizon) {
      float waveT = t * u_waveIntensity;

      // Wave parameters - variable height rows for more organic look
      float baseRowHeight = 0.012;
      float rowIndex = floor((horizon - pxUV.y) / baseRowHeight);
      float rowVariation = 1.0 + 0.3 * sin(rowIndex * 1.7);
      float actualRowHeight = baseRowHeight * rowVariation;
      float rowY = horizon - rowIndex * baseRowHeight;
      float posInRow = (rowY - pxUV.y) / baseRowHeight;

      // Complex multi-layer wave motion
      float wave1 = sin(rowIndex * 0.55 + waveT * 0.6) * 0.03;
      float wave2 = sin(rowIndex * 0.85 + waveT * 0.95 + 1.5) * 0.018;
      float wave3 = sin(rowIndex * 0.35 + waveT * 0.35 + 3.0) * 0.012;
      float wave4 = sin(rowIndex * 1.2 + waveT * 1.4) * 0.008;
      float waveOffset = wave1 + wave2 + wave3 + wave4;
      float localX = pxUV.x + waveOffset;

      // Depth factor with smooth curve
      float maxRows = 22.0;
      float depthFactor = min(rowIndex / maxRows, 1.0);
      float depthCurve = pow(depthFactor, 1.5);

      // ===== RICH WATER COLOR GRADIENT =====
      vec3 horizonWater = mix(u_waterColor * 1.2, u_sunColor * 0.4, 0.35);
      vec3 shallowWater = u_waterColor * vec3(1.1, 1.15, 1.2);
      vec3 midWater = u_waterColor;
      vec3 deepWater = u_waterColor * vec3(0.25, 0.35, 0.45);
      vec3 abyssWater = u_waterColor * vec3(0.15, 0.2, 0.3);

      vec3 waterBase;
      if (depthFactor < 0.15) {
        waterBase = mix(horizonWater, shallowWater, depthFactor / 0.15);
      } else if (depthFactor < 0.4) {
        waterBase = mix(shallowWater, midWater, (depthFactor - 0.15) / 0.25);
      } else if (depthFactor < 0.7) {
        waterBase = mix(midWater, deepWater, (depthFactor - 0.4) / 0.3);
      } else {
        waterBase = mix(deepWater, abyssWater, (depthFactor - 0.7) / 0.3);
      }

      // ===== WAVE ANATOMY =====
      // Realistic wave profile zones
      float waveCrest = 1.0 - smoothstep(0.0, 0.1, posInRow);
      float waveFace = smoothstep(0.05, 0.2, posInRow) * (1.0 - smoothstep(0.2, 0.45, posInRow));
      float waveBody = smoothstep(0.3, 0.5, posInRow) * (1.0 - smoothstep(0.5, 0.75, posInRow));
      float waveTrough = smoothstep(0.65, 0.9, posInRow);
      float waveBack = smoothstep(0.85, 1.0, posInRow);

      // Crest: brightest, catches sunlight
      vec3 crestColor = mix(u_waterColor * 1.6, vec3(0.55, 0.75, 0.85), 0.55);
      crestColor = mix(crestColor, u_sunColor * 0.6, 0.25 * (1.0 - depthFactor));

      // Face: lit by sun, medium bright
      vec3 faceColor = mix(waterBase * 1.3, vec3(0.4, 0.6, 0.7), 0.3);

      // Body: base water color
      vec3 bodyColor = waterBase;

      // Trough: darkest, in shadow
      vec3 troughColor = waterBase * 0.35;

      // Back: transitioning to next wave
      vec3 backColor = waterBase * 0.5;

      // Combine wave shading
      vec3 waveColor = waterBase;
      waveColor = mix(waveColor, crestColor, waveCrest * 0.9);
      waveColor = mix(waveColor, faceColor, waveFace * 0.7);
      waveColor = mix(waveColor, bodyColor, waveBody * 0.5);
      waveColor = mix(waveColor, troughColor, waveTrough * 0.75);
      waveColor = mix(waveColor, backColor, waveBack * 0.6);

      // ===== ADVANCED FOAM SYSTEM =====
      float foamSeed1 = hash(vec2(floor(localX * 18.0), rowIndex));
      float foamSeed2 = hash(vec2(floor(localX * 30.0 + waveT * 0.5), rowIndex + 50.0));
      float foamSeed3 = hash(vec2(floor(localX * 45.0), rowIndex + floor(waveT * 2.0)));
      float foamTimeSeed = hash(vec2(rowIndex, floor(waveT * 2.5)));

      // Primary foam caps - more likely near viewer
      float foamChance = 0.55 - depthFactor * 0.25;
      float primaryFoam = step(foamChance, foamSeed1) * step(posInRow, 0.1);

      // Secondary scattered foam
      float secondaryFoam = step(0.82, foamSeed2) * step(posInRow, 0.18);

      // Foam trails behind crests
      float trailFoam = step(0.88, foamSeed3) * smoothstep(0.1, 0.25, posInRow) * (1.0 - smoothstep(0.25, 0.4, posInRow));

      // Foam dissolving animation
      float dissolve = hash(pxCoord * 0.15 + floor(waveT * 3.5));
      float foamAlpha = 0.85 + 0.15 * dissolve;

      // Foam colors with variation
      float shimmer = 0.88 + 0.12 * sin(localX * 60.0 + waveT * 10.0);
      vec3 brightFoam = vec3(0.95, 0.98, 1.0) * shimmer;
      vec3 midFoam = vec3(0.82, 0.9, 0.95) * shimmer;
      vec3 trailFoamColor = vec3(0.7, 0.8, 0.88);

      waveColor = mix(waveColor, brightFoam, primaryFoam * foamAlpha);
      waveColor = mix(waveColor, midFoam, secondaryFoam * 0.7);
      waveColor = mix(waveColor, trailFoamColor, trailFoam * 0.5);

      // Foam spray/mist particles
      float spray = hash(pxCoord * 0.25 + floor(waveT * 6.0));
      float sprayMask = step(0.96, spray) * step(posInRow, 0.06) * step(foamChance, foamSeed1);
      waveColor = mix(waveColor, vec3(1.0), sprayMask);

      // Bubbles in foam areas
      float bubble = hash(pxCoord * 0.4 + floor(waveT * 4.0));
      float bubbleMask = step(0.92, bubble) * primaryFoam * step(posInRow, 0.08);
      waveColor = mix(waveColor, vec3(0.98, 1.0, 1.0), bubbleMask * 0.6);

      // ===== WAVE RIM LIGHT =====
      float rimLight = step(posInRow, 0.03) * (1.0 - depthFactor * 0.6);
      vec3 rimColor = mix(vec3(0.6, 0.8, 0.9), u_sunColor * 0.4, 0.3);
      waveColor += rimColor * rimLight * 0.35;

      // ===== SPECULAR HIGHLIGHTS ON WAVE FACE =====
      float specular = waveFace * (1.0 - depthFactor * 0.5);
      float specNoise = hash(vec2(floor(localX * 50.0 + waveT * 2.0), rowIndex));
      specular *= step(0.7, specNoise);
      waveColor += vec3(0.2, 0.25, 0.3) * specular * 0.4;

      // ===== UNDERWATER CAUSTICS =====
      float caustic1 = sin(localX * 35.0 + waveT * 1.8) * sin((horizon - pxUV.y) * 50.0 - waveT * 1.2);
      float caustic2 = sin(localX * 25.0 - waveT * 1.3) * sin((horizon - pxUV.y) * 40.0 + waveT * 0.9);
      float caustic = (caustic1 + caustic2) * 0.25 + 0.5;
      caustic = pow(caustic, 4.0) * 0.12 * depthCurve;
      waveColor += vec3(0.08, 0.12, 0.18) * caustic;

      // ===== SUN REFLECTION PATH =====
      float reflectX = abs(pxUV.x - sunPos.x);
      float reflectWidth = 0.035 + depthFactor * 0.22;

      if (reflectX < reflectWidth) {
        float ri = 1.0 - reflectX / reflectWidth;
        ri = pow(ri, 2.5);

        // Multi-layer sparkle system
        float sparkleFreq1 = 22.0 + depthFactor * 8.0;
        float sparkleFreq2 = 35.0 + depthFactor * 12.0;

        float sparkleX1 = floor(localX * sparkleFreq1 + waveT * 3.5);
        float sparkleX2 = floor(localX * sparkleFreq2 + waveT * 5.0);

        float sparkle1 = hash(vec2(sparkleX1, rowIndex + floor(t * 5.0)));
        float sparkle2 = hash(vec2(sparkleX2, rowIndex + floor(t * 7.0)));

        // Sparkles on wave crests
        float crestSparkle = step(0.45, sparkle1) * waveCrest;
        float faceSparkle = step(0.6, sparkle2) * waveFace * 0.6;

        // Intense sparkle points
        float intenseSparkle = step(0.88, sparkle1) * step(posInRow, 0.12);

        // Glitter trail
        float glitter = step(0.75, sparkle2) * (1.0 - smoothstep(0.0, 0.25, posInRow));

        vec3 sunReflect = mix(u_sunColor * 1.4, vec3(1.0, 0.98, 0.92), 0.45);
        vec3 brightReflect = vec3(1.0, 0.99, 0.95);

        float baseReflect = ri * 0.2;
        float sparkleReflect = ri * (crestSparkle * 0.5 + faceSparkle * 0.3 + glitter * 0.25);
        float intenseReflect = ri * intenseSparkle * 0.9;

        waveColor = mix(waveColor, sunReflect, baseReflect + sparkleReflect);
        waveColor = mix(waveColor, brightReflect, intenseReflect);
      }

      // ===== RETRO HORIZONTAL BANDING =====
      float band = mod(rowIndex, 4.0);
      float bandMod = band < 1.0 ? 0.92 : (band < 2.0 ? 0.96 : (band < 3.0 ? 0.98 : 1.0));
      waveColor *= bandMod;

      // ===== DEPTH ATMOSPHERE =====
      vec3 fogColor = mix(u_waterColor * 0.4, u_skyColor1 * 0.5, 0.35);
      waveColor = mix(waveColor, fogColor, depthCurve * 0.35);

      // ===== SUBTLE COLOR VARIATION =====
      float colorVar = hash(vec2(rowIndex, floor(localX * 5.0)));
      waveColor *= 0.97 + colorVar * 0.06;

      color = waveColor;
    }

    // ========== SAILBOAT SILHOUETTE (middle of the sea, closer to viewer) ==========
    float boatX = mod(t * 0.025 + 0.3, 1.6) - 0.3;
    float boatY = horizon - 0.09;  // Middle of the water (closer to viewer)
    float boatBob = sin(t * 1.8) * 0.004;  // More visible bobbing when closer
    boatY += boatBob;

    // Boat hull (larger since it's closer)
    float hullW = 0.05;
    float hullH = 0.014;
    vec2 hullCenter = vec2(boatX, boatY);
    float hullDist = max(abs(pxUV.x - hullCenter.x) / hullW, abs(pxUV.y - hullCenter.y) / hullH);
    float hull = step(hullDist, 1.0) * step(hullCenter.y - hullH, pxUV.y);

    // Mast (larger since boat is closer)
    float mastX = boatX;
    float mastBottom = boatY + hullH * 0.5;
    float mastTop = mastBottom + 0.065;
    float mast = step(abs(pxUV.x - mastX), 0.004) * step(mastBottom, pxUV.y) * step(pxUV.y, mastTop);

    // Sail (triangle, larger)
    float sailLeft = mastX;
    float sailRight = mastX + 0.04;
    float sailBottom = mastBottom + 0.008;
    float sailTop = mastTop - 0.008;
    float sailSlope = (pxUV.y - sailBottom) / (sailTop - sailBottom);
    float sailWidth = sailSlope * (sailRight - sailLeft);
    float sail = step(sailLeft, pxUV.x) * step(pxUV.x, sailLeft + sailWidth) *
                 step(sailBottom, pxUV.y) * step(pxUV.y, sailTop);

    // Boat colors - brown hull, white sail
    vec3 hullColor = vec3(0.35, 0.2, 0.1);  // Brown wood
    vec3 sailColor = vec3(0.95, 0.92, 0.88);  // Off-white sail
    vec3 mastColor = vec3(0.25, 0.15, 0.08);  // Dark brown mast

    color = mix(color, hullColor, hull);
    color = mix(color, mastColor, mast);
    color = mix(color, sailColor, sail);

    // ========== FLYING BIRDS (V-formation) ==========
    for (int i = 0; i < 5; i++) {
      float fi = float(i);
      float formationX = mod(t * 0.035, 1.5) - 0.25;
      float formationY = 0.62;

      // V-formation offset
      float vOffset = abs(fi - 2.0) * 0.025;
      float xOffset = (fi - 2.0) * 0.02;
      float birdX = formationX + xOffset;
      float birdY = formationY - vOffset + sin(t * 4.0 + fi * 1.2) * 0.008;

      vec2 birdPos = vec2(birdX, birdY);
      vec2 pxBirdPos = floor(birdPos * pixelRes) / pixelRes;

      // Bird body
      if (length(pxUV - pxBirdPos) < 0.006) {
        color = vec3(0.05, 0.02, 0.08);
      }
      // Wings
      float wingFlap = sin(t * 10.0 + fi * 2.5);
      vec2 wing1 = pxBirdPos + vec2(-0.01, 0.005 * wingFlap);
      vec2 wing2 = pxBirdPos + vec2(0.01, 0.005 * wingFlap);
      if (length(pxUV - wing1) < 0.005) color = vec3(0.05, 0.02, 0.08);
      if (length(pxUV - wing2) < 0.005) color = vec3(0.05, 0.02, 0.08);
    }

    // Second bird group (scattered)
    for (int i = 0; i < 3; i++) {
      float fi = float(i);
      float birdX = mod(t * (0.025 + fi * 0.008) + fi * 0.35, 1.4) - 0.2;
      float birdY = 0.55 + hash1(fi * 67.0) * 0.12;
      birdY += sin(t * 3.5 + fi * 2.0) * 0.006;

      vec2 pxBirdPos = floor(vec2(birdX, birdY) * pixelRes) / pixelRes;
      if (length(pxUV - pxBirdPos) < 0.005) color = vec3(0.06, 0.03, 0.1);

      float wingFlap = sin(t * 9.0 + fi * 3.0);
      if (length(pxUV - pxBirdPos - vec2(-0.008, 0.004 * wingFlap)) < 0.004) color = vec3(0.06, 0.03, 0.1);
      if (length(pxUV - pxBirdPos - vec2(0.008, 0.004 * wingFlap)) < 0.004) color = vec3(0.06, 0.03, 0.1);
    }

    // ========== DISTANT SHIP ==========
    float shipX = mod(-t * 0.008 + 0.8, 1.4) - 0.2;
    float shipY = horizon - 0.015;
    float shipW = 0.025;

    // Ship hull (small rectangle)
    float shipHull = step(abs(pxUV.x - shipX), shipW * 0.5) *
                     step(abs(pxUV.y - shipY), 0.006);
    // Ship cabin
    float shipCabin = step(abs(pxUV.x - shipX), shipW * 0.2) *
                      step(shipY + 0.004, pxUV.y) * step(pxUV.y, shipY + 0.012);

    vec3 shipColor = vec3(0.08, 0.04, 0.12);
    color = mix(color, shipColor, max(shipHull, shipCabin));

    // ========== HORIZON GLOW LINE ==========
    float horizonGlow = exp(-abs(pxUV.y - horizon) * 80.0) * 0.3;
    color += u_sunColor * horizonGlow * 0.5;

    // ========== WATER SPARKLE OVERLAY ==========
    if (pxUV.y < horizon) {
      float sparkleLayer = hash(pxCoord * 0.08 + floor(t * 8.0));
      float sparkleVisible = step(0.985, sparkleLayer) * (1.0 - smoothstep(horizon - 0.1, horizon, pxUV.y));
      color += vec3(0.3, 0.35, 0.4) * sparkleVisible;
    }

    gl_FragColor = vec4(color, 1.0);
  }
`

interface PixelArtShaderProps {
  className?: string
  skyColor1?: string
  skyColor2?: string
  sunColor?: string
  waterColor?: string
  speed?: number
  pixelSize?: number
  waveIntensity?: number
  starDensity?: number
  starShine?: number
  shootingStars?: number
  timeOfDay?: number
  isPlaying?: boolean
}

export function PixelArtShader({
  className = "",
  skyColor1 = "#1a0533",
  skyColor2 = "#4a1942",
  sunColor = "#ff6b35",
  waterColor = "#1a3a4a",
  speed = 1,
  pixelSize = 1,
  waveIntensity = 1,
  starDensity = 1,
  starShine = 1,
  shootingStars = 1,
  timeOfDay = 0.5,
  isPlaying = true,
}: PixelArtShaderProps) {
  const uniformSetup = useCallback(
    (gl: WebGLRenderingContext, program: WebGLProgram) => {
      gl.uniform3fv(gl.getUniformLocation(program, "u_skyColor1"), hexToRgb(skyColor1))
      gl.uniform3fv(gl.getUniformLocation(program, "u_skyColor2"), hexToRgb(skyColor2))
      gl.uniform3fv(gl.getUniformLocation(program, "u_sunColor"), hexToRgb(sunColor))
      gl.uniform3fv(gl.getUniformLocation(program, "u_waterColor"), hexToRgb(waterColor))
      gl.uniform1f(gl.getUniformLocation(program, "u_pixelSize"), pixelSize)
      gl.uniform1f(gl.getUniformLocation(program, "u_waveIntensity"), waveIntensity)
      gl.uniform1f(gl.getUniformLocation(program, "u_starDensity"), starDensity)
      gl.uniform1f(gl.getUniformLocation(program, "u_starShine"), starShine)
      gl.uniform1f(gl.getUniformLocation(program, "u_shootingStars"), shootingStars)
      gl.uniform1f(gl.getUniformLocation(program, "u_timeOfDay"), timeOfDay)
    },
    [skyColor1, skyColor2, sunColor, waterColor, pixelSize, waveIntensity, starDensity, starShine, shootingStars, timeOfDay]
  )

  const canvasRef = useShaderRenderer(pixelArtFragmentShader, uniformSetup, speed, isPlaying)
  return <canvas ref={canvasRef} className={`w-full h-full block ${className || ''}`} />
}

// ============================================
// FLUID INK - Ultra Premium Flowing Ink Effect
// ============================================
const fluidInkFragmentShader = `
  precision highp float;

  uniform vec2 u_resolution;
  uniform float u_time;
  uniform vec3 u_color1;
  uniform vec3 u_color2;
  uniform vec3 u_color3;
  uniform float u_complexity;
  uniform float u_flowSpeed;
  uniform float u_turbulence;
  uniform float u_inkDensity;
  uniform float u_spread;
  uniform float u_glow;
  uniform float u_zoom;

  // High quality hash functions
  float hash(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
  }

  vec2 hash2(vec2 p) {
    p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
    return -1.0 + 2.0 * fract(sin(p) * 43758.5453);
  }

  vec3 hash3(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
    p3 += dot(p3, p3.yxz + 33.33);
    return fract((p3.xxy + p3.yzz) * p3.zyx);
  }

  // Smooth gradient noise
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);  // Quintic interpolation

    return mix(mix(dot(hash2(i), f),
                   dot(hash2(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x),
               mix(dot(hash2(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)),
                   dot(hash2(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)), u.x), u.y);
  }

  // Multi-octave FBM with rotation for less axis-aligned artifacts
  float fbm(vec2 p, float t) {
    float v = 0.0;
    float amp = 0.5;
    float freq = 1.0;
    mat2 rot = mat2(0.8, 0.6, -0.6, 0.8);  // Rotation matrix

    for (int i = 0; i < 6; i++) {
      v += amp * noise(p * freq + t * (0.15 + float(i) * 0.05));
      p = rot * p;
      freq *= 2.0;
      amp *= 0.5;
    }
    return v;
  }

  // Curl noise for fluid-like motion
  vec2 curl(vec2 p, float t) {
    float eps = 0.01;
    float n1 = fbm(p + vec2(eps, 0.0), t);
    float n2 = fbm(p - vec2(eps, 0.0), t);
    float n3 = fbm(p + vec2(0.0, eps), t);
    float n4 = fbm(p - vec2(0.0, eps), t);

    float dx = (n3 - n4) / (2.0 * eps);
    float dy = -(n1 - n2) / (2.0 * eps);

    return vec2(dx, dy);
  }

  // Vortex function for swirling ink
  vec2 vortex(vec2 p, vec2 center, float strength, float radius) {
    vec2 d = p - center;
    float dist = length(d);
    float angle = strength * exp(-dist * dist / (radius * radius));
    float s = sin(angle);
    float c = cos(angle);
    return vec2(c * d.x - s * d.y, s * d.x + c * d.y) + center;
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    float aspect = u_resolution.x / u_resolution.y;
    vec2 p = vec2((uv.x - 0.5) * aspect, uv.y - 0.5) * 2.0;

    // Apply zoom (higher = zoomed out, lower = zoomed in)
    p *= u_zoom;

    float t = u_time * u_flowSpeed;

    // ===== MULTI-LAYER DOMAIN WARPING =====
    vec2 baseP = p * u_complexity;

    // Layer 1: Large scale flow
    vec2 q = vec2(
      fbm(baseP + vec2(0.0, 0.0) + t * 0.1, t),
      fbm(baseP + vec2(5.2, 1.3) + t * 0.12, t)
    );

    // Layer 2: Medium turbulence
    vec2 r = vec2(
      fbm(baseP + q * 4.0 * u_turbulence + vec2(1.7, 9.2) + t * 0.15, t),
      fbm(baseP + q * 4.0 * u_turbulence + vec2(8.3, 2.8) + t * 0.18, t)
    );

    // Layer 3: Fine detail
    vec2 s = vec2(
      fbm(baseP + r * 2.0 + vec2(3.1, 4.7) + t * 0.08, t),
      fbm(baseP + r * 2.0 + vec2(6.9, 1.2) + t * 0.1, t)
    );

    // ===== CURL NOISE FOR FLUID MOTION =====
    vec2 curlOffset = curl(baseP * 0.5 + t * 0.1, t) * u_spread * 0.5;

    // ===== VORTEX SWIRLS =====
    vec2 warpedP = baseP + q * 3.0 + r * 1.5 + curlOffset;

    // Add animated vortices
    float vortexStrength = u_turbulence * 2.0;
    vec2 vortex1Pos = vec2(sin(t * 0.3) * 0.5, cos(t * 0.25) * 0.5);
    vec2 vortex2Pos = vec2(cos(t * 0.35) * 0.6, sin(t * 0.4) * 0.4);
    vec2 vortex3Pos = vec2(sin(t * 0.2 + 2.0) * 0.4, cos(t * 0.3 + 1.0) * 0.6);

    warpedP = vortex(warpedP, vortex1Pos * u_complexity, vortexStrength * sin(t * 0.5), 1.5);
    warpedP = vortex(warpedP, vortex2Pos * u_complexity, -vortexStrength * 0.7 * cos(t * 0.6), 1.2);
    warpedP = vortex(warpedP, vortex3Pos * u_complexity, vortexStrength * 0.5, 1.0);

    // ===== INK DENSITY FIELD =====
    float inkField = fbm(warpedP + s * u_spread, t);
    float inkField2 = fbm(warpedP * 1.5 + vec2(10.0, 10.0) + s, t * 0.8);
    float inkField3 = fbm(warpedP * 0.7 + vec2(20.0, 5.0), t * 1.2);

    // Combine ink layers with density control
    float ink = inkField * 0.5 + inkField2 * 0.3 + inkField3 * 0.2;
    ink = ink * 0.5 + 0.5;  // Normalize to 0-1

    // Apply ink density curve for more contrast
    ink = pow(ink, 1.0 / (u_inkDensity * 0.5 + 0.5));

    // ===== INK EDGES AND BOUNDARIES =====
    // Calculate gradient for edge detection
    float eps = 0.02;
    float inkL = fbm(warpedP - vec2(eps, 0.0) + s * u_spread, t) * 0.5 + 0.5;
    float inkR = fbm(warpedP + vec2(eps, 0.0) + s * u_spread, t) * 0.5 + 0.5;
    float inkU = fbm(warpedP + vec2(0.0, eps) + s * u_spread, t) * 0.5 + 0.5;
    float inkD = fbm(warpedP - vec2(0.0, eps) + s * u_spread, t) * 0.5 + 0.5;

    float edgeX = abs(inkR - inkL);
    float edgeY = abs(inkU - inkD);
    float edge = sqrt(edgeX * edgeX + edgeY * edgeY) * 8.0;
    edge = smoothstep(0.0, 1.0, edge);

    // ===== COLOR MIXING =====
    // Create smooth color transitions
    vec3 color;

    // Multi-zone color blending
    float zone1 = smoothstep(0.0, 0.35, ink);
    float zone2 = smoothstep(0.3, 0.65, ink);
    float zone3 = smoothstep(0.6, 1.0, ink);

    color = u_color1;
    color = mix(color, u_color2, zone1);
    color = mix(color, u_color3, zone2);
    color = mix(color, u_color1 * 0.3 + u_color3 * 0.7, zone3 * 0.5);

    // Color bleeding effect
    float bleed = fbm(warpedP * 3.0 + t * 0.2, t) * 0.5 + 0.5;
    vec3 bleedColor = mix(u_color2, u_color3, bleed);
    color = mix(color, bleedColor, edge * 0.4);

    // ===== LUMINANCE AND HIGHLIGHTS =====
    // Add bright highlights in flow areas
    float highlight = pow(length(q) * 0.8 + length(r) * 0.4, 2.0);
    highlight = smoothstep(0.3, 1.2, highlight);

    // Glow effect
    vec3 glowColor = mix(u_color2, u_color3, 0.5) * 2.0;
    color += glowColor * highlight * u_glow * 0.3;

    // Edge glow
    color += glowColor * edge * u_glow * 0.2;

    // ===== INK PARTICLES / DROPLETS =====
    // Scattered bright particles
    float particleField = hash(floor(warpedP * 20.0 + t * 2.0));
    float particle = step(0.97, particleField) * step(0.4, ink);
    color += vec3(1.0) * particle * 0.3 * u_glow;

    // Larger flowing particles
    for (int i = 0; i < 5; i++) {
      float fi = float(i);
      vec2 particlePos = vec2(
        sin(t * (0.3 + fi * 0.1) + fi * 2.0) * 0.8,
        cos(t * (0.25 + fi * 0.08) + fi * 1.5) * 0.8
      );
      float pDist = length(p - particlePos);
      float pGlow = exp(-pDist * 8.0) * 0.15 * u_glow;
      color += mix(u_color2, u_color3, fi / 5.0) * pGlow;
    }

    // ===== PAPER TEXTURE =====
    // Subtle paper grain
    float grain = hash(uv * u_resolution.xy * 0.5 + t * 0.1) * 0.03;
    color += grain - 0.015;

    // ===== DEPTH AND ATMOSPHERE =====
    // Ink pooling in darker areas
    float pooling = smoothstep(0.2, 0.0, ink);
    color = mix(color, u_color1 * 0.5, pooling * 0.3);

    // Atmospheric depth
    float depth = length(q) + length(r) * 0.5;
    color *= 0.85 + depth * 0.25;

    // ===== VIGNETTE =====
    float vignette = 1.0 - length(uv - 0.5) * 0.5;
    vignette = smoothstep(0.0, 1.0, vignette);
    color *= vignette;

    // ===== TONE MAPPING =====
    // Soft tone mapping for rich colors
    color = color / (1.0 + color * 0.15);

    // Slight saturation boost
    float luma = dot(color, vec3(0.299, 0.587, 0.114));
    color = mix(vec3(luma), color, 1.15);

    gl_FragColor = vec4(color, 1.0);
  }
`

interface FluidInkShaderProps {
  className?: string
  color1?: string
  color2?: string
  color3?: string
  speed?: number
  complexity?: number
  flowSpeed?: number
  turbulence?: number
  inkDensity?: number
  spread?: number
  glow?: number
  zoom?: number
  isPlaying?: boolean
}

export function FluidInkShader({
  className = "",
  color1 = "#0a0a1a",
  color2 = "#1a1a4e",
  color3 = "#6a0dad",
  speed = 1,
  complexity = 1.5,
  flowSpeed = 0.4,
  turbulence = 1,
  inkDensity = 1,
  spread = 1,
  glow = 1,
  zoom = 1,
  isPlaying = true,
}: FluidInkShaderProps) {
  const uniformSetup = useCallback(
    (gl: WebGLRenderingContext, program: WebGLProgram) => {
      gl.uniform3fv(gl.getUniformLocation(program, "u_color1"), hexToRgb(color1))
      gl.uniform3fv(gl.getUniformLocation(program, "u_color2"), hexToRgb(color2))
      gl.uniform3fv(gl.getUniformLocation(program, "u_color3"), hexToRgb(color3))
      gl.uniform1f(gl.getUniformLocation(program, "u_complexity"), complexity)
      gl.uniform1f(gl.getUniformLocation(program, "u_flowSpeed"), flowSpeed)
      gl.uniform1f(gl.getUniformLocation(program, "u_turbulence"), turbulence)
      gl.uniform1f(gl.getUniformLocation(program, "u_inkDensity"), inkDensity)
      gl.uniform1f(gl.getUniformLocation(program, "u_spread"), spread)
      gl.uniform1f(gl.getUniformLocation(program, "u_glow"), glow)
      gl.uniform1f(gl.getUniformLocation(program, "u_zoom"), zoom)
    },
    [color1, color2, color3, complexity, flowSpeed, turbulence, inkDensity, spread, glow, zoom]
  )

  const canvasRef = useShaderRenderer(fluidInkFragmentShader, uniformSetup, speed, isPlaying)
  return <canvas ref={canvasRef} className={`w-full h-full block ${className || ''}`} />
}

// ==================== AURORA MESH SHADER ====================
// 3D triangular wave mesh with specular lighting - inspired by tabby.sh

const auroraMeshFragmentShader = `
precision highp float;

uniform float u_time;
uniform vec2 u_resolution;
uniform vec3 u_baseColor;
uniform vec3 u_accentColor;
uniform float u_speed;
uniform float u_scale;
uniform float u_waveHeight;
uniform float u_lightIntensity;
uniform float u_specular;

// Complex multi-directional wave function
float wave(vec2 p, float t) {
  // Diagonal wave moving bottom-left to top-right
  float w1 = sin((p.x + p.y) * 1.8 + t * 1.4) * 0.4;

  // Opposite diagonal wave
  float w2 = sin((p.x - p.y) * 2.2 - t * 1.1) * 0.3;

  // Horizontal ripple
  float w3 = sin(p.x * 3.0 + t * 1.8) * cos(p.y * 0.5 + t * 0.3) * 0.25;

  // Vertical ripple
  float w4 = cos(p.y * 2.8 - t * 1.5) * sin(p.x * 0.6 + t * 0.4) * 0.25;

  // Circular ripple from center
  float dist = length(p);
  float w5 = sin(dist * 2.5 - t * 2.0) * 0.2 * exp(-dist * 0.3);

  // Secondary circular ripple (offset center)
  float dist2 = length(p - vec2(1.0, -0.5));
  float w6 = sin(dist2 * 3.0 + t * 1.6) * 0.15 * exp(-dist2 * 0.4);

  // Combine all waves
  return (w1 + w2 + w3 + w4 + w5 + w6) * 0.5;
}

// Get height at a point
float getHeight(vec2 p, float t, float waveH) {
  return wave(p, t) * waveH;
}

// Calculate normal from height field
vec3 calcNormal(vec2 p, float t, float waveH) {
  float eps = 0.04;
  float h = getHeight(p, t, waveH);
  float hx = getHeight(p + vec2(eps, 0.0), t, waveH);
  float hy = getHeight(p + vec2(0.0, eps), t, waveH);
  return normalize(vec3(h - hx, eps * 1.5, h - hy));
}

// Triangle grid
vec3 triangleGrid(vec2 p, out vec2 cellId, out float isUpperTri) {
  vec2 scaled = p * 10.0;
  vec2 cell = floor(scaled);
  vec2 local = fract(scaled);

  isUpperTri = step(local.x + local.y, 1.0);
  cellId = cell + vec2(isUpperTri * 0.5, (1.0 - isUpperTri) * 0.5);

  float edge;
  if (isUpperTri > 0.5) {
    edge = min(min(local.x, local.y), 1.0 - local.x - local.y);
  } else {
    vec2 flipped = 1.0 - local;
    edge = min(min(flipped.x, flipped.y), 1.0 - flipped.x - flipped.y);
  }

  return vec3(local, edge);
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float aspect = u_resolution.x / u_resolution.y;
  vec2 p = (uv - 0.5) * vec2(aspect, 1.0) * 2.5 * u_scale;

  float t = u_time * u_speed * 0.6;
  float waveH = u_waveHeight * 0.6;

  // Get triangle grid info
  vec2 cellId;
  float isUpper;
  vec3 triInfo = triangleGrid(p, cellId, isUpper);
  float edgeDist = triInfo.z;

  // Calculate surface
  float height = getHeight(p, t, waveH);
  vec3 normal = calcNormal(p, t, waveH);

  // Per-triangle normal variation for faceted look
  float cellRand = fract(sin(dot(cellId, vec2(127.1, 311.7))) * 43758.5453);
  float cellRand2 = fract(sin(dot(cellId, vec2(269.5, 183.3))) * 43758.5453);
  vec3 triNormal = normal;
  triNormal.x += (cellRand - 0.5) * 0.4;
  triNormal.z += (cellRand2 - 0.5) * 0.4;
  triNormal = normalize(triNormal);

  vec3 surfacePos = vec3(p.x, height, p.y);
  vec3 viewDir = normalize(vec3(0.0, 1.0, 0.4));

  // === MULTI-LIGHT SETUP ===

  // Light 1: Orbiting main light
  vec3 light1Pos = vec3(
    sin(t * 0.4) * 2.5,
    2.0,
    cos(t * 0.35) * 2.5
  );
  vec3 light1Dir = normalize(light1Pos - surfacePos);
  vec3 half1 = normalize(light1Dir + viewDir);
  float spec1 = pow(max(dot(triNormal, half1), 0.0), 40.0 * u_specular);

  // Light 2: Counter-orbiting light
  vec3 light2Pos = vec3(
    -cos(t * 0.5) * 2.0,
    1.8,
    sin(t * 0.45) * 2.0
  );
  vec3 light2Dir = normalize(light2Pos - surfacePos);
  vec3 half2 = normalize(light2Dir + viewDir);
  float spec2 = pow(max(dot(triNormal, half2), 0.0), 50.0 * u_specular);

  // Light 3: Pulsing top light
  vec3 light3Pos = vec3(
    sin(t * 0.25) * 0.5,
    2.5 + sin(t * 0.8) * 0.3,
    cos(t * 0.3) * 0.5
  );
  vec3 light3Dir = normalize(light3Pos - surfacePos);
  vec3 half3 = normalize(light3Dir + viewDir);
  float spec3 = pow(max(dot(triNormal, half3), 0.0), 60.0 * u_specular);

  // Light 4: Moving edge light for rim effect
  vec3 light4Pos = vec3(
    cos(t * 0.6) * 3.0,
    0.5,
    sin(t * 0.55) * 3.0
  );
  vec3 light4Dir = normalize(light4Pos - surfacePos);
  float rim = 1.0 - max(dot(triNormal, viewDir), 0.0);
  rim = pow(rim, 2.0);
  float spec4 = pow(max(dot(triNormal, normalize(light4Dir + viewDir)), 0.0), 20.0) * rim;

  // Combine all specular
  float totalSpec = (spec1 * 1.0 + spec2 * 0.8 + spec3 * 0.6 + spec4 * 0.7) * u_lightIntensity;

  // Diffuse from main lights
  float diff1 = max(dot(triNormal, light1Dir), 0.0);
  float diff2 = max(dot(triNormal, light2Dir), 0.0);
  float diff = (diff1 + diff2 * 0.6) * 0.4 + 0.35;

  // Base color with height variation
  float heightGrad = height / waveH * 0.5 + 0.5;
  vec3 color = mix(u_baseColor * 0.8, u_baseColor * 1.2, heightGrad * 0.5);

  // Apply lighting
  color *= diff;

  // Add colored specular highlights
  vec3 specColor = mix(u_accentColor, vec3(1.0), 0.3);
  color += specColor * totalSpec * 1.8;

  // Rim lighting with accent color
  color += u_accentColor * rim * 0.25 * u_lightIntensity;

  // Triangle edges - glowing wireframe effect
  float edgeLine = smoothstep(0.0, 0.05, edgeDist);
  float edgeGlow = (1.0 - edgeLine);

  // Edges glow brighter where specular hits
  vec3 edgeColor = mix(u_baseColor * 0.4, u_accentColor * 0.8, totalSpec);
  color = mix(edgeColor, color, edgeLine);
  color += u_accentColor * edgeGlow * totalSpec * 0.6;

  // Pulse effect on peaks
  float pulse = sin(t * 2.0 + cellRand * 6.28) * 0.5 + 0.5;
  float peakGlow = smoothstep(0.5, 0.9, heightGrad) * pulse * 0.2 * u_lightIntensity;
  color += u_accentColor * peakGlow;

  // Subtle color shift based on position for more depth
  vec3 tint = mix(u_accentColor, u_accentColor * vec3(0.8, 1.0, 1.2), uv.x);
  color = mix(color, color * tint, 0.15);

  // Vignette
  float vig = 1.0 - length(uv - 0.5) * 0.9;
  vig = smoothstep(0.0, 0.6, vig);
  color *= 0.6 + vig * 0.4;

  // Tone mapping
  color = color / (1.0 + color * 0.15);

  // Slight contrast boost
  color = pow(color, vec3(0.95));

  gl_FragColor = vec4(color, 1.0);
}
`

interface AuroraMeshShaderProps {
  className?: string
  baseColor?: string
  accentColor?: string
  speed?: number
  scale?: number
  waveHeight?: number
  lightIntensity?: number
  specular?: number
  isPlaying?: boolean
}

export function AuroraMeshShader({
  className = "",
  baseColor = "#0a0a12",
  accentColor = "#6366f1",
  speed = 1,
  scale = 1,
  waveHeight = 1,
  lightIntensity = 1,
  specular = 1,
  isPlaying = true,
}: AuroraMeshShaderProps) {
  const uniformSetup = useCallback(
    (gl: WebGLRenderingContext, program: WebGLProgram) => {
      gl.uniform3fv(gl.getUniformLocation(program, "u_baseColor"), hexToRgb(baseColor))
      gl.uniform3fv(gl.getUniformLocation(program, "u_accentColor"), hexToRgb(accentColor))
      gl.uniform1f(gl.getUniformLocation(program, "u_speed"), speed)
      gl.uniform1f(gl.getUniformLocation(program, "u_scale"), scale)
      gl.uniform1f(gl.getUniformLocation(program, "u_waveHeight"), waveHeight)
      gl.uniform1f(gl.getUniformLocation(program, "u_lightIntensity"), lightIntensity)
      gl.uniform1f(gl.getUniformLocation(program, "u_specular"), specular)
    },
    [baseColor, accentColor, speed, scale, waveHeight, lightIntensity, specular]
  )

  const canvasRef = useShaderRenderer(auroraMeshFragmentShader, uniformSetup, speed, isPlaying)
  return <canvas ref={canvasRef} className={`w-full h-full block ${className || ''}`} />
}

// ==================== WAVE TERRAIN SHADER ====================
// 3D perspective view of triangular wave mesh - side view with depth

const waveTerrainFragmentShader = `
precision highp float;

uniform float u_time;
uniform vec2 u_resolution;
uniform vec3 u_baseColor;
uniform vec3 u_accentColor;
uniform vec3 u_skyColor;
uniform float u_speed;
uniform float u_scale;
uniform float u_waveHeight;
uniform float u_lightIntensity;
uniform float u_cameraHeight;
uniform float u_fogDensity;
uniform float u_gridSize;
uniform float u_particleIntensity;

#define PI 3.14159265359

// Hash for randomness
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

// Layered wave function with multiple directions
float wave(vec2 p, float t) {
  float w = 0.0;
  // Main waves - different directions
  w += sin(p.x * 0.6 + t * 1.2) * 0.6;
  w += sin(p.x * 0.3 - p.y * 0.2 + t * 0.9) * 0.9;
  w += sin(p.y * 0.4 + t * 0.7) * 0.5;
  w += sin((p.x + p.y) * 0.25 + t) * 0.7;
  w += sin((p.x - p.y) * 0.35 - t * 0.6) * 0.4;
  // Ripple effect
  float ripple = sin(length(p - vec2(sin(t * 0.3) * 5.0, cos(t * 0.2) * 5.0)) * 0.5 - t * 2.0);
  w += ripple * 0.3;
  return w * 0.4;
}

float getHeight(vec2 p, float t, float waveH) {
  return wave(p * 0.5, t) * waveH;
}

// Triangle grid with edge glow data
void getTriangle(vec2 p, float gridSize, float t, float waveH,
                 out vec3 v0, out vec3 v1, out vec3 v2, out vec3 flatNormal,
                 out float edgeDist, out vec2 cellId) {
  vec2 cell = floor(p / gridSize);
  cellId = cell;
  vec2 local = fract(p / gridSize);

  bool upperTri = (local.x + local.y) < 1.0;

  vec2 p0, p1, p2;
  if (upperTri) {
    p0 = cell * gridSize;
    p1 = (cell + vec2(1.0, 0.0)) * gridSize;
    p2 = (cell + vec2(0.0, 1.0)) * gridSize;
  } else {
    p0 = (cell + vec2(1.0, 1.0)) * gridSize;
    p1 = (cell + vec2(0.0, 1.0)) * gridSize;
    p2 = (cell + vec2(1.0, 0.0)) * gridSize;
  }

  float h0 = getHeight(p0, t, waveH);
  float h1 = getHeight(p1, t, waveH);
  float h2 = getHeight(p2, t, waveH);

  v0 = vec3(p0.x, h0, p0.y);
  v1 = vec3(p1.x, h1, p1.y);
  v2 = vec3(p2.x, h2, p2.y);

  vec3 e1 = v1 - v0;
  vec3 e2 = v2 - v0;
  flatNormal = normalize(cross(e1, e2));

  if (upperTri) {
    edgeDist = min(min(local.x, local.y), 1.0 - local.x - local.y);
  } else {
    vec2 fl = 1.0 - local;
    edgeDist = min(min(fl.x, fl.y), 1.0 - fl.x - fl.y);
  }
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float aspect = u_resolution.x / u_resolution.y;

  float t = u_time * u_speed * 0.8;
  float waveH = u_waveHeight * 2.0;
  float gridSize = u_gridSize / u_scale;

  // Camera with smooth motion
  float camHeight = 3.5 * u_cameraHeight;
  vec3 camPos = vec3(0.0, camHeight, -6.0);
  camPos.x += sin(t * 0.15) * 3.0;
  camPos.y += sin(t * 0.2) * 0.5 * u_cameraHeight;
  camPos.z -= t * 2.5;

  vec3 lookAt = camPos + vec3(sin(t * 0.1) * 2.0, -2.5, 18.0);
  vec3 forward = normalize(lookAt - camPos);
  vec3 right = normalize(cross(vec3(0.0, 1.0, 0.0), forward));
  vec3 up = cross(forward, right);

  vec2 screenUV = (uv - 0.5) * vec2(aspect, 1.0);
  vec3 rayDir = normalize(forward * 1.5 + right * screenUV.x + up * screenUV.y);

  // Rich sky gradient
  float skyT = rayDir.y * 0.5 + 0.5;
  vec3 sky = mix(u_skyColor * 0.5, u_skyColor * 0.05, pow(skyT, 0.7));

  // Horizon glow - multiple layers
  float horizonGlow = exp(-abs(rayDir.y) * 6.0);
  float horizonGlow2 = exp(-abs(rayDir.y) * 15.0);
  sky += u_accentColor * horizonGlow * 0.4;
  sky += u_accentColor * horizonGlow2 * 0.6;

  // Subtle stars
  vec2 starUV = rayDir.xy * 200.0;
  float star = hash(floor(starUV));
  star = step(0.997, star) * (0.3 + 0.7 * sin(t * 3.0 + star * 100.0) * 0.5 + 0.5);
  sky += star * smoothstep(0.3, 0.6, rayDir.y) * 0.5;

  vec3 color = sky;

  // Raymarch
  float dist = 0.0;
  bool hit = false;
  vec3 hitPos;

  for (int i = 0; i < 300; i++) {
    hitPos = camPos + rayDir * dist;
    float h = getHeight(hitPos.xz, t, waveH);
    float diff = hitPos.y - h;

    if (diff < 0.005 && dist > 0.1) {
      hit = true;
      break;
    }

    // Step size increases with distance for efficiency but stays small enough to hit terrain
    float stepMult = 1.0 + dist * 0.01;
    dist += max(0.04, diff * 0.3) * stepMult;
    if (dist > 400.0) break;
  }

  if (hit) {
    vec3 v0, v1, v2, normal;
    float edgeDist;
    vec2 cellId;
    getTriangle(hitPos.xz, gridSize, t, waveH, v0, v1, v2, normal, edgeDist, cellId);

    if (normal.y < 0.0) normal = -normal;

    vec3 viewDir = -rayDir;
    float avgHeight = (v0.y + v1.y + v2.y) / 3.0;
    float heightGrad = avgHeight / waveH * 0.5 + 0.5;
    heightGrad = clamp(heightGrad, 0.0, 1.0);

    // Cell-based variation
    float cellRand = hash(cellId);

    // === LIGHTING ===

    // Main directional light
    vec3 lightDir = normalize(vec3(0.4, 0.9, 0.3));
    float diff = max(dot(normal, lightDir), 0.0);

    // Specular
    vec3 halfVec = normalize(lightDir + viewDir);
    float spec = pow(max(dot(normal, halfVec), 0.0), 80.0) * u_lightIntensity;

    // Colored moving lights
    vec3 light2Dir = normalize(vec3(sin(t * 0.4) * 2.0, 0.5, cos(t * 0.3)));
    float spec2 = pow(max(dot(normal, normalize(light2Dir + viewDir)), 0.0), 100.0);

    vec3 light3Dir = normalize(vec3(cos(t * 0.5), 0.7, sin(t * 0.6) * 2.0));
    float spec3 = pow(max(dot(normal, normalize(light3Dir + viewDir)), 0.0), 60.0);

    // Rim / fresnel
    float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 4.0);

    // Dynamic color based on height + cell variation
    vec3 lowColor = u_baseColor * 0.4;
    vec3 midColor = u_baseColor * 0.9;
    vec3 highColor = mix(u_baseColor, u_accentColor, 0.5) * 1.3;

    vec3 triColor = mix(lowColor, midColor, smoothstep(0.25, 0.5, heightGrad));
    triColor = mix(triColor, highColor, smoothstep(0.55, 0.85, heightGrad));

    // Add subtle color variation per cell
    triColor *= 0.9 + cellRand * 0.2;

    // Base lighting
    float ambient = 0.15;
    color = triColor * (diff * 0.6 + ambient);

    // Specular highlights
    color += u_accentColor * spec * 2.5;
    color += vec3(0.6, 0.4, 1.0) * spec2 * 0.8 * u_lightIntensity; // Purple-ish light
    color += vec3(0.4, 0.8, 1.0) * spec3 * 0.5 * u_lightIntensity; // Cyan-ish light

    // Fresnel rim glow
    color += u_accentColor * fresnel * 0.5 * u_lightIntensity;

    // Peak emission - triangles at peaks glow
    float peakGlow = smoothstep(0.65, 0.95, heightGrad);
    color += u_accentColor * peakGlow * 0.6 * u_lightIntensity;

    // Pulse wave that travels across terrain
    float pulseWave = sin(hitPos.z * 0.3 + t * 2.0) * 0.5 + 0.5;
    pulseWave *= smoothstep(0.5, 0.8, heightGrad);
    color += u_accentColor * pulseWave * 0.2 * u_lightIntensity;

    // === GLOWING EDGES (TRON STYLE) ===
    float edgeGlow = 1.0 - smoothstep(0.0, 0.04, edgeDist);
    float edgeGlow2 = 1.0 - smoothstep(0.0, 0.08, edgeDist);

    // Edge brightness varies with height
    float edgeBrightness = 0.4 + heightGrad * 0.6;
    edgeBrightness += spec * 0.5; // Edges brighter when catching light

    // Animated edge pulse
    float edgePulse = sin(cellId.x * 0.5 + cellId.y * 0.3 + t * 3.0) * 0.3 + 0.7;

    vec3 edgeColor = u_accentColor * edgeBrightness * edgePulse;
    color = mix(color, edgeColor * 1.5, edgeGlow * 0.9);
    color += u_accentColor * edgeGlow2 * 0.15; // Soft outer glow

    // === SCANLINES (subtle) ===
    float scanline = sin(hitPos.z * 8.0 + t * 5.0) * 0.5 + 0.5;
    scanline = smoothstep(0.3, 0.7, scanline);
    color += u_accentColor * scanline * 0.03 * u_lightIntensity;

    // Distance fog with color - gradual fade to horizon
    float fog = 1.0 - exp(-dist * 0.005 * u_fogDensity);
    vec3 fogColor = u_skyColor * 0.3 + u_accentColor * (horizonGlow * 0.4 + 0.1);
    color = mix(color, fogColor, fog);
  }

  // Floating particles / dust - only in upper half (sky area), sparse and distant
  if (uv.y > 0.5 && u_particleIntensity > 0.0) {
    for (int i = 0; i < 2; i++) {
      float fi = float(i);
      vec2 particleUV = uv * 4.0 + vec2(t * (0.02 + fi * 0.015), t * (0.03 + fi * 0.01));
      float particle = hash(floor(particleUV));
      particle = step(0.992, particle);
      float particleGlow = particle * (0.5 + 0.5 * sin(t * 4.0 + fi));
      color += u_accentColor * particleGlow * 0.15 * u_particleIntensity;
    }
  }

  // Vignette
  vec2 vigUV = uv - 0.5;
  float vig = 1.0 - dot(vigUV, vigUV) * 1.2;
  color *= smoothstep(0.0, 0.4, vig) * 0.35 + 0.65;

  // Subtle film grain
  float grain = hash(uv * u_resolution + t) * 0.03;
  color += grain - 0.015;

  // Tone mapping
  color = color / (color + 0.6);
  color = pow(color, vec3(0.95));

  // Slight contrast boost
  color = smoothstep(0.0, 1.0, color);

  gl_FragColor = vec4(color, 1.0);
}
`

interface WaveTerrainShaderProps {
  className?: string
  baseColor?: string
  accentColor?: string
  skyColor?: string
  speed?: number
  scale?: number
  waveHeight?: number
  lightIntensity?: number
  cameraHeight?: number
  fogDensity?: number
  gridSize?: number
  particleIntensity?: number
  isPlaying?: boolean
}

export function WaveTerrainShader({
  className = "",
  baseColor = "#0a0a15",
  accentColor = "#8b5cf6",
  skyColor = "#0a0612",
  speed = 1,
  scale = 1,
  waveHeight = 1,
  lightIntensity = 1,
  cameraHeight = 1,
  fogDensity = 1,
  gridSize = 1.4,
  particleIntensity = 1,
  isPlaying = true,
}: WaveTerrainShaderProps) {
  const uniformSetup = useCallback(
    (gl: WebGLRenderingContext, program: WebGLProgram) => {
      gl.uniform3fv(gl.getUniformLocation(program, "u_baseColor"), hexToRgb(baseColor))
      gl.uniform3fv(gl.getUniformLocation(program, "u_accentColor"), hexToRgb(accentColor))
      gl.uniform3fv(gl.getUniformLocation(program, "u_skyColor"), hexToRgb(skyColor))
      gl.uniform1f(gl.getUniformLocation(program, "u_speed"), speed)
      gl.uniform1f(gl.getUniformLocation(program, "u_scale"), scale)
      gl.uniform1f(gl.getUniformLocation(program, "u_waveHeight"), waveHeight)
      gl.uniform1f(gl.getUniformLocation(program, "u_lightIntensity"), lightIntensity)
      gl.uniform1f(gl.getUniformLocation(program, "u_cameraHeight"), cameraHeight)
      gl.uniform1f(gl.getUniformLocation(program, "u_fogDensity"), fogDensity)
      gl.uniform1f(gl.getUniformLocation(program, "u_gridSize"), gridSize)
      gl.uniform1f(gl.getUniformLocation(program, "u_particleIntensity"), particleIntensity)
    },
    [baseColor, accentColor, skyColor, speed, scale, waveHeight, lightIntensity, cameraHeight, fogDensity, gridSize, particleIntensity]
  )

  const canvasRef = useShaderRenderer(waveTerrainFragmentShader, uniformSetup, speed, isPlaying)
  return <canvas ref={canvasRef} className={`w-full h-full block ${className || ''}`} />
}

// ==================== GRADIENT ORBS SHADER ====================
// Modern flowing gradient blobs with metaball blending - perfect for SaaS websites

const gradientOrbsFragmentShader = `
precision highp float;

uniform float u_time;
uniform vec2 u_resolution;
uniform vec3 u_color1;
uniform vec3 u_color2;
uniform vec3 u_color3;
uniform vec3 u_color4;
uniform vec3 u_bgColor;
uniform float u_speed;
uniform float u_scale;
uniform float u_blur;
uniform float u_intensity;
uniform float u_glow;
uniform float u_distortion;
uniform float u_chromaticAberration;
uniform float u_grain;
uniform float u_vignette;
uniform float u_colorShift;
uniform float u_pulse;
uniform float u_orbCount;

#define PI 3.14159265359

// Simplex noise functions
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y + vec4(0.0, i1.y, i2.y, 1.0)) + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

// FBM noise for organic distortion
float fbm(vec3 p) {
  float v = 0.0;
  float amp = 0.5;
  for (int i = 0; i < 4; i++) {
    v += amp * snoise(p);
    p *= 2.0;
    amp *= 0.5;
  }
  return v;
}

// Metaball-style soft blending
float metaball(vec2 uv, vec2 center, float radius, float softness) {
  float d = length(uv - center);
  // Smooth polynomial falloff for metaball effect
  float r = radius * (1.0 + softness);
  if (d > r) return 0.0;
  float x = d / r;
  // Quintic smooth falloff
  return 1.0 - x * x * x * (x * (x * 6.0 - 15.0) + 10.0);
}

// Enhanced orb with glow layers
float orbWithGlow(vec2 uv, vec2 center, float radius, float softness, float glowAmount) {
  float core = metaball(uv, center, radius, softness);
  float glow1 = metaball(uv, center, radius * 1.5, softness * 2.0) * 0.4;
  float glow2 = metaball(uv, center, radius * 2.2, softness * 3.0) * 0.15;
  float glow3 = exp(-length(uv - center) * 1.5 / radius) * 0.1;
  return core + (glow1 + glow2 + glow3) * glowAmount;
}

// Color palette interpolation with smooth transitions
vec3 getOrbColor(float id, float t, vec3 c1, vec3 c2, vec3 c3, vec3 c4, float shift) {
  float phase = id * 2.39996 + t * shift;
  float s = sin(phase) * 0.5 + 0.5;
  float c = cos(phase * 0.7) * 0.5 + 0.5;

  vec3 col = mix(c1, c2, s);
  col = mix(col, c3, c * (1.0 - s));
  col = mix(col, c4, sin(phase * 1.3) * 0.3 + 0.2);

  return col;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  float aspect = u_resolution.x / u_resolution.y;
  vec2 p = (uv - 0.5) * vec2(aspect, 1.0);

  float t = u_time * u_speed * 0.25;
  float scale = u_scale;
  float blur = u_blur * 0.25;

  // Noise-based distortion for organic movement
  float distortAmount = u_distortion * 0.15;
  vec2 distort = vec2(
    fbm(vec3(p * 2.0, t * 0.3)),
    fbm(vec3(p * 2.0 + 100.0, t * 0.3))
  ) * distortAmount;
  vec2 pDistorted = p + distort;

  // Pulse effect
  float pulse = 1.0 + sin(t * 2.0) * u_pulse * 0.15;

  // Calculate orb positions with complex organic motion
  vec2 orbPositions[8];
  float orbSizes[8];
  float orbPhases[8];

  // Orb 1 - Large primary
  orbPositions[0] = vec2(
    sin(t * 0.7) * 0.35 + cos(t * 0.31) * 0.2 + sin(t * 0.13) * 0.1,
    cos(t * 0.53) * 0.28 + sin(t * 0.41) * 0.15 + cos(t * 0.17) * 0.08
  ) * scale;
  orbSizes[0] = (0.32 + sin(t * 0.6) * 0.06) * pulse;
  orbPhases[0] = 0.0;

  // Orb 2 - Large secondary
  orbPositions[1] = vec2(
    cos(t * 0.51 + 2.1) * 0.42 + sin(t * 0.27) * 0.12,
    sin(t * 0.63 + 1.2) * 0.32 + cos(t * 0.37) * 0.1
  ) * scale;
  orbSizes[1] = (0.28 + cos(t * 0.5) * 0.05) * pulse;
  orbPhases[1] = 1.0;

  // Orb 3 - Medium
  orbPositions[2] = vec2(
    sin(t * 0.43 + 4.2) * 0.38 + cos(t * 0.61) * 0.08,
    cos(t * 0.71 + 3.1) * 0.35 + sin(t * 0.33) * 0.12
  ) * scale;
  orbSizes[2] = (0.24 + sin(t * 0.7 + 1.0) * 0.04) * pulse;
  orbPhases[2] = 2.0;

  // Orb 4 - Medium accent
  orbPositions[3] = vec2(
    cos(t * 0.91 + 1.7) * 0.3 + sin(t * 0.19) * 0.15,
    sin(t * 0.83 + 2.7) * 0.28 + cos(t * 0.29) * 0.1
  ) * scale;
  orbSizes[3] = (0.2 + cos(t * 0.9) * 0.03) * pulse;
  orbPhases[3] = 3.0;

  // Orb 5 - Small fast
  orbPositions[4] = vec2(
    sin(t * 1.13 + 3.2) * 0.45 + cos(t * 0.47) * 0.1,
    cos(t * 0.97 + 1.2) * 0.4 + sin(t * 0.53) * 0.08
  ) * scale;
  orbSizes[4] = (0.16 + sin(t * 1.1) * 0.025) * pulse;
  orbPhases[4] = 4.0;

  // Orb 6 - Small accent
  orbPositions[5] = vec2(
    cos(t * 0.79 + 5.1) * 0.5 + sin(t * 0.37) * 0.08,
    sin(t * 1.07 + 0.8) * 0.38 + cos(t * 0.43) * 0.12
  ) * scale;
  orbSizes[5] = (0.14 + cos(t * 0.8 + 2.0) * 0.02) * pulse;
  orbPhases[5] = 5.0;

  // Orb 7 - Tiny detail
  orbPositions[6] = vec2(
    sin(t * 1.31 + 2.4) * 0.55 + cos(t * 0.67) * 0.06,
    cos(t * 1.19 + 4.1) * 0.48 + sin(t * 0.71) * 0.1
  ) * scale;
  orbSizes[6] = (0.11 + sin(t * 1.3 + 1.5) * 0.015) * pulse;
  orbPhases[6] = 6.0;

  // Orb 8 - Tiny accent
  orbPositions[7] = vec2(
    cos(t * 1.47 + 1.1) * 0.48 + sin(t * 0.83) * 0.12,
    sin(t * 1.23 + 3.7) * 0.52 + cos(t * 0.59) * 0.08
  ) * scale;
  orbSizes[7] = (0.09 + cos(t * 1.2) * 0.012) * pulse;
  orbPhases[7] = 7.0;

  // Calculate metaball field
  float field = 0.0;
  vec3 colorAccum = vec3(0.0);
  float weightAccum = 0.0;

  int numOrbs = int(u_orbCount);

  for (int i = 0; i < 8; i++) {
    if (i >= numOrbs) break;

    float orbValue = orbWithGlow(pDistorted, orbPositions[i], orbSizes[i] * scale, blur, u_glow);
    field += orbValue;

    // Color contribution weighted by orb influence
    vec3 orbColor = getOrbColor(orbPhases[i], t, u_color1, u_color2, u_color3, u_color4, u_colorShift);
    colorAccum += orbColor * orbValue;
    weightAccum += orbValue;
  }

  // Normalize color by total influence
  vec3 orbColorFinal = weightAccum > 0.001 ? colorAccum / weightAccum : u_bgColor;

  // Smooth metaball threshold
  float threshold = 0.5;
  float edge = smoothstep(threshold - 0.3, threshold + 0.2, field);

  // Background with subtle gradient
  vec2 bgGrad = uv - 0.5;
  vec3 bgColor = u_bgColor * (1.0 - length(bgGrad) * 0.15);

  // Mix orb color with background
  vec3 color = mix(bgColor, orbColorFinal, edge * u_intensity);

  // Add glow bloom
  float bloom = smoothstep(0.3, 1.5, field) * u_glow * 0.4;
  color += mix(u_color1, u_color2, 0.5) * bloom;

  // Extra highlight where field is strongest
  float highlight = smoothstep(1.2, 2.5, field);
  color += vec3(1.0) * highlight * 0.15 * u_intensity;

  // Chromatic aberration
  if (u_chromaticAberration > 0.0) {
    vec2 caOffset = (uv - 0.5) * u_chromaticAberration * 0.02;
    vec2 uvR = uv + caOffset;
    vec2 uvB = uv - caOffset;

    // Recalculate for offset UVs (simplified)
    vec2 pR = (uvR - 0.5) * vec2(aspect, 1.0) + distort;
    vec2 pB = (uvB - 0.5) * vec2(aspect, 1.0) + distort;

    float fieldR = 0.0, fieldB = 0.0;
    for (int i = 0; i < 8; i++) {
      if (i >= numOrbs) break;
      fieldR += orbWithGlow(pR, orbPositions[i], orbSizes[i] * scale, blur, u_glow * 0.5);
      fieldB += orbWithGlow(pB, orbPositions[i], orbSizes[i] * scale, blur, u_glow * 0.5);
    }
    float edgeR = smoothstep(threshold - 0.3, threshold + 0.2, fieldR);
    float edgeB = smoothstep(threshold - 0.3, threshold + 0.2, fieldB);

    color.r = mix(color.r, orbColorFinal.r, edgeR * u_intensity * 0.5);
    color.b = mix(color.b, orbColorFinal.b, edgeB * u_intensity * 0.5);
  }

  // Subtle noise texture for organic feel
  float noise = fbm(vec3(p * 3.0, t * 0.1)) * 0.03 * u_distortion;
  color += noise;

  // Vignette
  float vig = 1.0 - length(uv - 0.5) * u_vignette * 0.8;
  vig = smoothstep(0.0, 1.0, vig);
  color *= vig;

  // Film grain
  float grain = (snoise(vec3(gl_FragCoord.xy * 0.5, t * 15.0)) * 0.5 + 0.5);
  grain = grain * u_grain * 0.04 - u_grain * 0.02;
  color += grain;

  // Tone mapping - filmic curve
  color = color / (color + 0.4) * 1.2;

  // Subtle contrast enhancement
  color = smoothstep(0.0, 1.0, color);

  // Final clamp
  color = clamp(color, 0.0, 1.0);

  gl_FragColor = vec4(color, 1.0);
}
`

interface GradientOrbsShaderProps {
  className?: string
  color1?: string
  color2?: string
  color3?: string
  color4?: string
  bgColor?: string
  speed?: number
  scale?: number
  blur?: number
  intensity?: number
  glow?: number
  distortion?: number
  chromaticAberration?: number
  grain?: number
  vignette?: number
  colorShift?: number
  pulse?: number
  orbCount?: number
  isPlaying?: boolean
}

export function GradientOrbsShader({
  className = "",
  color1 = "#ff6b00",
  color2 = "#ff0844",
  color3 = "#ffb700",
  color4 = "#ff4500",
  bgColor = "#0a0a0a",
  speed = 1,
  scale = 0.7,
  blur = 1,
  intensity = 1,
  glow = 1,
  distortion = 0.5,
  chromaticAberration = 0,
  grain = 0.3,
  vignette = 0.5,
  colorShift = 0.3,
  pulse = 0.3,
  orbCount = 6,
  isPlaying = true,
}: GradientOrbsShaderProps) {
  const uniformSetup = useCallback(
    (gl: WebGLRenderingContext, program: WebGLProgram) => {
      gl.uniform3fv(gl.getUniformLocation(program, "u_color1"), hexToRgb(color1))
      gl.uniform3fv(gl.getUniformLocation(program, "u_color2"), hexToRgb(color2))
      gl.uniform3fv(gl.getUniformLocation(program, "u_color3"), hexToRgb(color3))
      gl.uniform3fv(gl.getUniformLocation(program, "u_color4"), hexToRgb(color4))
      gl.uniform3fv(gl.getUniformLocation(program, "u_bgColor"), hexToRgb(bgColor))
      gl.uniform1f(gl.getUniformLocation(program, "u_speed"), speed)
      gl.uniform1f(gl.getUniformLocation(program, "u_scale"), scale)
      gl.uniform1f(gl.getUniformLocation(program, "u_blur"), blur)
      gl.uniform1f(gl.getUniformLocation(program, "u_intensity"), intensity)
      gl.uniform1f(gl.getUniformLocation(program, "u_glow"), glow)
      gl.uniform1f(gl.getUniformLocation(program, "u_distortion"), distortion)
      gl.uniform1f(gl.getUniformLocation(program, "u_chromaticAberration"), chromaticAberration)
      gl.uniform1f(gl.getUniformLocation(program, "u_grain"), grain)
      gl.uniform1f(gl.getUniformLocation(program, "u_vignette"), vignette)
      gl.uniform1f(gl.getUniformLocation(program, "u_colorShift"), colorShift)
      gl.uniform1f(gl.getUniformLocation(program, "u_pulse"), pulse)
      gl.uniform1f(gl.getUniformLocation(program, "u_orbCount"), orbCount)
    },
    [color1, color2, color3, color4, bgColor, speed, scale, blur, intensity, glow, distortion, chromaticAberration, grain, vignette, colorShift, pulse, orbCount]
  )

  const canvasRef = useShaderRenderer(gradientOrbsFragmentShader, uniformSetup, speed, isPlaying)
  return <canvas ref={canvasRef} className={`w-full h-full block ${className || ''}`} />
}

// ==================== SILK FLOW SHADER ====================
// Luxurious flowing aurora with depth, glow, and dimensional lighting

const silkFlowFragmentShader = `
precision highp float;

uniform float u_time;
uniform vec2 u_resolution;
uniform vec3 u_color1;
uniform vec3 u_color2;
uniform vec3 u_color3;
uniform vec3 u_bgColor;
uniform float u_speed;
uniform float u_scale;
uniform float u_softness;
uniform float u_intensity;

#define PI 3.14159265359

// Simplex noise
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m; m = m*m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

// Domain warping for organic flow
vec2 warp(vec2 p, float t) {
  float n1 = snoise(p * 0.5 + t * 0.1);
  float n2 = snoise(p * 0.5 + vec2(50.0) - t * 0.15);
  return p + vec2(n1, n2) * 0.3;
}

// Layered FBM
float fbm(vec2 p, float t) {
  float v = 0.0;
  float a = 0.5;
  vec2 shift = vec2(100.0);
  mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
  for (int i = 0; i < 4; i++) {
    v += a * (snoise(p + t * 0.1) * 0.5 + 0.5);
    p = rot * p * 2.0 + shift;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec2 p = (uv - 0.5) * 2.0;
  p.x *= u_resolution.x / u_resolution.y;

  float t = u_time * u_speed * 0.4;
  float scale = u_scale * 1.5;

  // Domain warped coordinates for organic movement
  vec2 wp = warp(p * scale, t);
  vec2 wp2 = warp(p * scale * 0.7 + vec2(30.0), t * 1.2);
  vec2 wp3 = warp(p * scale * 1.2 - vec2(20.0), t * 0.8);

  // Multi-layer flowing fields
  float f1 = fbm(wp + vec2(t * 0.2, t * 0.15), t);
  float f2 = fbm(wp2 + vec2(-t * 0.15, t * 0.25), t);
  float f3 = fbm(wp3 + vec2(t * 0.1, -t * 0.2), t);

  // Create aurora-like ribbons
  float ribbon1 = sin(wp.y * 3.0 + f1 * 4.0 + t) * 0.5 + 0.5;
  float ribbon2 = sin(wp2.x * 2.5 - f2 * 3.0 - t * 0.7) * 0.5 + 0.5;
  float ribbon3 = sin((wp3.x + wp3.y) * 2.0 + f3 * 5.0 + t * 0.5) * 0.5 + 0.5;

  // Soft threshold with control
  float soft = 0.3 + u_softness * 0.4;
  ribbon1 = smoothstep(0.5 - soft, 0.5 + soft, ribbon1 * f1);
  ribbon2 = smoothstep(0.5 - soft, 0.5 + soft, ribbon2 * f2);
  ribbon3 = smoothstep(0.5 - soft, 0.5 + soft, ribbon3 * f3);

  // Base gradient
  vec3 color = u_bgColor;

  // Radial depth gradient
  float depth = 1.0 - length(p) * 0.3;
  color *= 0.7 + depth * 0.3;

  // Layer colors with glow
  float glow1 = pow(ribbon1, 1.5);
  float glow2 = pow(ribbon2, 1.5);
  float glow3 = pow(ribbon3, 1.5);

  // Additive color blending with intensity
  color += u_color1 * glow1 * u_intensity * 0.7;
  color += u_color2 * glow2 * u_intensity * 0.6;
  color += u_color3 * glow3 * u_intensity * 0.5;

  // Bright core highlights
  float core1 = pow(ribbon1, 4.0);
  float core2 = pow(ribbon2, 4.0);
  float core3 = pow(ribbon3, 4.0);
  vec3 highlight = (u_color1 + vec3(0.3)) * core1 + (u_color2 + vec3(0.3)) * core2 + (u_color3 + vec3(0.3)) * core3;
  color += highlight * 0.3 * u_intensity;

  // Moving light orb
  vec2 orbPos = vec2(sin(t * 0.4) * 0.5, cos(t * 0.3) * 0.3);
  float orb = exp(-length(p - orbPos) * 3.0);
  color += mix(u_color2, u_color3, 0.5) * orb * 0.4 * u_intensity;

  // Ambient glow
  float ambient = fbm(p * 2.0 + t * 0.05, t) * 0.15;
  color += mix(u_color1, u_color3, 0.5) * ambient * u_intensity;

  // Soft bloom
  vec3 bloom = max(color - 0.5, 0.0);
  color += bloom * 0.3;

  // Tone mapping first
  color = color / (color + 0.5) * 1.1;

  // Cinematic vignette - fade to background color, not black
  float vig = 1.0 - pow(length(uv - 0.5) * 1.2, 2.5);
  vig = smoothstep(0.0, 1.0, vig);
  color = mix(u_bgColor * 0.5, color, vig);

  color = clamp(color, 0.0, 1.0);
  gl_FragColor = vec4(color, 1.0);
}
`

interface SilkFlowShaderProps {
  className?: string
  color1?: string
  color2?: string
  color3?: string
  bgColor?: string
  speed?: number
  scale?: number
  softness?: number
  intensity?: number
  isPlaying?: boolean
}

export function SilkFlowShader({
  className = "",
  color1 = "#6366f1",
  color2 = "#8b5cf6",
  color3 = "#ec4899",
  bgColor = "#0f0f23",
  speed = 1,
  scale = 1,
  softness = 0.5,
  intensity = 1,
  isPlaying = true,
}: SilkFlowShaderProps) {
  const uniformSetup = useCallback(
    (gl: WebGLRenderingContext, program: WebGLProgram) => {
      gl.uniform3fv(gl.getUniformLocation(program, "u_color1"), hexToRgb(color1))
      gl.uniform3fv(gl.getUniformLocation(program, "u_color2"), hexToRgb(color2))
      gl.uniform3fv(gl.getUniformLocation(program, "u_color3"), hexToRgb(color3))
      gl.uniform3fv(gl.getUniformLocation(program, "u_bgColor"), hexToRgb(bgColor))
      gl.uniform1f(gl.getUniformLocation(program, "u_speed"), speed)
      gl.uniform1f(gl.getUniformLocation(program, "u_scale"), scale)
      gl.uniform1f(gl.getUniformLocation(program, "u_softness"), softness)
      gl.uniform1f(gl.getUniformLocation(program, "u_intensity"), intensity)
    },
    [color1, color2, color3, bgColor, speed, scale, softness, intensity]
  )

  const canvasRef = useShaderRenderer(silkFlowFragmentShader, uniformSetup, speed, isPlaying)
  return <canvas ref={canvasRef} className={`w-full h-full block ${className || ''}`} />
}

// Shader component map
export const shaderComponents = {
  "liquid-metal": LiquidMetalShader,
  "neon-horizon": NeonHorizonShader,
  "voronoi": VoronoiShader,
  "pixel-art": PixelArtShader,
  "fluid-ink": FluidInkShader,
  "aurora-mesh": AuroraMeshShader,
  "wave-terrain": WaveTerrainShader,
  "gradient-orbs": GradientOrbsShader,
  "silk-flow": SilkFlowShader,
} as const

export type ShaderSlug = keyof typeof shaderComponents
