"use client";

import React, { useRef, useMemo, useEffect, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { useScroll } from "framer-motion";
import { useSpringMouse } from "../providers/MouseContext";

useGLTF.preload("/models/tie.glb");

// ─────────────────────────────────────────────────────────────
// SHARED HELPERS
// ─────────────────────────────────────────────────────────────

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smoothstep = (a: number, b: number, v: number) => {
  const t = clamp01((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};

// ─────────────────────────────────────────────────────────────
// 1. SECTION-1 BACKDROP: TUMBLING OLIVE-GOLD STARS
//    (unchanged in spirit — this is what shows OUTSIDE the wipe)
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
// 2. THE STAGE: MONOLITHIC GOLD TIE
// ─────────────────────────────────────────────────────────────

function StageTie() {
  const { scene } = useGLTF("/models/tie.glb") as any;
  // useGLTF returns a CACHED, SHARED scene. Mounting it directly in two
  // components reparents it and blanks whichever mounted first. Always clone.
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
    // Very slight sway only — it reads as a monolith, not a floating prop.
    tieRef.current.rotation.y = Math.sin(t * 0.45) * 0.14;
    tieRef.current.rotation.z = Math.cos(t * 0.6) * 0.022;
  });

  return (
    <group ref={tieRef} scale={7.4} position={[0, -0.35, 0]}>
      <primitive object={model} />
    </group>
  );
}

// ─────────────────────────────────────────────────────────────
// 3. THE STAGE: CROWD OF CUTOUTS AT VARYING DEPTH
//    Fixed world height + shared ground line, so perspective alone
//    makes near figures huge and far figures small. This is what
//    produces the spread-out crowd in the reference.
// ─────────────────────────────────────────────────────────────

const GROUND_Y = -3.05;

type CutoutCfg = {
  url: string;
  x: number;
  z: number;
  /** world-units tall; keep near 3.4 so everyone is the same real height */
  height: number;
  flip?: boolean;
  /** phase offset so the crowd doesn't clap in unison */
  phase: number;
};

// Swap/extend these with however many cutout webps you have.
// More distinct files = less obvious repetition. 12–16 reads best.
const CROWD: CutoutCfg[] = [
  // far back, clustered toward centre-left — these read small
  { url: "/textures/cheering_pink_suit.webp", x: -1.75, z: -7.4, height: 3.4, phase: 0.0 },
  { url: "/textures/cheering_gray_suit.webp", x: -1.05, z: -8.1, height: 3.4, flip: true, phase: 1.1 },
  { url: "/textures/jacob_presenting.webp", x: -2.45, z: -6.6, height: 3.4, phase: 2.3 },
  { url: "/textures/simon_presenting.webp", x: 1.15, z: -7.9, height: 3.4, flip: true, phase: 0.7 },
  { url: "/textures/cheering_pink_suit.webp", x: 1.95, z: -6.9, height: 3.4, flip: true, phase: 3.0 },
  { url: "/textures/cheering_gray_suit.webp", x: 2.6, z: -8.3, height: 3.4, phase: 1.8 },

  // mid ground
  { url: "/textures/jacob_presenting.webp", x: -3.7, z: -4.2, height: 3.4, phase: 2.6 },
  { url: "/textures/cheering_pink_suit.webp", x: -2.95, z: -3.1, height: 3.4, phase: 0.4 },
  { url: "/textures/simon_presenting.webp", x: 3.35, z: -4.0, height: 3.4, flip: true, phase: 1.5 },
  { url: "/textures/cheering_gray_suit.webp", x: 4.1, z: -3.0, height: 3.4, flip: true, phase: 2.9 },

  // near — these blow out past the frame edges as the camera pushes in
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
    // tiny bob + shoulder rock; reads as applause without animating the texture
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

// ─────────────────────────────────────────────────────────────
// 4. SCROLL-DRIVEN CAMERA DOLLY
//    The push-in is the whole point of the section. It runs across
//    the entire track, including while the star wipe is still opening.
// ─────────────────────────────────────────────────────────────

const CAM_START_Z = 11.2;
const CAM_END_Z = 2.4;

function StageCamera({ progressRef }: { progressRef: React.MutableRefObject<number> }) {
  const { camera } = useThree();
  const { getMouse } = useSpringMouse();

  useFrame((_, delta) => {
    const p = progressRef.current;
    // ease-out so the dolly decelerates as it lands
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
// 5. STAR PATH + COVERAGE MATH
// ─────────────────────────────────────────────────────────────

const STAR_PATH_D =
  "M 0,-100 L 26.45,-36.41 L 95.11,-30.90 L 42.80,13.91 L 58.78,80.90 L 0,45.00 L -58.78,80.90 L -42.80,13.91 L -95.11,-30.90 L -26.45,-36.41 Z";

/**
 * Coverage is governed by the star's CONCAVE vertices, not its points.
 * In STAR_PATH_D those sit at r = 45. Scaling against the outer radius
 * (100) is why the corners leaked in the broken build.
 */
const STAR_INNER_R = 45;
const COVER_SAFETY = 1.14; // margin for the rotation sweeping the notches

// ─────────────────────────────────────────────────────────────
// 6. THE TRANSITION
// ─────────────────────────────────────────────────────────────

export function GoldenTieScene({ onOpenCal }: { onOpenCal?: () => void }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const clipPathRef = useRef<SVGPathElement>(null);
  const strokePathRef = useRef<SVGPathElement>(null);
  const section1TextRef = useRef<HTMLDivElement>(null);
  const section2WrapperRef = useRef<HTMLDivElement>(null);
  const section2TextRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });

  const starCascadeProgressRef = useRef(0);
  const stageProgressRef = useRef(0);
  const lastProgress = useRef(0);

  useEffect(() => {
    const updateWipe = (progress: number) => {
      lastProgress.current = progress;
      starCascadeProgressRef.current = progress;

      if (!clipPathRef.current || !strokePathRef.current || !section2WrapperRef.current) return;

      const w = window.innerWidth;
      const h = window.innerHeight;

      // Origin sits low-left of centre, matching the reference.
      const originX = w * 0.38;
      const originY = h * 0.6;

      const maxDist = Math.max(
        Math.hypot(originX, originY),
        Math.hypot(w - originX, originY),
        Math.hypot(originX, h - originY),
        Math.hypot(w - originX, h - originY)
      );
      const finalScale = (maxDist / STAR_INNER_R) * COVER_SAFETY;

      // The camera dolly runs across the WHOLE track so the crowd is already
      // growing while the star is still opening.
      stageProgressRef.current = progress;

      if (progress <= 0.08) {
        clipPathRef.current.setAttribute("transform", `translate(${originX}, ${originY}) scale(0.0001)`);
        strokePathRef.current.setAttribute("transform", `translate(${originX}, ${originY}) scale(0.0001)`);
        strokePathRef.current.style.opacity = "0";
        if (section1TextRef.current) section1TextRef.current.style.opacity = "1";
        if (section2TextRef.current) section2TextRef.current.style.opacity = "0";
        section2WrapperRef.current.style.pointerEvents = "none";
        section2WrapperRef.current.style.visibility = "hidden";
        return;
      }

      section2WrapperRef.current.style.visibility = "visible";

      // Wipe occupies 0.08 → 0.46. Everything after that is HELD, pinned,
      // with the camera still pushing in. The broken build ran the wipe to
      // 0.98, so the stage unpinned the instant it finished.
      const t = clamp01((progress - 0.08) / 0.38);
      const eased = t * t * (3.0 - 2.0 * t);
      const scale = 0.04 + eased * finalScale;
      const rot = eased * 28;

      const transformStr = `translate(${originX}, ${originY}) scale(${scale}) rotate(${rot})`;
      clipPathRef.current.setAttribute("transform", transformStr);
      strokePathRef.current.setAttribute("transform", transformStr);

      // Section-1 headline stays FULLY OPAQUE until the star has nearly
      // swallowed the frame, then snaps out. Fading it linearly from t=0
      // (the old behaviour) kills the moment before it lands.
      if (section1TextRef.current) {
        section1TextRef.current.style.opacity = String(1 - smoothstep(0.8, 0.99, t));
      }
      if (section2TextRef.current) {
        section2TextRef.current.style.opacity = String(smoothstep(0.72, 0.95, t));
      }

      strokePathRef.current.style.opacity = eased >= 0.93 ? "0" : "1";
      section2WrapperRef.current.style.pointerEvents = t >= 0.99 ? "auto" : "none";
    };

    const onResize = () => updateWipe(lastProgress.current);
    window.addEventListener("resize", onResize);
    const unsub = scrollYProgress.on("change", updateWipe);
    updateWipe(scrollYProgress.get());

    return () => {
      window.removeEventListener("resize", onResize);
      unsub();
    };
  }, [scrollYProgress]);

  return (
    <div
      ref={trackRef}
      aria-label="Still Not Convinced to Golden Tie star wipe"
      className="relative w-full select-none"
      style={{ height: "320dvh" }}
    >
      <div className="sticky top-0 w-full overflow-hidden" style={{ height: "100dvh" }}>
        {/* CLIP-PATH DEF */}
        <svg width="0" height="0" className="absolute pointer-events-none" aria-hidden="true">
          <defs>
            <clipPath id="star-wipe-clip" clipPathUnits="userSpaceOnUse">
              <path ref={clipPathRef} d={STAR_PATH_D} />
            </clipPath>
            <linearGradient id="star-bevel" x1="0" y1="0" x2="0.6" y2="1">
              <stop offset="0%" stopColor="#f2dd93" />
              <stop offset="45%" stopColor="#a68a33" />
              <stop offset="100%" stopColor="#6d5a1c" />
            </linearGradient>
          </defs>
        </svg>

        {/* LAYER 1 — SECTION 1 BACKDROP (visible outside the star) */}
        <div
          className="absolute inset-0 w-full h-full overflow-hidden z-10"
          style={{
            background:
              "radial-gradient(ellipse 120% 88% at 50% 22%, #030206 0%, #070513 42%, #11093a 74%, #1b0e55 100%)",
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

        {/* LAYER 2 — THE STAGE, REVEALED THROUGH THE STAR MASK */}
        <div
          ref={section2WrapperRef}
          className="absolute inset-0 w-full h-full overflow-hidden z-20"
          style={{
            background: "#000000", // pure black, per the reference
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

          {/* stage floor falloff */}
          <div
            className="absolute inset-x-0 bottom-0 h-1/3 pointer-events-none"
            style={{ background: "linear-gradient(to top, #000 8%, transparent 100%)" }}
          />
        </div>

        {/* STAR STROKE — beveled gold edge, sits behind the headline */}
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
            strokeWidth="14"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            style={{ opacity: 0, filter: "drop-shadow(0 0 14px rgba(200, 166, 77, 0.45))" }}
          />
        </svg>

        {/* SECTION 2 HEADLINE — DOM, above the canvas */}
        <div
          ref={section2TextRef}
          className="absolute inset-x-0 top-0 flex flex-col items-center text-center px-6 pointer-events-none"
          style={{ zIndex: 24, opacity: 0, paddingTop: "clamp(88px, 11vh, 150px)" }}
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
              className="pointer-events-auto mt-8 px-9 py-4 rounded-full bg-gradient-to-r from-[#e5c158] to-[#fce881] hover:from-[#fce881] hover:to-[#fff09e] text-black font-stix font-semibold text-lg shadow-[0_0_30px_rgba(229,193,88,0.5)] transition-transform hover:scale-105 active:scale-95"
            >
              Take the tie-break: book a call
            </button>
          )}
        </div>

        {/* SECTION 1 HEADLINE — top of the stack, stays crisp through the wipe */}
        <div
          ref={section1TextRef}
          className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 pointer-events-none"
          style={{ zIndex: 25 }}
        >
          <div className="max-w-4xl mx-auto flex flex-col items-center justify-center px-4">
            <h2
              className="font-stix leading-[1.08] tracking-[-0.015em]"
              style={{
                fontSize: "clamp(42px, 6.2vw, 90px)",
                fontWeight: 400,
                color: "#F5F0E6",
                textShadow: "0 0 8px #E0A868, 0 0 20px #B5713A, 0 0 45px rgba(181, 113, 58, 0.6)",
              }}
            >
              Still Not Convinced We&apos;re Serious About Business?
            </h2>
            <p
              className="font-stix text-[#F0E6D2] text-base sm:text-lg md:text-xl mt-6 sm:mt-8 tracking-wide"
              style={{ textShadow: "0 0 16px rgba(224, 168, 104, 0.45)" }}
            >
              We&apos;ve got one last trick up our sleeve.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
