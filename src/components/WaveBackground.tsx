"use client";

import { useEffect, useRef } from "react";

const vertexShader = `
  attribute vec2 a_position;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const fragmentShader = `
  precision highp float;

  uniform vec2 u_resolution;
  uniform float u_time;
  uniform float u_night;

  #define PI 3.14159265359
  #define DRAG_MULT 0.38
  #define WATER_DEPTH 1.0
  #define CAMERA_HEIGHT 1.5
  #define FBM_OCTAVES 6

  float hash21(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float noise21(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash21(i);
    float b = hash21(i + vec2(1.0, 0.0));
    float c = hash21(i + vec2(0.0, 1.0));
    float d = hash21(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    for (int i = 0; i < FBM_OCTAVES; i++) {
      value += amplitude * noise21(p * frequency);
      frequency *= 2.0;
      amplitude *= 0.5;
    }
    return value;
  }

  vec2 wavedx(vec2 position, vec2 direction, float frequency, float timeshift) {
    float x = dot(direction, position) * frequency + timeshift;
    float wave = exp(sin(x) - 1.0);
    float dx = wave * cos(x);
    return vec2(wave, -dx);
  }

  float getWaves(vec2 position) {
    float iter = 0.0;
    float frequency = 1.0;
    float timeMultiplier = 2.0;
    float weight = 1.0;
    float sumOfValues = 0.0;
    float sumOfWeights = 0.0;

    vec2 swellDir = normalize(vec2(-0.25, 1.0));
    float swellBias = 0.35;

    for(int i = 0; i < 16; i++) {
      vec2 p = normalize(mix(vec2(sin(iter), cos(iter)), swellDir, swellBias));
      vec2 res = wavedx(position, p, frequency, u_time * timeMultiplier + length(position) * 0.1);
      position += p * res.y * weight * DRAG_MULT;
      sumOfValues += res.x * weight;
      sumOfWeights += weight;
      weight = mix(weight, 0.0, 0.2);
      frequency *= 1.18;
      timeMultiplier *= 1.07;
      iter += 1232.399963;
    }

    float baseWaves = sumOfValues / sumOfWeights;
    float swellPhase = dot(position, swellDir) * 0.18 - u_time * 0.08;
    float swell = sin(swellPhase);
    vec2 cameraPos = vec2(u_time * 0.2, 1.0);
    float swellFade = smoothstep(28.0, 4.0, length(position - cameraPos));

    float surfaceNoise = fbm(position * 0.8 + u_time * 0.15) * 0.12;

    return baseWaves + swell * swellFade * 0.35 + surfaceNoise;
  }

  vec2 skyUV(vec3 dir) {
    float u = atan(dir.z, dir.x) / (2.0 * PI) + 0.5;
    float v = clamp(dir.y * 0.5 + 0.5, 0.0, 1.0);
    return vec2(u, v);
  }

  vec2 dirToScreenUV(vec3 dir) {
    mat3 rotX = mat3(
      1.0, 0.0, 0.0,
      0.0, cos(0.14), -sin(0.14),
      0.0, sin(0.14), cos(0.14)
    );
    vec3 unrotated = rotX * dir;
    if (unrotated.z <= 0.0) return vec2(-1.0);
    vec2 uv = (unrotated.xy / unrotated.z) * 1.5;
    vec2 ndc = uv / vec2(u_resolution.x / u_resolution.y, 1.0);
    return ndc * 0.5 + 0.5;
  }

  float star(vec2 screenUv, vec2 cellId, vec2 grid) {
    float rnd = hash21(cellId);
    if (rnd > 0.8) return 0.0;
    vec2 starPos = vec2(hash21(cellId + 0.1), hash21(cellId + 0.2));
    vec2 starUv = (cellId + starPos) / grid;
    vec2 deltaPx = (screenUv - starUv) * u_resolution.xy;
    float sizePx = 0.25 + hash21(cellId + 0.3) * 0.45;
    float d = length(deltaPx);
    float core = smoothstep(sizePx, sizePx * 0.2, d);
    float flickerPhase = hash21(cellId + 0.4) * 6.28318;
    float flickerSpeed = 0.2 + hash21(cellId + 0.5) * 0.3;
    float flickerAmount = mix(0.1, 0.35, hash21(cellId + 0.7));
    float flicker = mix(1.0 - flickerAmount, 1.0 + flickerAmount, 0.5 + 0.5 * sin(u_time * flickerSpeed + flickerPhase));
    return core * flicker;
  }

  vec3 getDaySky(vec3 dir) {
    float gradient = smoothstep(0.0, 1.0, dir.y * 0.5 + 0.5);
    return mix(vec3(0.4), vec3(0.6), gradient);
  }

  vec3 getNightSky(vec3 dir) {
    vec2 uv = skyUV(dir);
    vec3 topColor = vec3(0.02);
    vec3 bottomColor = vec3(0.04);
    vec3 color = mix(bottomColor, topColor, uv.y);

    vec2 screenUv = dirToScreenUV(dir);
    if (screenUv.x >= 0.0 && screenUv.x <= 1.0 && screenUv.y >= 0.0 && screenUv.y <= 1.0) {
      if (screenUv.y > 0.35) {
        float gridX = 40.0;
        float gridY = 30.0;
        vec2 grid = vec2(gridX, gridY);
        vec2 baseCell = floor(vec2(screenUv.x * gridX, screenUv.y * gridY));
        float s = 0.0;
        for (int yi = -1; yi <= 1; yi++) {
          for (int xi = -1; xi <= 1; xi++) {
            vec2 cell = baseCell + vec2(float(xi), float(yi));
            if (cell.y < 0.0 || cell.y >= gridY) continue;
            cell.x = mod(cell.x + gridX, gridX);
            s += star(screenUv, cell, grid);
          }
        }
        float horizonFade = smoothstep(0.35, 0.55, screenUv.y);
        color += vec3(1.0, 0.97, 0.9) * s * horizonFade;
      }
    }

    return color;
  }

  mat3 createRotationMatrixAxisAngle(vec3 axis, float angle) {
    float s = sin(angle);
    float c = cos(angle);
    float oc = 1.0 - c;
    return mat3(
      oc * axis.x * axis.x + c, oc * axis.x * axis.y - axis.z * s, oc * axis.z * axis.x + axis.y * s,
      oc * axis.x * axis.y + axis.z * s, oc * axis.y * axis.y + c, oc * axis.y * axis.z - axis.x * s,
      oc * axis.z * axis.x - axis.y * s, oc * axis.y * axis.z + axis.x * s, oc * axis.z * axis.z + c
    );
  }

  vec3 getRay(vec2 fragCoord) {
    vec2 uv = ((fragCoord.xy / u_resolution.xy) * 2.0 - 1.0) * vec2(u_resolution.x / u_resolution.y, 1.0);
    vec3 proj = normalize(vec3(uv.x, uv.y, 1.5));
    return createRotationMatrixAxisAngle(vec3(1.0, 0.0, 0.0), 0.14) * proj;
  }

  float intersectPlane(vec3 origin, vec3 direction, vec3 point, vec3 normal) {
    return clamp(dot(point - origin, normal) / dot(direction, normal), -1.0, 9991999.0);
  }

  float raymarchWater(vec3 camera, vec3 start, vec3 end, float depth) {
    vec3 pos = start;
    vec3 dir = normalize(end - start);
    for(int i = 0; i < 32; i++) {
      float height = getWaves(pos.xz) * depth - depth;
      if(height + 0.01 > pos.y) {
        return distance(pos, camera);
      }
      pos += dir * (pos.y - height);
    }
    return distance(start, camera);
  }

  vec3 getNormal(vec2 pos, float e, float depth) {
    vec2 ex = vec2(e, 0);
    float H = getWaves(pos.xy) * depth;
    vec3 a = vec3(pos.x, H, pos.y);
    return normalize(
      cross(
        a - vec3(pos.x - e, getWaves(pos.xy - ex.xy) * depth, pos.y),
        a - vec3(pos.x, getWaves(pos.xy + ex.yx) * depth, pos.y + e)
      )
    );
  }

  vec3 aces_tonemap(vec3 color) {
    mat3 m1 = mat3(
      0.59719, 0.07600, 0.02840,
      0.35458, 0.90834, 0.13383,
      0.04823, 0.01566, 0.83777
    );
    mat3 m2 = mat3(
      1.60475, -0.10208, -0.00327,
      -0.53108,  1.10813, -0.07276,
      -0.07367, -0.00605,  1.07602
    );
    vec3 v = m1 * color;
    vec3 a = v * (v + 0.0245786) - 0.000090537;
    vec3 b = v * (0.983729 * v + 0.4329510) + 0.238081;
    return pow(clamp(m2 * (a / b), 0.0, 1.0), vec3(1.0 / 2.2));
  }

  void main() {
    vec2 fragCoord = gl_FragCoord.xy;
    vec3 ray = getRay(fragCoord);

    float NIGHT_EPS = 0.001;
    vec3 C;

    if(ray.y >= 0.0) {
      float horizonFactor = smoothstep(0.02, 0.25, ray.y);
      float nightBlend = pow(u_night, mix(0.35, 1.0, horizonFactor));

      if (u_night <= NIGHT_EPS) {
        C = getDaySky(ray);
      } else if (u_night >= 1.0 - NIGHT_EPS) {
        C = getNightSky(ray);
      } else {
        vec3 daySky = getDaySky(ray);
        vec3 nightSky = getNightSky(ray);
        C = mix(daySky, nightSky, nightBlend);
      }

      C = aces_tonemap(C * 2.0);
    } else {
      vec3 waterPlaneHigh = vec3(0.0, 0.0, 0.0);
      vec3 waterPlaneLow = vec3(0.0, -WATER_DEPTH, 0.0);
      vec3 origin = vec3(u_time * 0.2, CAMERA_HEIGHT, 1.0);

      float highPlaneHit = intersectPlane(origin, ray, waterPlaneHigh, vec3(0.0, 1.0, 0.0));
      float lowPlaneHit = intersectPlane(origin, ray, waterPlaneLow, vec3(0.0, 1.0, 0.0));
      vec3 highHitPos = origin + ray * highPlaneHit;
      vec3 lowHitPos = origin + ray * lowPlaneHit;

      float dist = raymarchWater(origin, highHitPos, lowHitPos, WATER_DEPTH);
      vec3 waterHitPos = origin + ray * dist;

      float eps = max(0.01, dist * 0.004);
      vec3 N = getNormal(waterHitPos.xz, eps, WATER_DEPTH);
      N = mix(N, vec3(0.0, 1.0, 0.0), 0.8 * min(1.0, sqrt(dist * 0.01) * 1.1));

      float waveH = getWaves(waterHitPos.xz);
      float waveLine = smoothstep(0.0, 0.03, abs(waveH) - 0.15);
      float detail = 1.0 - waveLine;

      float fresnelSharp = 0.3 + 0.7 * pow(1.0 - max(0.0, dot(-N, ray)), 5.0);
      float fresnelFlat = 0.3 + 0.7 * pow(1.0 - max(0.0, dot(vec3(0.0, 1.0, 0.0), -ray)), 5.0);
      float fresnelBlend = min(1.0, sqrt(dist * 0.01) * 1.1);
      float fresnel = mix(fresnelSharp, fresnelFlat, fresnelBlend);

      vec3 dayWater = mix(vec3(0.58, 0.62, 0.67), vec3(0.72, 0.76, 0.8), smoothstep(-0.5, 0.5, waterHitPos.y));
      vec3 nightWater = mix(vec3(0.02, 0.02, 0.03), vec3(0.04, 0.04, 0.05), smoothstep(-0.5, 0.5, waterHitPos.y));

      vec3 waterBase = mix(dayWater, nightWater, u_night);
      vec3 waterColor = waterBase * fresnel;

      float surfaceTexture = fbm(waterHitPos.xz * 2.0 + u_time * 0.3) * 0.15;
      waterColor += vec3(surfaceTexture) * 0.1;

      vec3 fogColor = mix(vec3(0.4), vec3(0.04), u_night);
      float fogAmount = 1.0 - exp(-dist * 0.02);
      waterColor = mix(waterColor, fogColor, fogAmount);

      float waveBrightness = mix(1.4, 1.9, u_night);
      C = aces_tonemap(waterColor * waveBrightness);
    }

    float gray = dot(C, vec3(0.299, 0.587, 0.114));
    float t = u_time * 1.5;
    vec2 uv = gl_FragCoord.xy / u_resolution;
    float seed = dot(uv, vec2(12.9898, 78.233));
    float noise = fract(sin(seed) * 43758.5453 + t);
    float variance = mix(0.85, 0.7, u_night);
    noise = (1.0 / (variance * sqrt(2.0 * 3.1415))) * exp(-(((noise - 0.0) * (noise - 0.0)) / (2.0 * (variance * variance))));
    vec3 grain = vec3(noise) * (1.0 - vec3(gray));
    float grainIntensity = mix(0.6, 0.1, u_night);
    gray = gray + grain.r * grainIntensity;
    gray = clamp(gray, 0.0, 1.0);

    vec3 dark = mix(vec3(0.235), vec3(0.02), u_night);
    vec3 light = mix(vec3(0.836), vec3(1.0), u_night);
    C = mix(dark, light, gray);

    gl_FragColor = vec4(C, 1.0);
  }
`;

function createShader(
  gl: WebGLRenderingContext,
  type: number,
  source: string,
): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("Shader compile error:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createProgram(
  gl: WebGLRenderingContext,
  vs: WebGLShader,
  fs: WebGLShader,
): WebGLProgram | null {
  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program);
    return null;
  }
  return program;
}

export default function WaveBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", { alpha: false });
    if (!gl) return;

    const vs = createShader(gl, gl.VERTEX_SHADER, vertexShader);
    const fs = createShader(gl, gl.FRAGMENT_SHADER, fragmentShader);
    if (!vs || !fs) return;

    const program = createProgram(gl, vs, fs);
    if (!program) return;

    const posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW,
    );

    const posLoc = gl.getAttribLocation(program, "a_position");
    const resLoc = gl.getUniformLocation(program, "u_resolution");
    const timeLoc = gl.getUniformLocation(program, "u_time");
    const nightLoc = gl.getUniformLocation(program, "u_night");

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      canvas!.width = window.innerWidth * dpr;
      canvas!.height = window.innerHeight * dpr;
      canvas!.style.width = window.innerWidth + "px";
      canvas!.style.height = window.innerHeight + "px";
      gl!.viewport(0, 0, canvas!.width, canvas!.height);
    }

    function getNightAmount() {
      return document.documentElement.classList.contains("dark") ? 1.0 : 0.0;
    }

    resize();
    window.addEventListener("resize", resize);

    let animId: number;
    const startTime = Date.now();

    function render() {
      if (!gl || !program) return;

      gl.useProgram(program);

      gl.enableVertexAttribArray(posLoc);
      gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
      gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

      const t = (Date.now() - startTime) / 1000;
      gl.uniform2f(resLoc, canvas!.width, canvas!.height);
      gl.uniform1f(timeLoc, t);
      gl.uniform1f(nightLoc, getNightAmount());

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      animId = requestAnimationFrame(render);
    }

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0"
      style={{ pointerEvents: "none" }}
    />
  );
}
