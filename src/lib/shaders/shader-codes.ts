// Self-contained shader code strings for copy/paste (shadcn-style)
// Each shader is a complete React component in a single file

// Helper to create the standard shader template
function createShaderCode(
  componentName: string,
  propsInterface: string,
  defaultProps: string,
  fragmentShader: string,
  uniformSetup: string
): string {
  return `"use client"

import { useEffect, useRef } from "react"

${propsInterface}

function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\\d]{2})([a-f\\d]{2})([a-f\\d]{2})$/i.exec(hex)
  return result
    ? [parseInt(result[1], 16) / 255, parseInt(result[2], 16) / 255, parseInt(result[3], 16) / 255]
    : [0, 0, 0]
}

const vertexShader = \`
  attribute vec2 a_position;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
\`

const fragmentShader = \`${fragmentShader}\`

export function ${componentName}({
  className = "",
${defaultProps}
}: ${componentName}Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)
  const startTimeRef = useRef<number>(Date.now())

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const gl = canvas.getContext("webgl", { antialias: true, alpha: false })
    if (!gl) return

    // Create shaders
    const vShader = gl.createShader(gl.VERTEX_SHADER)!
    gl.shaderSource(vShader, vertexShader)
    gl.compileShader(vShader)

    const fShader = gl.createShader(gl.FRAGMENT_SHADER)!
    gl.shaderSource(fShader, fragmentShader)
    gl.compileShader(fShader)

    // Create program
    const program = gl.createProgram()!
    gl.attachShader(program, vShader)
    gl.attachShader(program, fShader)
    gl.linkProgram(program)
    gl.useProgram(program)

    // Set up geometry (fullscreen quad)
    const positions = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1])
    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW)

    const positionLoc = gl.getAttribLocation(program, "a_position")
    gl.enableVertexAttribArray(positionLoc)
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0)

    // Get uniform locations
    const resolutionLoc = gl.getUniformLocation(program, "u_resolution")
    const timeLoc = gl.getUniformLocation(program, "u_time")

    // Set up uniforms
${uniformSetup}

    // Handle resize
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2)
      canvas.width = canvas.clientWidth * dpr
      canvas.height = canvas.clientHeight * dpr
      gl.viewport(0, 0, canvas.width, canvas.height)
      gl.uniform2f(resolutionLoc, canvas.width, canvas.height)
    }

    resize()
    window.addEventListener("resize", resize)

    // Animation loop
    const render = () => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000
      gl.uniform1f(timeLoc, elapsed * speed)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
      animationRef.current = requestAnimationFrame(render)
    }

    render()

    // Cleanup
    return () => {
      window.removeEventListener("resize", resize)
      cancelAnimationFrame(animationRef.current)
      gl.deleteProgram(program)
      gl.deleteShader(vShader)
      gl.deleteShader(fShader)
    }
  }, [speed])

  return <canvas ref={canvasRef} className={className} style={{ width: "100%", height: "100%" }} />
}
`
}

// ============================================
// LIQUID METAL
// ============================================
const liquidMetalCode = createShaderCode(
  "LiquidMetal",
  `interface LiquidMetalProps {
  className?: string
  baseColor?: string
  highlightColor?: string
  speed?: number
  scale?: number
  distortion?: number
  reflectivity?: number
}`,
  `  baseColor = "#1a1a2e",
  highlightColor = "#ffffff",
  speed = 1,
  scale = 1,
  distortion = 1,
  reflectivity = 1.5,`,
  `
  precision highp float;
  uniform vec2 u_resolution;
  uniform float u_time;
  uniform vec3 u_baseColor;
  uniform vec3 u_highlightColor;
  uniform float u_distortion;
  uniform float u_reflectivity;
  uniform float u_scale;

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

  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    vec2 p = (uv - 0.5) * 2.0;
    p.x *= u_resolution.x / u_resolution.y;
    p *= u_scale;
    float t = u_time * 0.3;

    float n1 = snoise(vec3(p * 1.2 * u_distortion, t * 0.4));
    float n2 = snoise(vec3(p * 2.4 * u_distortion + 5.0, t * 0.5));
    float n3 = snoise(vec3(p * 4.8 * u_distortion + 10.0, t * 0.3));
    float surface = n1 * 0.5 + n2 * 0.3 + n3 * 0.2;

    float eps = 0.015;
    float nx = snoise(vec3((p + vec2(eps, 0.0)) * 2.0 * u_distortion, t * 0.4)) - snoise(vec3((p - vec2(eps, 0.0)) * 2.0 * u_distortion, t * 0.4));
    float ny = snoise(vec3((p + vec2(0.0, eps)) * 2.0 * u_distortion, t * 0.4)) - snoise(vec3((p - vec2(0.0, eps)) * 2.0 * u_distortion, t * 0.4));
    vec3 normal = normalize(vec3(nx * 4.0, ny * 4.0, 1.0));

    vec3 lightDir = normalize(vec3(sin(t * 0.5) * 0.6, cos(t * 0.4) * 0.4 + 0.5, 1.0));
    float diffuse = max(dot(normal, lightDir), 0.0);
    vec3 viewDir = vec3(0.0, 0.0, 1.0);
    vec3 halfDir = normalize(lightDir + viewDir);
    float specular = pow(max(dot(normal, halfDir), 0.0), 80.0) * u_reflectivity;
    float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 4.0) * u_reflectivity;

    vec3 color = u_baseColor * (0.15 + diffuse * 0.5);
    color += u_highlightColor * specular;
    color += u_highlightColor * fresnel * 0.5;
    color += u_baseColor * surface * 0.1;

    float vignette = 1.0 - length(uv - 0.5) * 0.3;
    color *= vignette;
    gl_FragColor = vec4(color, 1.0);
  }
`,
  `    gl.uniform3fv(gl.getUniformLocation(program, "u_baseColor"), hexToRgb(baseColor))
    gl.uniform3fv(gl.getUniformLocation(program, "u_highlightColor"), hexToRgb(highlightColor))
    gl.uniform1f(gl.getUniformLocation(program, "u_distortion"), distortion)
    gl.uniform1f(gl.getUniformLocation(program, "u_reflectivity"), reflectivity)
    gl.uniform1f(gl.getUniformLocation(program, "u_scale"), scale)`
)

// ============================================
// NEON HORIZON
// ============================================
const neonHorizonCode = createShaderCode(
  "NeonHorizon",
  `interface NeonHorizonProps {
  className?: string
  skyColor1?: string
  skyColor2?: string
  gridColor?: string
  sunColor?: string
  speed?: number
  gridSpeed?: number
  sunSize?: number
  glowIntensity?: number
}`,
  `  skyColor1 = "#0a0015",
  skyColor2 = "#1a0030",
  gridColor = "#ff00ff",
  sunColor = "#ffaa00",
  speed = 1,
  gridSpeed = 1,
  sunSize = 1,
  glowIntensity = 1,`,
  `
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

  float hash(float n) { return fract(sin(n) * 43758.5453); }
  float noise(float x) {
    float i = floor(x);
    float f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    return mix(hash(i), hash(i + 1.0), f);
  }

  float mountain(float x, float scale, float height, float offset) {
    float m = noise(x * scale + offset) * height;
    m += noise(x * scale * 2.0 + offset) * height * 0.5;
    m += noise(x * scale * 4.0 + offset) * height * 0.25;
    return m;
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    float aspect = u_resolution.x / u_resolution.y;

    float skyGrad = pow(uv.y, 0.5);
    vec3 sky = mix(u_skyColor1, u_skyColor2, skyGrad);
    sky += vec3(0.12, 0.0, 0.18) * sin(skyGrad * 3.14159) * 0.4;
    sky += u_sunColor * 0.08 * exp(-abs(uv.y - 0.5) * 4.0);

    vec2 sunPos = vec2(0.5, 0.42);
    vec2 sunUV = (uv - sunPos) * vec2(aspect, 1.0);
    float sunDist = length(sunUV);
    float sunRadius = u_sunSize * 0.18;
    float sun = smoothstep(sunRadius, sunRadius - 0.025, sunDist);

    float stripeY = (uv.y - sunPos.y + sunRadius) / (sunRadius * 2.0);
    float stripeAnim = stripeY - u_time * 0.08;
    float stripe = sin(stripeAnim * 18.0 * 3.14159) * 0.5 + 0.5;
    stripe = smoothstep(0.2, 0.8, stripe);
    float stripeMask = smoothstep(0.6, 0.3, stripeY);
    sun *= mix(1.0, stripe, stripeMask * 0.85);

    float totalGlow = (exp(-sunDist * 5.0) * 1.5 + exp(-sunDist * 2.0) * 0.6 + exp(-sunDist * 1.0) * 0.15) * u_glowIntensity;
    vec3 sunCol = mix(u_sunColor, u_sunColor * vec3(1.0, 0.5, 0.7), clamp(sunDist / sunRadius, 0.0, 1.0));

    float horizon = 0.35;
    float mountainX = uv.x * aspect;
    float mountain1 = mountain(mountainX, 2.0, 0.08, 0.0);
    float mountainMask1 = smoothstep(horizon + mountain1 + 0.02, horizon + mountain1, uv.y);
    float mountain2 = mountain(mountainX, 3.5, 0.05, 10.0);
    float mountainMask2 = smoothstep(horizon + mountain2 + 0.015, horizon + mountain2, uv.y);

    sky = mix(sky, vec3(0.02, 0.0, 0.04), mountainMask1 * 0.9);
    sky = mix(sky, vec3(0.04, 0.0, 0.06), mountainMask2 * 0.95);

    float haze = exp(-abs(uv.y - horizon) * 8.0) * 0.4;
    sky += mix(u_gridColor, u_sunColor, 0.3) * haze * u_glowIntensity;
    float horizonGlow = exp(-abs(uv.y - horizon) * 40.0) * 0.5;

    if (uv.y < horizon) {
      float perspY = (horizon - uv.y) / horizon;
      float z = 1.0 / (perspY + 0.0001);
      float x = (uv.x - 0.5) * z * aspect;
      float gridScale = 0.35;
      float zLine = z * 0.2 - u_time * u_gridSpeed;
      float gridX = abs(fract(x * gridScale) - 0.5);
      float gridZ = abs(fract(zLine) - 0.5);
      float aaScale = 0.5 / u_resolution.y * z;
      float lineX = smoothstep(0.03 * z * 0.3 + aaScale, 0.03 * z * 0.3 - aaScale, gridX);
      float lineZ = smoothstep(0.025 + aaScale * 5.0, 0.025 - aaScale * 5.0, gridZ);
      float grid = max(lineX, lineZ) * smoothstep(0.0, 0.25, perspY) * (1.0 - perspY * 0.7);

      vec3 groundColor = mix(vec3(0.01, 0.0, 0.02), vec3(0.03, 0.0, 0.05), perspY * 0.5);
      groundColor += u_gridColor * grid * (1.2 + (1.0 - perspY) * 0.8);

      float reflectX = abs(uv.x - 0.5);
      float reflectionPath = exp(-reflectX * 10.0) * exp(-perspY * 2.5) * (sin(z * 2.0 - u_time * 2.0) * 0.15 + 0.85) * 0.5 * u_glowIntensity;
      groundColor += u_sunColor * reflectionPath;
      groundColor = mix(groundColor, u_skyColor1 + u_gridColor * 0.1, perspY * perspY * 0.6);
      sky = groundColor;
    }

    vec3 color = sky + sunCol * sun + sunCol * totalGlow + u_gridColor * horizonGlow;
    color *= 1.0 - length((uv - 0.5) * vec2(1.3, 1.0)) * 0.4;
    color = color / (1.0 + color * 0.2);
    gl_FragColor = vec4(color, 1.0);
  }
`,
  `    gl.uniform3fv(gl.getUniformLocation(program, "u_skyColor1"), hexToRgb(skyColor1))
    gl.uniform3fv(gl.getUniformLocation(program, "u_skyColor2"), hexToRgb(skyColor2))
    gl.uniform3fv(gl.getUniformLocation(program, "u_gridColor"), hexToRgb(gridColor))
    gl.uniform3fv(gl.getUniformLocation(program, "u_sunColor"), hexToRgb(sunColor))
    gl.uniform1f(gl.getUniformLocation(program, "u_gridSpeed"), gridSpeed)
    gl.uniform1f(gl.getUniformLocation(program, "u_sunSize"), sunSize)
    gl.uniform1f(gl.getUniformLocation(program, "u_glowIntensity"), glowIntensity)`
)

// ============================================
// SILK FLOW
// ============================================
const silkFlowCode = createShaderCode(
  "SilkFlow",
  `interface SilkFlowProps {
  className?: string
  color1?: string
  color2?: string
  color3?: string
  bgColor?: string
  speed?: number
  scale?: number
  softness?: number
  intensity?: number
}`,
  `  color1 = "#6366f1",
  color2 = "#8b5cf6",
  color3 = "#ec4899",
  bgColor = "#0f0f23",
  speed = 1,
  scale = 1,
  softness = 0.5,
  intensity = 1,`,
  `
  precision highp float;
  uniform vec2 u_resolution;
  uniform float u_time;
  uniform vec3 u_color1;
  uniform vec3 u_color2;
  uniform vec3 u_color3;
  uniform vec3 u_bgColor;
  uniform float u_scale;
  uniform float u_softness;
  uniform float u_intensity;

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

  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    vec2 p = (uv - 0.5) * 2.0 * u_scale;
    p.x *= u_resolution.x / u_resolution.y;

    float t = u_time * 0.15;

    float n1 = snoise(p * 1.5 + vec2(t * 0.3, t * 0.2));
    float n2 = snoise(p * 2.0 + vec2(-t * 0.2, t * 0.3) + 10.0);
    float n3 = snoise(p * 0.8 + vec2(t * 0.1, -t * 0.15) + 20.0);

    float flow = (n1 + n2 * 0.5 + n3 * 0.25) / 1.75;
    flow = flow * 0.5 + 0.5;

    float blend1 = smoothstep(0.0, 0.5 + u_softness * 0.3, flow);
    float blend2 = smoothstep(0.3, 0.8 + u_softness * 0.2, flow);

    vec3 color = u_bgColor;
    color = mix(color, u_color1, blend1 * u_intensity * 0.7);
    color = mix(color, u_color2, blend2 * u_intensity * 0.6);
    color = mix(color, u_color3, (1.0 - blend1) * blend2 * u_intensity * 0.5);

    float highlight = pow(max(flow, 0.0), 3.0) * u_intensity * 0.3;
    color += vec3(highlight);

    float vignette = 1.0 - length(uv - 0.5) * 0.5;
    color *= vignette;

    gl_FragColor = vec4(color, 1.0);
  }
`,
  `    gl.uniform3fv(gl.getUniformLocation(program, "u_color1"), hexToRgb(color1))
    gl.uniform3fv(gl.getUniformLocation(program, "u_color2"), hexToRgb(color2))
    gl.uniform3fv(gl.getUniformLocation(program, "u_color3"), hexToRgb(color3))
    gl.uniform3fv(gl.getUniformLocation(program, "u_bgColor"), hexToRgb(bgColor))
    gl.uniform1f(gl.getUniformLocation(program, "u_scale"), scale)
    gl.uniform1f(gl.getUniformLocation(program, "u_softness"), softness)
    gl.uniform1f(gl.getUniformLocation(program, "u_intensity"), intensity)`
)

// ============================================
// GRADIENT ORBS
// ============================================
const gradientOrbsCode = createShaderCode(
  "GradientOrbs",
  `interface GradientOrbsProps {
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
}`,
  `  color1 = "#ff6b00",
  color2 = "#ff0844",
  color3 = "#ffb700",
  color4 = "#ff4500",
  bgColor = "#0a0a0a",
  speed = 1,
  scale = 0.7,
  blur = 1,
  intensity = 1,
  glow = 1,`,
  `
  precision highp float;
  uniform vec2 u_resolution;
  uniform float u_time;
  uniform vec3 u_color1;
  uniform vec3 u_color2;
  uniform vec3 u_color3;
  uniform vec3 u_color4;
  uniform vec3 u_bgColor;
  uniform float u_scale;
  uniform float u_blur;
  uniform float u_intensity;
  uniform float u_glow;

  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    float aspect = u_resolution.x / u_resolution.y;
    vec2 p = (uv - 0.5) * vec2(aspect, 1.0);

    float t = u_time * 0.2;
    vec3 color = u_bgColor;

    // Orb 1
    vec2 orb1Pos = vec2(sin(t * 0.7) * 0.3, cos(t * 0.5) * 0.25) * u_scale;
    float orb1 = 1.0 / (length(p - orb1Pos) * 3.0 / u_blur + 0.1);
    color += u_color1 * orb1 * u_intensity * 0.3;

    // Orb 2
    vec2 orb2Pos = vec2(cos(t * 0.6) * 0.35, sin(t * 0.8) * 0.3) * u_scale;
    float orb2 = 1.0 / (length(p - orb2Pos) * 3.5 / u_blur + 0.1);
    color += u_color2 * orb2 * u_intensity * 0.3;

    // Orb 3
    vec2 orb3Pos = vec2(sin(t * 0.9 + 2.0) * 0.25, cos(t * 0.4 + 1.0) * 0.35) * u_scale;
    float orb3 = 1.0 / (length(p - orb3Pos) * 4.0 / u_blur + 0.1);
    color += u_color3 * orb3 * u_intensity * 0.25;

    // Orb 4
    vec2 orb4Pos = vec2(cos(t * 0.5 + 3.0) * 0.4, sin(t * 0.7 + 2.0) * 0.2) * u_scale;
    float orb4 = 1.0 / (length(p - orb4Pos) * 3.0 / u_blur + 0.1);
    color += u_color4 * orb4 * u_intensity * 0.25;

    // Center glow
    float centerGlow = 1.0 / (length(p) * 5.0 + 0.5) * u_glow * 0.3;
    color += mix(u_color1, u_color2, 0.5) * centerGlow;

    // Tone mapping
    color = color / (1.0 + color * 0.5);

    // Vignette
    float vignette = 1.0 - length(uv - 0.5) * 0.6;
    color *= vignette;

    gl_FragColor = vec4(color, 1.0);
  }
`,
  `    gl.uniform3fv(gl.getUniformLocation(program, "u_color1"), hexToRgb(color1))
    gl.uniform3fv(gl.getUniformLocation(program, "u_color2"), hexToRgb(color2))
    gl.uniform3fv(gl.getUniformLocation(program, "u_color3"), hexToRgb(color3))
    gl.uniform3fv(gl.getUniformLocation(program, "u_color4"), hexToRgb(color4))
    gl.uniform3fv(gl.getUniformLocation(program, "u_bgColor"), hexToRgb(bgColor))
    gl.uniform1f(gl.getUniformLocation(program, "u_scale"), scale)
    gl.uniform1f(gl.getUniformLocation(program, "u_blur"), blur)
    gl.uniform1f(gl.getUniformLocation(program, "u_intensity"), intensity)
    gl.uniform1f(gl.getUniformLocation(program, "u_glow"), glow)`
)

// ============================================
// VORONOI CELLS
// ============================================
const voronoiCode = createShaderCode(
  "VoronoiCells",
  `interface VoronoiCellsProps {
  className?: string
  color1?: string
  color2?: string
  edgeColor?: string
  speed?: number
  scale?: number
  edgeWidth?: number
  glowIntensity?: number
}`,
  `  color1 = "#1a1a3e",
  color2 = "#2d1b4e",
  edgeColor = "#00ffff",
  speed = 1,
  scale = 5,
  edgeWidth = 0.05,
  glowIntensity = 1,`,
  `
  precision highp float;
  uniform vec2 u_resolution;
  uniform float u_time;
  uniform vec3 u_color1;
  uniform vec3 u_color2;
  uniform vec3 u_edgeColor;
  uniform float u_scale;
  uniform float u_edgeWidth;
  uniform float u_glowIntensity;

  vec2 hash2(vec2 p) {
    return fract(sin(vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)))) * 43758.5453);
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    float aspect = u_resolution.x / u_resolution.y;
    vec2 p = uv * u_scale;
    p.x *= aspect;

    float t = u_time * 0.3;

    vec2 n = floor(p);
    vec2 f = fract(p);

    float minDist = 10.0;
    float secondDist = 10.0;
    vec2 closestCell = vec2(0.0);

    for (int j = -1; j <= 1; j++) {
      for (int i = -1; i <= 1; i++) {
        vec2 g = vec2(float(i), float(j));
        vec2 o = hash2(n + g);
        o = 0.5 + 0.4 * sin(t + 6.2831 * o);
        vec2 r = g + o - f;
        float d = dot(r, r);

        if (d < minDist) {
          secondDist = minDist;
          minDist = d;
          closestCell = n + g;
        } else if (d < secondDist) {
          secondDist = d;
        }
      }
    }

    float edge = secondDist - minDist;
    float edgeLine = smoothstep(0.0, u_edgeWidth, edge);

    float cellValue = hash2(closestCell).x;
    vec3 cellColor = mix(u_color1, u_color2, cellValue);

    vec3 color = cellColor;
    color = mix(u_edgeColor * u_glowIntensity, color, edgeLine);

    float glow = exp(-edge * 10.0) * u_glowIntensity * 0.5;
    color += u_edgeColor * glow;

    float vignette = 1.0 - length(uv - 0.5) * 0.4;
    color *= vignette;

    gl_FragColor = vec4(color, 1.0);
  }
`,
  `    gl.uniform3fv(gl.getUniformLocation(program, "u_color1"), hexToRgb(color1))
    gl.uniform3fv(gl.getUniformLocation(program, "u_color2"), hexToRgb(color2))
    gl.uniform3fv(gl.getUniformLocation(program, "u_edgeColor"), hexToRgb(edgeColor))
    gl.uniform1f(gl.getUniformLocation(program, "u_scale"), scale)
    gl.uniform1f(gl.getUniformLocation(program, "u_edgeWidth"), edgeWidth)
    gl.uniform1f(gl.getUniformLocation(program, "u_glowIntensity"), glowIntensity)`
)

// ============================================
// FLUID INK
// ============================================
const fluidInkCode = createShaderCode(
  "FluidInk",
  `interface FluidInkProps {
  className?: string
  color1?: string
  color2?: string
  color3?: string
  speed?: number
  complexity?: number
  turbulence?: number
  glow?: number
}`,
  `  color1 = "#0a0a1a",
  color2 = "#1a1a4e",
  color3 = "#6a0dad",
  speed = 1,
  complexity = 1.5,
  turbulence = 1,
  glow = 1,`,
  `
  precision highp float;
  uniform vec2 u_resolution;
  uniform float u_time;
  uniform vec3 u_color1;
  uniform vec3 u_color2;
  uniform vec3 u_color3;
  uniform float u_complexity;
  uniform float u_turbulence;
  uniform float u_glow;

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

  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < 5; i++) {
      value += amplitude * snoise(p);
      p *= 2.0;
      amplitude *= 0.5;
    }
    return value;
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    vec2 p = (uv - 0.5) * 2.0 * u_complexity;
    p.x *= u_resolution.x / u_resolution.y;

    float t = u_time * 0.2;

    // Domain warping
    vec2 q = vec2(fbm(p + t * 0.3), fbm(p + vec2(5.2, 1.3) + t * 0.2));
    vec2 r = vec2(fbm(p + q * u_turbulence + t * 0.1), fbm(p + q * u_turbulence + vec2(1.7, 9.2)));

    float f = fbm(p + r * u_turbulence * 2.0);

    // Color mixing
    float colorMix1 = clamp(f * 2.0, 0.0, 1.0);
    float colorMix2 = clamp(length(q) * 0.8, 0.0, 1.0);

    vec3 color = u_color1;
    color = mix(color, u_color2, colorMix1);
    color = mix(color, u_color3, colorMix2 * 0.7);

    // Glow highlights
    float highlight = pow(max(f + 0.5, 0.0), 3.0) * u_glow;
    color += u_color3 * highlight * 0.5;

    // Vignette
    float vignette = 1.0 - length(uv - 0.5) * 0.5;
    color *= vignette;

    gl_FragColor = vec4(color, 1.0);
  }
`,
  `    gl.uniform3fv(gl.getUniformLocation(program, "u_color1"), hexToRgb(color1))
    gl.uniform3fv(gl.getUniformLocation(program, "u_color2"), hexToRgb(color2))
    gl.uniform3fv(gl.getUniformLocation(program, "u_color3"), hexToRgb(color3))
    gl.uniform1f(gl.getUniformLocation(program, "u_complexity"), complexity)
    gl.uniform1f(gl.getUniformLocation(program, "u_turbulence"), turbulence)
    gl.uniform1f(gl.getUniformLocation(program, "u_glow"), glow)`
)

// ============================================
// AURORA MESH
// ============================================
const auroraMeshCode = createShaderCode(
  "AuroraMesh",
  `interface AuroraMeshProps {
  className?: string
  baseColor?: string
  accentColor?: string
  speed?: number
  scale?: number
  waveHeight?: number
  lightIntensity?: number
}`,
  `  baseColor = "#0a0a12",
  accentColor = "#6366f1",
  speed = 1,
  scale = 1,
  waveHeight = 1,
  lightIntensity = 1,`,
  `
  precision highp float;
  uniform vec2 u_resolution;
  uniform float u_time;
  uniform vec3 u_baseColor;
  uniform vec3 u_accentColor;
  uniform float u_scale;
  uniform float u_waveHeight;
  uniform float u_lightIntensity;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

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

  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < 4; i++) {
      value += amplitude * noise(p);
      p *= 2.0;
      amplitude *= 0.5;
    }
    return value;
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    float aspect = u_resolution.x / u_resolution.y;
    vec2 p = (uv - 0.5) * vec2(aspect, 1.0) * 2.0 * u_scale;

    float t = u_time * 0.3;

    // Wave surface
    float wave = fbm(p * 3.0 + t * 0.5) * u_waveHeight * 0.3;
    wave += fbm(p * 6.0 - t * 0.3) * u_waveHeight * 0.15;

    // Grid
    vec2 grid = fract(p * 8.0 + wave);
    float gridLine = smoothstep(0.02, 0.0, min(grid.x, grid.y));
    gridLine += smoothstep(0.02, 0.0, min(1.0 - grid.x, 1.0 - grid.y));

    // Lighting based on wave
    float light = wave * 2.0 + 0.5;
    light = pow(max(light, 0.0), 2.0) * u_lightIntensity;

    vec3 color = u_baseColor;
    color += u_accentColor * gridLine * 0.5;
    color += u_accentColor * light * 0.4;

    // Edge glow
    float edgeGlow = exp(-length(p) * 0.5) * 0.3;
    color += u_accentColor * edgeGlow;

    gl_FragColor = vec4(color, 1.0);
  }
`,
  `    gl.uniform3fv(gl.getUniformLocation(program, "u_baseColor"), hexToRgb(baseColor))
    gl.uniform3fv(gl.getUniformLocation(program, "u_accentColor"), hexToRgb(accentColor))
    gl.uniform1f(gl.getUniformLocation(program, "u_scale"), scale)
    gl.uniform1f(gl.getUniformLocation(program, "u_waveHeight"), waveHeight)
    gl.uniform1f(gl.getUniformLocation(program, "u_lightIntensity"), lightIntensity)`
)

// ============================================
// WAVE TERRAIN
// ============================================
const waveTerrainCode = createShaderCode(
  "WaveTerrain",
  `interface WaveTerrainProps {
  className?: string
  baseColor?: string
  accentColor?: string
  skyColor?: string
  speed?: number
  scale?: number
  waveHeight?: number
  fogDensity?: number
}`,
  `  baseColor = "#0a0a15",
  accentColor = "#8b5cf6",
  skyColor = "#0a0612",
  speed = 1,
  scale = 1,
  waveHeight = 1,
  fogDensity = 1,`,
  `
  precision highp float;
  uniform vec2 u_resolution;
  uniform float u_time;
  uniform vec3 u_baseColor;
  uniform vec3 u_accentColor;
  uniform vec3 u_skyColor;
  uniform float u_scale;
  uniform float u_waveHeight;
  uniform float u_fogDensity;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
  }

  float terrain(vec2 p) {
    float h = noise(p * 0.5) * 0.5;
    h += noise(p * 1.0) * 0.25;
    h += noise(p * 2.0) * 0.125;
    return h * u_waveHeight;
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    float aspect = u_resolution.x / u_resolution.y;

    // Sky gradient
    vec3 color = mix(u_skyColor, u_baseColor, uv.y);

    float t = u_time * 0.2;

    // Terrain rendering (simple raymarching approximation)
    float horizon = 0.4;
    if (uv.y < horizon) {
      float perspY = (horizon - uv.y) / horizon;
      float z = 1.0 / (perspY + 0.01) * u_scale;
      float x = (uv.x - 0.5) * z * aspect;

      float h = terrain(vec2(x * 0.3, z * 0.3 - t));

      // Grid lines
      vec2 gridCoord = vec2(x, z - t * 3.0) * 0.5;
      float gridX = smoothstep(0.02, 0.0, abs(fract(gridCoord.x) - 0.5) - 0.48);
      float gridZ = smoothstep(0.02, 0.0, abs(fract(gridCoord.y) - 0.5) - 0.48);
      float grid = max(gridX, gridZ);

      // Height-based coloring
      vec3 terrainColor = u_baseColor + u_accentColor * h * 2.0;
      terrainColor += u_accentColor * grid * 0.5;

      // Fog
      float fog = 1.0 - exp(-perspY * perspY * u_fogDensity * 2.0);
      color = mix(terrainColor, u_skyColor, fog);
    }

    // Horizon glow
    float horizonGlow = exp(-abs(uv.y - horizon) * 20.0) * 0.5;
    color += u_accentColor * horizonGlow;

    gl_FragColor = vec4(color, 1.0);
  }
`,
  `    gl.uniform3fv(gl.getUniformLocation(program, "u_baseColor"), hexToRgb(baseColor))
    gl.uniform3fv(gl.getUniformLocation(program, "u_accentColor"), hexToRgb(accentColor))
    gl.uniform3fv(gl.getUniformLocation(program, "u_skyColor"), hexToRgb(skyColor))
    gl.uniform1f(gl.getUniformLocation(program, "u_scale"), scale)
    gl.uniform1f(gl.getUniformLocation(program, "u_waveHeight"), waveHeight)
    gl.uniform1f(gl.getUniformLocation(program, "u_fogDensity"), fogDensity)`
)

// ============================================
// PIXEL ART / RETRO SUNSET
// ============================================
const pixelArtCode = createShaderCode(
  "RetroSunset",
  `interface RetroSunsetProps {
  className?: string
  skyColor1?: string
  skyColor2?: string
  sunColor?: string
  waterColor?: string
  speed?: number
  pixelSize?: number
  waveIntensity?: number
}`,
  `  skyColor1 = "#1a0533",
  skyColor2 = "#4a1942",
  sunColor = "#ff6b35",
  waterColor = "#1a3a4a",
  speed = 1,
  pixelSize = 1,
  waveIntensity = 1,`,
  `
  precision highp float;
  uniform vec2 u_resolution;
  uniform float u_time;
  uniform vec3 u_skyColor1;
  uniform vec3 u_skyColor2;
  uniform vec3 u_sunColor;
  uniform vec3 u_waterColor;
  uniform float u_pixelSize;
  uniform float u_waveIntensity;

  float hash(float n) { return fract(sin(n) * 43758.5453); }

  void main() {
    // Pixelate
    float pixelScale = 200.0 / u_pixelSize;
    vec2 uv = floor(gl_FragCoord.xy / u_resolution.xy * pixelScale) / pixelScale;
    float aspect = u_resolution.x / u_resolution.y;

    float t = u_time * 0.3;

    // Sky gradient
    vec3 color = mix(u_skyColor1, u_skyColor2, pow(uv.y, 0.7));

    // Sun
    vec2 sunPos = vec2(0.5, 0.55);
    float sunDist = length((uv - sunPos) * vec2(aspect, 1.0));
    float sun = smoothstep(0.15, 0.12, sunDist);

    // Sun stripes
    float stripeY = (uv.y - sunPos.y + 0.15) / 0.3;
    float stripe = step(0.5, fract(stripeY * 8.0 - t * 0.5));
    sun *= mix(1.0, stripe, smoothstep(0.5, 0.2, stripeY) * 0.7);

    color = mix(color, u_sunColor, sun);

    // Sun glow
    float glow = exp(-sunDist * 4.0) * 0.4;
    color += u_sunColor * glow;

    // Water
    float waterLine = 0.35;
    if (uv.y < waterLine) {
      float waveY = uv.y + sin(uv.x * 20.0 + t * 2.0) * 0.01 * u_waveIntensity;
      vec3 water = u_waterColor;

      // Sun reflection
      float reflectX = abs(uv.x - 0.5);
      float reflection = exp(-reflectX * 8.0) * (waterLine - waveY) * 2.0;
      reflection *= (sin(uv.y * 50.0 + t * 3.0) * 0.3 + 0.7);
      water += u_sunColor * reflection;

      // Wave highlights
      float waveHighlight = sin(uv.x * 30.0 + t) * sin(uv.y * 20.0 - t * 2.0);
      waveHighlight = max(waveHighlight, 0.0) * 0.1 * u_waveIntensity;
      water += vec3(waveHighlight);

      color = water;
    }

    // Stars (only in upper sky)
    if (uv.y > 0.6) {
      float star = step(0.98, hash(floor(uv * 100.0).x + floor(uv * 100.0).y * 100.0));
      star *= (sin(t * 3.0 + hash(uv.x * 100.0) * 6.28) * 0.3 + 0.7);
      color += vec3(star * 0.5);
    }

    gl_FragColor = vec4(color, 1.0);
  }
`,
  `    gl.uniform3fv(gl.getUniformLocation(program, "u_skyColor1"), hexToRgb(skyColor1))
    gl.uniform3fv(gl.getUniformLocation(program, "u_skyColor2"), hexToRgb(skyColor2))
    gl.uniform3fv(gl.getUniformLocation(program, "u_sunColor"), hexToRgb(sunColor))
    gl.uniform3fv(gl.getUniformLocation(program, "u_waterColor"), hexToRgb(waterColor))
    gl.uniform1f(gl.getUniformLocation(program, "u_pixelSize"), pixelSize)
    gl.uniform1f(gl.getUniformLocation(program, "u_waveIntensity"), waveIntensity)`
)

// ============================================
// SHADER CODE MAP
// ============================================
const shaderCodeMap: Record<string, string> = {
  "liquid-metal": liquidMetalCode,
  "neon-horizon": neonHorizonCode,
  "silk-flow": silkFlowCode,
  "gradient-orbs": gradientOrbsCode,
  "voronoi": voronoiCode,
  "fluid-ink": fluidInkCode,
  "aurora-mesh": auroraMeshCode,
  "wave-terrain": waveTerrainCode,
  "pixel-art": pixelArtCode,
}

export function getShaderCode(slug: string): string {
  return shaderCodeMap[slug] || `// Shader code for "${slug}" not found`
}
