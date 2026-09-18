"use client";

import React, { useRef, useMemo, useEffect, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { useScroll } from "framer-motion";
import { useSpringMouse } from "../providers/MouseContext";
import { sound } from "@/lib/sound";

useGLTF.preload("/models/tie.glb");

// Preload Filip's photo immediately at module load time so it's fully decoded
// before createUpperSectionTexture() is ever called — prevents the WebGL
// canvas texture from briefly showing a photo-less version on first draw.
const _filipImg = new Image();
_filipImg.crossOrigin = "anonymous";
_filipImg.src = "/textures/filip_footer_5.webp";
// Kick off async decode now (no await needed — by the time the WebGL scene
// mounts and createUpperSectionTexture runs, the image will be ready).
_filipImg.decode().catch(() => { /* non-fatal — onload fallback handles it */ });

// ─────────────────────────────────────────────────────────────
// SHARED HELPERS
// ─────────────────────────────────────────────────────────────

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smoothstep = (a: number, b: number, v: number) => {
  const t = clamp01((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};

// ─────────────────────────────────────────────────────────────
// 1. 3D PEELING PAPER SHEET SHADER & MESH
//    Renders the upper section ("Had Enough Reading? Let's Shred This Thing.")
//    and curls/peels it away in 3D on scroll to reveal the behind section
// ─────────────────────────────────────────────────────────────

function createUpperSectionTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 2048;
  canvas.height = 1280;
  const ctx = canvas.getContext("2d")!;

  // Warm vintage newsprint paper background
  ctx.fillStyle = "#efe9d3";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Retro top rainbow accent stripe
  const stripeColors = ["#E63946", "#F4A261", "#E9C46A", "#2A9D8F", "#264653"];
  stripeColors.forEach((color, idx) => {
    ctx.fillStyle = color;
    ctx.fillRect(0, idx * 5, canvas.width, 5);
  });

  // Left Title
  ctx.fillStyle = "#1f1e1a";
  ctx.font = "normal 86px 'STIX Two Text', Georgia, serif";
  ctx.fillText("Had Enough", 140, 360);
  ctx.fillText("Reading? Let's", 140, 465);
  ctx.fillText("Shred This Thing.", 140, 570);

  // Subtitle
  ctx.fillStyle = "#4a4742";
  ctx.font = "32px 'STIX Two Text', Georgia, serif";
  ctx.fillText("Ready to cut through the noise? Let's turn your vision", 140, 675);
  ctx.fillText("into an award-winning interactive reality.", 140, 725);

  // Purple Button "✂️ Shred This Document"
  ctx.fillStyle = "#5E33BF";
  ctx.beginPath();
  ctx.roundRect(140, 800, 390, 82, 8);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 30px 'STIX Two Text', Georgia, serif";
  ctx.fillText("✂️ Shred This Document", 175, 852);

  // Button "☎ Book a Consultation"
  ctx.fillStyle = "rgba(0,0,0,0.04)";
  ctx.beginPath();
  ctx.roundRect(560, 800, 370, 82, 8);
  ctx.fill();
  ctx.strokeStyle = "rgba(0,0,0,0.25)";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = "#1f1e1a";
  ctx.font = "30px 'STIX Two Text', Georgia, serif";
  ctx.fillText("☎ Book a Consultation", 595, 852);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;

  // Draw Filip's cutout photo — use the pre-decoded module-level image if it
  // has already loaded (naturalWidth > 0), otherwise fall back to onload so
  // the texture still works even if preload somehow didn't finish in time.
  const drawFilip = (img: HTMLImageElement) => {
    const imgAspect = img.width / img.height;
    const drawH = 1120;
    const drawW = drawH * imgAspect;
    const drawX = canvas.width - drawW - 90;
    const drawY = canvas.height - drawH + 50;

    ctx.save();
    ctx.shadowColor = "rgba(0, 0, 0, 0.18)";
    ctx.shadowBlur = 35;
    ctx.shadowOffsetY = 18;
    ctx.drawImage(img, drawX, drawY, drawW, drawH);
    ctx.restore();
    tex.needsUpdate = true;
  };

  if (_filipImg.naturalWidth > 0) {
    // Already decoded — draw synchronously so the first render of this texture
    // already contains the photo (no pop-in).
    drawFilip(_filipImg);
  } else {
    // Still loading — draw once it arrives.  Rare after the module-level
    // decode() preload, but keeps correctness on slow connections.
    _filipImg.onload = () => drawFilip(_filipImg);
  }

  return tex;
}

const pagePeelVertexShader = `
  uniform float uProgress;
  uniform float uRadius;
  uniform vec2 uPlaneSize;

  varying vec2 vUv;
  varying vec3 vNormalVec;
  varying float vCurlDist;
  varying float vIsBack;

  void main() {
    vUv = uv;
    vec3 pos = position;

    // Sweep direction: rolls from top-right diagonally across to bottom-left
    vec2 sweepDir = normalize(vec2(-0.45, -1.0));
    vec2 rollDir = -sweepDir;

    float hw = uPlaneSize.x * 0.5;
    float hh = uPlaneSize.y * 0.5;
    float s_tr = dot(vec2(hw, hh), sweepDir);
    float s_bl = dot(vec2(-hw, -hh), sweepDir);
    float s_tl = dot(vec2(-hw, hh), sweepDir);
    float s_br = dot(vec2(hw, -hh), sweepDir);

    float s_min = min(min(s_tr, s_bl), min(s_tl, s_br));
    float s_max = max(max(s_tr, s_bl), max(s_tl, s_br));

    float PI = 3.14159265359;
    float rollLength = PI * uRadius;

    float progress = clamp(uProgress, 0.0, 1.02);
    // Peel fold axis line sweeps across the sheet
    float s0 = mix(s_min - 0.08, s_max + rollLength + 0.45, progress);

    float s = dot(pos.xy, sweepDir);
    float d = s0 - s;

    vCurlDist = d;
    vec3 n = vec3(0.0, 0.0, 1.0);
    float isBack = 0.0;

    if (d <= 0.0) {
      // Unpeeled flat plane
      n = vec3(0.0, 0.0, 1.0);
      isBack = 0.0;
    } else if (d < rollLength) {
      // Wrapping around cylinder in the roll direction
      float alpha = d / uRadius;
      pos.z = uRadius * (1.0 - cos(alpha));
      pos.xy += rollDir * (d - uRadius * sin(alpha));

      // Normal rotated around the cylinder axis
      n = normalize(vec3(rollDir * sin(alpha), cos(alpha)));
      if (alpha > PI * 0.5) {
        isBack = 1.0;
      }
    } else {
      // Past the roll: continue along roll tangent
      float extra = d - rollLength;
      pos.z = 2.0 * uRadius;
      pos.xy += rollDir * (rollLength + extra * 1.6);
      n = vec3(0.0, 0.0, -1.0);
      isBack = 1.0;
    }

    vNormalVec = n;
    vIsBack = isBack;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const pagePeelFragmentShader = `
  uniform sampler2D uTexture;
  uniform float uRadius;
  uniform float uProgress;

  varying vec2 vUv;
  varying vec3 vNormalVec;
  varying float vCurlDist;
  varying float vIsBack;

  void main() {
    float PI = 3.14159265359;
    float rollLength = PI * uRadius;

    // Discard rolled-off fragments so behind section is cleanly revealed
    if (vCurlDist >= rollLength + 0.15) {
      discard;
    }

    bool isFront = gl_FrontFacing && (vIsBack < 0.5);

    if (isFront) {
      // FRONT FACE: Upper section printed newsprint texture
      vec4 texColor = texture2D(uTexture, vUv);

      // Subtle light specular sheen along the curl curve
      if (vCurlDist > 0.0 && vCurlDist < rollLength) {
        float creaseSheen = pow(max(dot(vNormalVec, normalize(vec3(0.3, 0.7, 0.8))), 0.0), 10.0) * 0.28;
        texColor.rgb += vec3(creaseSheen);
      }

      gl_FragColor = texColor;
    } else {
      // BACK FACE: Satin underside of peeling paper
      vec3 paperBack = vec3(0.92, 0.89, 0.83);

      // Ambient Occlusion shadow inside the cylinder fold
      float foldAO = smoothstep(0.0, rollLength * 0.8, vCurlDist) * (1.0 - smoothstep(rollLength * 0.8, rollLength + 0.3, vCurlDist));
      paperBack *= (1.0 - foldAO * 0.42);

      // Directional lighting on reverse face
      vec3 lightDir = normalize(vec3(-0.3, 0.7, 0.65));
      float diff = max(dot(-vNormalVec, lightDir), 0.0) * 0.28 + 0.72;
      paperBack *= diff;

      gl_FragColor = vec4(paperBack, 1.0);
    }
  }
`;

function PeelingSheetMesh({ progressRef }: { progressRef: React.MutableRefObject<number> }) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { viewport } = useThree();

  const docTexture = useMemo(() => createUpperSectionTexture(), []);

  const uniforms = useMemo(
    () => ({
      uTexture: { value: docTexture },
      uProgress: { value: 0 },
      uRadius: { value: 0.85 },
      uPlaneSize: { value: new THREE.Vector2(viewport.width, viewport.height) },
    }),
    [docTexture, viewport.width, viewport.height]
  );

  useEffect(() => {
    return () => {
      docTexture.dispose();
    };
  }, [docTexture]);

  useFrame(() => {
    if (!materialRef.current) return;
    materialRef.current.uniforms.uProgress.value = progressRef.current;
    materialRef.current.uniforms.uPlaneSize.value.set(viewport.width, viewport.height);
  });

  return (
    <mesh position={[0, 0, 0]}>
      <planeGeometry args={[viewport.width, viewport.height, 120, 80]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={pagePeelVertexShader}
        fragmentShader={pagePeelFragmentShader}
        uniforms={uniforms}
        side={THREE.DoubleSide}
        transparent
      />
    </mesh>
  );
}

// ─────────────────────────────────────────────────────────────
// 2. BEHIND SECTION: STARRY SPACE BACKDROP & TUMBLING 3D STARS
// ─────────────────────────────────────────────────────────────

function createStarGeometry() {
  const shape = new THREE.Shape();
  const points = 5;
  const outerRadius = 1.0;
  const innerRadius = 0.48;
  const step = Math.PI / points;

  for (let i = 0; i < 2 * points; i++) {
    const r = i % 2 === 0 ? outerRadius : innerRadius;
    const a = i * step - Math.PI / 2;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();

  const geom = new THREE.ExtrudeGeometry(shape, {
    depth: 0.14,
    bevelEnabled: true,
    bevelSegments: 2,
    steps: 1,
    bevelSize: 0.04,
    bevelThickness: 0.04,
  });
  geom.center();
  return geom;
}

const STAR_PROPS = [
  { startY: 2.2, endY: 0.6, startX: -2.8, endX: -2.2, z: 0.5, scale: 0.36, initialRot: [0.4, -0.3, 0.6], rotSpeed: [0.38, 0.46, 0.28] },
  { startY: 2.4, endY: 0.8, startX: 2.7, endX: 2.1, z: 0.7, scale: 0.38, initialRot: [1.2, 0.5, 0.3], rotSpeed: [0.42, 0.34, 0.31] },
  { startY: 0.7, endY: -0.9, startX: -3.0, endX: -2.4, z: 1.0, scale: 0.42, initialRot: [0.6, 1.2, 0.8], rotSpeed: [0.32, 0.45, 0.25] },
  { startY: 0.5, endY: -1.1, startX: 2.9, endX: 2.3, z: 0.9, scale: 0.35, initialRot: [1.4, 0.8, 0.5], rotSpeed: [0.36, 0.39, 0.33] },
  { startY: -1.0, endY: -2.2, startX: -2.3, endX: -1.8, z: 0.6, scale: 0.32, initialRot: [0.8, 1.5, 0.4], rotSpeed: [0.41, 0.29, 0.35] },
  { startY: -1.2, endY: -2.4, startX: 2.3, endX: 1.7, z: 0.5, scale: 0.34, initialRot: [0.3, 0.9, 1.1], rotSpeed: [0.35, 0.41, 0.26] },
  { startY: 2.7, endY: 1.5, startX: 0.5, endX: -0.2, z: -0.8, scale: 0.22, initialRot: [0.5, 1.1, 0.7], rotSpeed: [0.24, 0.31, 0.22] },
  { startY: -2.0, endY: -2.7, startX: -0.6, endX: 0.3, z: -0.6, scale: 0.25, initialRot: [1.0, 0.4, 1.3], rotSpeed: [0.28, 0.33, 0.29] },
] as const;

function StarItem({
  config,
  progressRef,
  geometry,
  material,
  index,
}: {
  config: (typeof STAR_PROPS)[number];
  progressRef: React.MutableRefObject<number>;
  geometry: THREE.BufferGeometry;
  material: THREE.Material;
  index: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { getMouse } = useSpringMouse();

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    const p = progressRef.current;
    const time = state.clock.getElapsedTime();
    const mouse = getMouse();

    const oscX = Math.sin(time * 0.7 + index * 1.2) * 0.04;
    const oscY = Math.cos(time * 0.6 + index * 1.0) * 0.035;

    const targetX = THREE.MathUtils.lerp(config.startX, config.endX, p) + oscX + mouse.x * 0.14;
    const targetY = THREE.MathUtils.lerp(config.startY, config.endY, p) + oscY + mouse.y * 0.1;

    meshRef.current.position.x = THREE.MathUtils.damp(meshRef.current.position.x, targetX, 5, delta);
    meshRef.current.position.y = THREE.MathUtils.damp(meshRef.current.position.y, targetY, 5, delta);
    meshRef.current.position.z = config.z;

    meshRef.current.rotation.x = config.initialRot[0] + time * config.rotSpeed[0] + p * 1.5;
    meshRef.current.rotation.y = config.initialRot[1] + time * config.rotSpeed[1] + p * 2.0;
    meshRef.current.rotation.z = config.initialRot[2] + time * config.rotSpeed[2] + p * 1.2;
  });

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      material={material}
      scale={config.scale}
      position={[config.startX, config.startY, config.z]}
    />
  );
}

function StarCascadeGroup({ progressRef }: { progressRef: React.MutableRefObject<number> }) {
  const starGeom = useMemo(() => createStarGeometry(), []);
  const starMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#ba9a44"),
        roughness: 0.38,
        metalness: 0.76,
      }),
    []
  );

  useEffect(() => () => { starGeom.dispose(); starMat.dispose(); }, [starGeom, starMat]);

  return (
    <group>
      {STAR_PROPS.map((cfg, i) => (
        <StarItem key={i} config={cfg} progressRef={progressRef} geometry={starGeom} material={starMat} index={i} />
      ))}
    </group>
  );
}

// ─────────────────────────────────────────────────────────────
// 3. THE STAGE: MONOLITHIC GOLD TIE & AUDIENCE
// ─────────────────────────────────────────────────────────────

function StageTie() {
  const { scene } = useGLTF("/models/tie.glb") as any;
  const model = useMemo(() => scene.clone(true), [scene]);
  const tieRef = useRef<THREE.Group>(null);
  const shaderRef = useRef<any>(null);

  useEffect(() => {
    model.traverse((child: any) => {
      if (!child.isMesh) return;

      const mat = new THREE.MeshStandardMaterial({
        color: new THREE.Color("#c9962c"),
        roughness: 0.14,
        metalness: 0.96,
      });

      mat.onBeforeCompile = (shader) => {
        shader.uniforms.uTime = { value: 0 };
        shaderRef.current = shader;

        shader.vertexShader = `
          uniform float uTime;
          varying vec3 vWorldNormal;
          varying vec3 vWorldPos;
          ${shader.vertexShader}
        `.replace(
          "#include <begin_vertex>",
          `#include <begin_vertex>
           vWorldNormal = normalize(mat3(modelMatrix) * normal);
           vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
           float ripple = sin(position.y * 6.5 + uTime * 1.9) * cos(position.x * 5.0 + uTime * 1.4) * 0.018;
           transformed += normal * ripple;
          `
        );

        shader.fragmentShader = `
          uniform float uTime;
          varying vec3 vWorldNormal;
          varying vec3 vWorldPos;
          ${shader.fragmentShader}
        `.replace(
          "#include <dithering_fragment>",
          `#include <dithering_fragment>
           vec3 viewD = normalize(cameraPosition - vWorldPos);
           vec3 streakDir = normalize(vec3(0.0, 1.0, 1.4));
           float streak = pow(max(dot(vWorldNormal, streakDir), 0.0), 16.0);
           float fres = pow(1.0 - max(dot(vWorldNormal, viewD), 0.0), 3.0);
           gl_FragColor.rgb += vec3(1.3, 1.18, 0.82) * streak * 0.9
                             + vec3(1.15, 0.92, 0.42) * fres * 0.45;
          `
        );
      };

      child.material = mat;
      child.castShadow = false;
      child.receiveShadow = false;
    });
  }, [model]);

  useFrame((state) => {
    if (!tieRef.current) return;
    const t = state.clock.getElapsedTime();
    if (shaderRef.current) shaderRef.current.uniforms.uTime.value = t;
    tieRef.current.rotation.y = Math.sin(t * 0.45) * 0.14;
    tieRef.current.rotation.z = Math.cos(t * 0.6) * 0.022;
  });

  return (
    <group ref={tieRef} scale={7.4} position={[0, -0.35, 0]}>
      <primitive object={model} />
    </group>
  );
}

const GROUND_Y = -3.05;

type CutoutCfg = {
  url: string;
  x: number;
  z: number;
  height: number;
  flip?: boolean;
  phase: number;
};

const CROWD: CutoutCfg[] = [
  { url: "/textures/cheering_pink_suit.webp", x: -1.75, z: -7.4, height: 3.4, phase: 0.0 },
  { url: "/textures/cheering_gray_suit.webp", x: -1.05, z: -8.1, height: 3.4, flip: true, phase: 1.1 },
  { url: "/textures/jacob_presenting.webp", x: -2.45, z: -6.6, height: 3.4, phase: 2.3 },
  { url: "/textures/simon_presenting.webp", x: 1.15, z: -7.9, height: 3.4, flip: true, phase: 0.7 },
  { url: "/textures/cheering_pink_suit.webp", x: 1.95, z: -6.9, height: 3.4, flip: true, phase: 3.0 },
  { url: "/textures/cheering_gray_suit.webp", x: 2.6, z: -8.3, height: 3.4, phase: 1.8 },
  { url: "/textures/jacob_presenting.webp", x: -3.7, z: -4.2, height: 3.4, phase: 2.6 },
  { url: "/textures/cheering_pink_suit.webp", x: -2.95, z: -3.1, height: 3.4, phase: 0.4 },
  { url: "/textures/simon_presenting.webp", x: 3.35, z: -4.0, height: 3.4, flip: true, phase: 1.5 },
  { url: "/textures/cheering_gray_suit.webp", x: 4.1, z: -3.0, height: 3.4, flip: true, phase: 2.9 },
  { url: "/textures/cheering_gray_suit.webp", x: -5.5, z: -0.4, height: 3.4, phase: 1.2 },
  { url: "/textures/cheering_pink_suit.webp", x: -4.6, z: 0.9, height: 3.4, phase: 3.3 },
  { url: "/textures/simon_presenting.webp", x: 4.9, z: -0.2, height: 3.4, flip: true, phase: 0.9 },
  { url: "/textures/jacob_presenting.webp", x: 5.8, z: 1.1, height: 3.4, flip: true, phase: 2.1 },
];

function Cutout({ cfg }: { cfg: CutoutCfg }) {
  const tex = useTexture(cfg.url);
  const meshRef = useRef<THREE.Mesh>(null);

  useEffect(() => {
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    tex.needsUpdate = true;
  }, [tex]);

  const aspect = tex.image ? tex.image.width / tex.image.height : 0.45;
  const w = cfg.height * aspect;

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    meshRef.current.position.y = GROUND_Y + cfg.height / 2 + Math.sin(t * 3.1 + cfg.phase) * 0.035;
    meshRef.current.rotation.z = Math.sin(t * 2.2 + cfg.phase) * 0.012;
  });

  return (
    <mesh ref={meshRef} position={[cfg.x, GROUND_Y + cfg.height / 2, cfg.z]} scale={[cfg.flip ? -1 : 1, 1, 1]}>
      <planeGeometry args={[w, cfg.height]} />
      <meshBasicMaterial
        map={tex}
        transparent
        alphaTest={0.04}
        toneMapped={false}
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

const CAM_START_Z = 11.2;
const CAM_END_Z = 2.4;

function StageCamera({ progressRef }: { progressRef: React.MutableRefObject<number> }) {
  const { camera } = useThree();
  const { getMouse } = useSpringMouse();

  useFrame((_, delta) => {
    const p = progressRef.current;
    const e = 1 - Math.pow(1 - clamp01(p), 2.0);
    const mouse = getMouse();

    const targetZ = THREE.MathUtils.lerp(CAM_START_Z, CAM_END_Z, e);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, targetZ, 6, delta);
    camera.position.x = THREE.MathUtils.damp(camera.position.x, mouse.x * 0.45, 4, delta);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, 0.35 + mouse.y * 0.25, 4, delta);
    camera.lookAt(0, 0.1, 0);
  });

  return null;
}

// ─────────────────────────────────────────────────────────────
// 4. STAR PATH + COVERAGE MATH
// ─────────────────────────────────────────────────────────────

const STAR_PATH_D =
  "M 0,-100 L 26.45,-36.41 L 95.11,-30.90 L 42.80,13.91 L 58.78,80.90 L 0,45.00 L -58.78,80.90 L -42.80,13.91 L -95.11,-30.90 L -26.45,-36.41 Z";

const STAR_INNER_R = 45;
const COVER_SAFETY = 1.14;

// ─────────────────────────────────────────────────────────────
// 5. MASTER OVERLAPPING SCENE
//    - TOP LAYER: Upper section ("Had Enough Reading?")
//    - BEHIND LAYER: Behind section ("Still Not Convinced..." + Star Zoom)
// ─────────────────────────────────────────────────────────────

export function GoldenTieScene({
  onOpenCal,
  onTriggerShred,
}: {
  onOpenCal?: () => void;
  onTriggerShred?: () => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const clipPathRef = useRef<SVGPathElement>(null);
  const strokePathRef = useRef<SVGPathElement>(null);
  const upperDomRef = useRef<HTMLDivElement>(null);
  const peelingWrapperRef = useRef<HTMLDivElement>(null);
  const section1TextRef = useRef<HTMLDivElement>(null);
  const section2WrapperRef = useRef<HTMLDivElement>(null);
  const section2TextRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });

  const peelProgressRef = useRef(0);
  const starCascadeProgressRef = useRef(0);
  const stageProgressRef = useRef(0);
  const lastProgress = useRef(0);

  const handleTriggerShred = () => {
    sound.playShred();
    onTriggerShred?.();
    if (trackRef.current) {
      const rect = trackRef.current.getBoundingClientRect();
      const trackTop = window.scrollY + rect.top;
      // Scroll to 38% where the upper section has peeled and behind section is fully visible
      const targetScroll = trackTop + (trackRef.current.offsetHeight - window.innerHeight) * 0.38;
      window.scrollTo({ top: targetScroll, behavior: "smooth" });
    }
  };

  useEffect(() => {
    const updateScene = (progress: number) => {
      lastProgress.current = progress;

      // ── PHASE 1: PEELING EFFECT ON UPPER SECTION (progress 0.00 -> 0.28) ──
      const pPeel = clamp01(progress / 0.28);
      peelProgressRef.current = pPeel;

      // DOM overlay: interactive buttons and text on the flat unpeeled sheet.
      // Hide with an instant cut (visibility) rather than a cross-fade the moment
      // any scroll starts — blending two visually-different renditions of the
      // same content (crisp DOM vs. canvas-drawn WebGL texture) over several
      // frames is what reads as a doubled/ghosted image.
      if (upperDomRef.current) {
        if (progress < 0.001) {
          upperDomRef.current.style.opacity = "1";
          upperDomRef.current.style.pointerEvents = "auto";
          upperDomRef.current.style.visibility = "visible";
        } else {
          upperDomRef.current.style.opacity = "0";
          upperDomRef.current.style.pointerEvents = "none";
          upperDomRef.current.style.visibility = "hidden";
        }
      }

      // Hide 3D peeling canvas once paper has completely rolled off
      if (peelingWrapperRef.current) {
        if (progress < 0.30) {
          peelingWrapperRef.current.style.visibility = "visible";
        } else {
          peelingWrapperRef.current.style.visibility = "hidden";
        }
      }

      // Tumbling stars in the behind section
      starCascadeProgressRef.current = progress;

      if (!clipPathRef.current || !strokePathRef.current || !section2WrapperRef.current) return;

      const w = window.innerWidth;
      const h = window.innerHeight;

      const originX = w * 0.44;
      const originY = h * 0.54;

      const maxDist = Math.max(
        Math.hypot(originX, originY),
        Math.hypot(w - originX, originY),
        Math.hypot(originX, h - originY),
        Math.hypot(w - originX, h - originY)
      );
      const finalScale = (maxDist / STAR_INNER_R) * COVER_SAFETY;

      // ── PHASE 2: BEHIND SECTION REVEALED & FIXED IN POSITION (progress 0.28 -> 0.60) ──
      if (progress < 0.60) {
        clipPathRef.current.setAttribute("transform", `translate(${originX}, ${originY}) scale(0.0001)`);
        strokePathRef.current.setAttribute("transform", `translate(${originX}, ${originY}) scale(0.0001)`);
        strokePathRef.current.style.opacity = "0";

        // Behind section text is 100% visible & fixed
        if (section1TextRef.current) {
          section1TextRef.current.style.opacity = "1";
        }
        if (section2TextRef.current) {
          section2TextRef.current.style.opacity = "0";
        }
        section2WrapperRef.current.style.pointerEvents = "none";
        section2WrapperRef.current.style.visibility = "hidden";
        stageProgressRef.current = 0;
        return;
      }

      // ── PHASE 3: STAR ZOOM TO FULL SCREEN (progress 0.60 -> 0.86) ──
      if (progress >= 0.60 && progress < 0.86) {
        const tZoom = clamp01((progress - 0.60) / 0.26);
        const eased = Math.pow(tZoom, 2.3);
        const scale = 0.04 + eased * finalScale;
        const rot = tZoom * 28;

        const transformStr = `translate(${originX}, ${originY}) scale(${scale}) rotate(${rot})`;
        clipPathRef.current.setAttribute("transform", transformStr);
        strokePathRef.current.setAttribute("transform", transformStr);
        strokePathRef.current.style.opacity = tZoom >= 0.94 ? "0" : "1";

        section2WrapperRef.current.style.visibility = "visible";
        section2WrapperRef.current.style.pointerEvents = tZoom >= 0.96 ? "auto" : "none";

        // Behind section headline dissolves out cleanly as star opens
        if (section1TextRef.current) {
          section1TextRef.current.style.opacity = String(1.0 - smoothstep(0.02, 0.35, tZoom));
        }

        // Golden Tie headline fades in near the end of zoom
        if (section2TextRef.current) {
          section2TextRef.current.style.opacity = String(smoothstep(0.82, 0.98, tZoom));
        }

        stageProgressRef.current = tZoom * 0.7;
        return;
      }

      // ── PHASE 4: GOLDEN TIE CEREMONY FULL SCREEN FINALE (progress 0.86 -> 1.00) ──
      const tEnd = clamp01((progress - 0.86) / 0.14);
      const transformStr = `translate(${originX}, ${originY}) scale(${finalScale * 1.05}) rotate(28)`;
      clipPathRef.current.setAttribute("transform", transformStr);
      strokePathRef.current.setAttribute("transform", transformStr);
      strokePathRef.current.style.opacity = "0";

      if (section1TextRef.current) {
        section1TextRef.current.style.opacity = "0";
      }
      if (section2TextRef.current) {
        section2TextRef.current.style.opacity = "1";
      }

      section2WrapperRef.current.style.visibility = "visible";
      section2WrapperRef.current.style.pointerEvents = "auto";
      stageProgressRef.current = 0.7 + tEnd * 0.3;
    };

    const onResize = () => updateScene(lastProgress.current);
    window.addEventListener("resize", onResize);
    const unsub = scrollYProgress.on("change", updateScene);
    updateScene(scrollYProgress.get());

    return () => {
      window.removeEventListener("resize", onResize);
      unsub();
    };
  }, [scrollYProgress]);

  return (
    <div
      ref={trackRef}
      aria-label="Overlapping Page Peel from Had Enough Reading to Still Not Convinced and Golden Tie Star Zoom"
      className="relative w-full select-none"
      style={{ height: "480dvh" }}
    >
      {/* ── STICKY PINNED VIEWPORT: BOTH SECTIONS OVERLAP IN THIS VIEWPORT ── */}
      <div className="sticky top-0 w-full h-screen overflow-hidden">
        {/* CLIP-PATH FOR STAR ZOOM */}
        <svg width="0" height="0" className="absolute pointer-events-none" aria-hidden="true">
          <defs>
            <clipPath id="star-wipe-clip" clipPathUnits="userSpaceOnUse">
              <path ref={clipPathRef} d={STAR_PATH_D} />
            </clipPath>
            <linearGradient id="star-bevel" x1="0" y1="0" x2="0.6" y2="1">
              <stop offset="0%" stopColor="#f7e6a1" />
              <stop offset="45%" stopColor="#bfa043" />
              <stop offset="100%" stopColor="#7a6222" />
            </linearGradient>
          </defs>
        </svg>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* ── SECTION BEHIND IT (LOWER SECTION IN USER IMAGE) ── */}
        {/* ═══════════════════════════════════════════════════════════ */}

        {/* BEHIND LAYER 1: Deep space background with 3D tumbling stars */}
        <div
          className="absolute inset-0 w-full h-full overflow-hidden z-10"
          style={{
            background:
              "radial-gradient(ellipse 120% 88% at 50% 25%, #050410 0%, #08061a 40%, #030208 78%, #000003 100%)",
          }}
        >
          <div className="absolute inset-0 pointer-events-none">
            <Canvas camera={{ position: [0, 0, 5.4], fov: 45 }} gl={{ antialias: true, alpha: true }} dpr={[1, 2]}>
              <ambientLight intensity={1.3} color="#fff6e5" />
              <directionalLight position={[4, 6, 5]} intensity={2.6} color="#ffe5a8" />
              <directionalLight position={[-4, 2, 3]} intensity={1.5} color="#ffd480" />
              <directionalLight position={[0, -5, 2]} intensity={1.4} color="#798ee8" />
              <StarCascadeGroup progressRef={starCascadeProgressRef} />
            </Canvas>
          </div>
        </div>

        {/* BEHIND LAYER 2: The Golden Tie Stage (revealed when the star zooms open) */}
        <div
          ref={section2WrapperRef}
          className="absolute inset-0 w-full h-full overflow-hidden z-20"
          style={{
            background: "#000000",
            clipPath: "url(#star-wipe-clip)",
            WebkitClipPath: "url(#star-wipe-clip)",
          }}
        >
          <Canvas
            camera={{ position: [0, 0.35, CAM_START_Z], fov: 38 }}
            gl={{ antialias: true, alpha: false }}
            dpr={[1, 2]}
            onCreated={({ gl }) => gl.setClearColor("#000000", 1)}
          >
            <ambientLight intensity={0.9} color="#fff6e2" />
            <pointLight position={[0, 6, 5]} intensity={340} color="#fffaed" />
            <pointLight position={[-7, 2, 3]} intensity={200} color="#f5c742" />
            <pointLight position={[7, -1, 3]} intensity={180} color="#ffe082" />
            <pointLight position={[0, -4, -2]} intensity={90} color="#ffd54f" />
            <StageCamera progressRef={stageProgressRef} />
            <Suspense fallback={null}>
              <StageTie />
              {CROWD.map((cfg, i) => (
                <Cutout key={i} cfg={cfg} />
              ))}
            </Suspense>
          </Canvas>

          <div
            className="absolute inset-x-0 bottom-0 h-1/3 pointer-events-none"
            style={{ background: "linear-gradient(to top, #000 8%, transparent 100%)" }}
          />
        </div>

        {/* BEHIND LAYER 3: Beveled Gold Contour of the Zooming Star */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
          style={{ zIndex: 22 }}
          aria-hidden="true"
        >
          <path
            ref={strokePathRef}
            d={STAR_PATH_D}
            fill="none"
            stroke="url(#star-bevel)"
            strokeWidth="15"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            style={{ opacity: 0, filter: "drop-shadow(0 0 16px rgba(220, 180, 80, 0.55))" }}
          />
        </svg>

        {/* BEHIND LAYER 4: "Check Out This Golden Tie" headline */}
        <div
          ref={section2TextRef}
          className="absolute inset-x-0 top-0 flex flex-col items-center text-center px-6 pointer-events-none"
          style={{ zIndex: 24, opacity: 0, paddingTop: "clamp(80px, 10vh, 140px)" }}
        >
          <h3
            className="font-stix leading-[1.05] tracking-[-0.015em]"
            style={{
              fontSize: "clamp(34px, 5.4vw, 84px)",
              fontWeight: 400,
              color: "#F5F0E6",
              textShadow: "0 0 8px #E0A868, 0 0 22px #B5713A, 0 0 50px rgba(181, 113, 58, 0.55)",
            }}
          >
            Check Out This Golden Tie
          </h3>
          <p
            className="font-stix text-[#F0E6D2] text-base sm:text-xl lg:text-2xl mt-4"
            style={{ textShadow: "0 0 16px rgba(224, 168, 104, 0.4)" }}
          >
            You made it this far. You deserve a tie-break.
          </p>

          {onOpenCal && (
            <button
              onClick={onOpenCal}
              className="pointer-events-auto mt-8 px-9 py-4 rounded-full bg-gradient-to-r from-[#e5c158] to-[#fce881] hover:from-[#fce881] hover:to-[#fff09e] text-black font-stix font-semibold text-lg shadow-[0_0_30px_rgba(229,193,88,0.5)] transition-transform hover:scale-105 active:scale-95 cursor-pointer"
            >
              Take the tie-break: book a call
            </button>
          )}
        </div>

        {/* BEHIND LAYER 5: "Still Not Convinced We're Serious About Business?" headline */}
        <div
          ref={section1TextRef}
          className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 pointer-events-none"
          style={{ zIndex: 25 }}
        >
          <div className="max-w-4xl mx-auto flex flex-col items-center justify-center px-4">
            <h2
              className="font-stix leading-[1.08] tracking-[-0.015em]"
              style={{
                fontSize: "clamp(42px, 6.2vw, 92px)",
                fontWeight: 400,
                color: "#F7F2E7",
                textShadow: "0 0 12px rgba(240, 200, 140, 0.85), 0 0 35px rgba(212, 160, 70, 0.6), 0 0 70px rgba(180, 110, 40, 0.4)",
              }}
            >
              Still Not Convinced We&apos;re Serious About Business?
            </h2>
            <p
              className="font-stix text-[#E0D8C8] text-base sm:text-lg md:text-xl mt-6 sm:mt-8 tracking-wide"
              style={{ textShadow: "0 0 16px rgba(224, 168, 104, 0.45)" }}
            >
              We&apos;ve got one last trick up our sleeve.
            </p>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* ── UPPER SECTION ON TOP (UPPER SECTION IN USER IMAGE) ── */}
        {/* ═══════════════════════════════════════════════════════════ */}

        {/* TOP LAYER 1: 3D Peeling Sheet Canvas (curls away in 3D on scroll) */}
        <div
          ref={peelingWrapperRef}
          className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none"
          style={{ zIndex: 30 }}
        >
          <Canvas camera={{ position: [0, 0, 5], fov: 48 }} gl={{ antialias: true, alpha: true }} dpr={[1, 2]}>
            <ambientLight intensity={1.2} color="#ffffff" />
            <directionalLight position={[2, 6, 4]} intensity={1.8} color="#ffffff" />
            <directionalLight position={[-3, -2, 2]} intensity={0.8} color="#f0ebd8" />
            <PeelingSheetMesh progressRef={peelProgressRef} />
          </Canvas>
        </div>

        {/* TOP LAYER 2: Flat Interactive DOM Overlay (active before peeling) */}
        <div
          ref={upperDomRef}
          className="absolute inset-0 z-40 flex items-center justify-center px-6 lg:px-16 pointer-events-auto transition-opacity duration-150"
          style={{
            background: "#efe9d3",
          }}
        >
          <div className="max-w-7xl w-full flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-16">
            <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left">
              <h2
                className="font-stix text-[#1f1e1a] leading-[1.08] tracking-[-0.015em]"
                style={{ fontSize: "clamp(38px, 5.5vw, 86px)", fontWeight: 400 }}
              >
                Had Enough Reading? Let&apos;s Shred This Thing.
              </h2>
              <p className="font-stix text-lg sm:text-2xl text-[#4a4742] mt-6 font-normal max-w-xl">
                Ready to cut through the noise? Let&apos;s turn your vision into an award-winning interactive reality.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-4">
                <button
                  onClick={handleTriggerShred}
                  onMouseEnter={() => sound.playHover()}
                  className="px-8 py-4 rounded bg-[#5E33BF] hover:bg-[#6f3de0] text-white font-stix text-xl font-medium flex items-center gap-3 transition-all duration-200 shadow-[0_4px_16px_rgba(94,51,191,0.35)] focus:outline-none cursor-pointer active:scale-95"
                >
                  <span className="text-xl">✂️</span>
                  <span>Shred This Document</span>
                </button>
                <button
                  onClick={onOpenCal}
                  onMouseEnter={() => sound.playHover()}
                  className="px-8 py-4 rounded border border-black/20 hover:border-black/50 text-[#1f1e1a] font-stix text-xl font-normal transition-all duration-200 bg-white/40 flex items-center gap-2 cursor-pointer"
                >
                  <img src="/textures/icons/old_phone.svg" alt="" className="w-4 h-4 brightness-0 opacity-80" />
                  <span>Book a Consultation</span>
                </button>
              </div>
            </div>

            <div className="w-full lg:w-1/2 flex justify-center lg:justify-end">
              <div
                onClick={handleTriggerShred}
                onMouseEnter={() => sound.playHover()}
                className="relative w-full max-w-[480px] drop-shadow-[0_15px_30px_rgba(0,0,0,0.18)] cursor-pointer hover:scale-[1.02] transition-transform duration-300"
                title="Click Filip to shred the document!"
              >
                <img
                  src="/textures/filip_footer_5.webp"
                  alt="Filip Shredding Paper"
                  className="w-full h-auto object-contain"
                  draggable={false}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
