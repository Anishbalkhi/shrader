"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * GLGridFloor — a perspective wireframe grid floor, the signature element
 * from jesperlandberg.com. A fixed WebGL canvas sitting at z-index: 1
 * (above background, below the filmstrip which is z-index: 10+).
 *
 * Technique: large PlaneGeometry rotated -90° on X, rendered as LineSegments
 * with a custom vertex shader that applies distance-based alpha fade so
 * grid lines dissolve at the horizon.
 */
export function GLAmbient() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "low-power",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

    const scene = new THREE.Scene();

    // Slight perspective — FOV 55, camera pulled back and up a touch
    const camera = new THREE.PerspectiveCamera(
      55,
      window.innerWidth / window.innerHeight,
      0.1,
      200
    );
    camera.position.set(0, 2.2, 7);
    camera.lookAt(0, -1.5, -6);

    // ── Perspective grid ─────────────────────────────────────────────────
    // Large subdivided plane, oriented as the floor
    const GRID_SIZE = 60;
    const GRID_DIVS = 36;
    const gridGeo = new THREE.PlaneGeometry(GRID_SIZE, GRID_SIZE, GRID_DIVS, GRID_DIVS);

    // Convert to wireframe line segments
    const wireGeo = new THREE.WireframeGeometry(gridGeo);

    // Custom shader material with distance-based fade
    const gridMat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uFogNear: { value: 4 },
        uFogFar: { value: 28 },
        uColor: { value: new THREE.Color(0x1a2a3a) },
      },
      vertexShader: `
        varying float vDist;
        void main() {
          vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mvPos;
          // Distance from camera in world space
          vDist = length(mvPos.xyz);
        }
      `,
      fragmentShader: `
        uniform float uFogNear;
        uniform float uFogFar;
        uniform vec3 uColor;
        varying float vDist;
        void main() {
          float fog = 1.0 - smoothstep(uFogNear, uFogFar, vDist);
          fog = pow(fog, 1.6);
          gl_FragColor = vec4(uColor, fog * 0.55);
        }
      `,
      transparent: true,
      depthWrite: false,
    });

    const grid = new THREE.LineSegments(wireGeo, gridMat);
    // Rotate to lie flat as floor, push down
    grid.rotation.x = -Math.PI / 2;
    grid.position.y = -2.8;
    scene.add(grid);

    // ── Horizon fog gradient overlay ─────────────────────────────────────
    // A large quad filling the bottom half of the screen, gradient black
    const fogGeo = new THREE.PlaneGeometry(2, 2);
    const fogMat = new THREE.ShaderMaterial({
      uniforms: {},
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position.xy, 0.0, 1.0);
        }
      `,
      fragmentShader: `
        varying vec2 vUv;
        void main() {
          // Only affect the bottom 55% of screen — darken toward center
          float y = vUv.y;
          float alpha = (1.0 - smoothstep(0.35, 0.72, y)) * 0.72;
          gl_FragColor = vec4(0.0, 0.0, 0.0, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      depthTest: false,
    });
    const fogOverlay = new THREE.Mesh(fogGeo, fogMat);
    // Render this in a separate scene so it's always on top of the grid
    const overlayScene = new THREE.Scene();
    const overlayCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    overlayScene.add(fogOverlay);

    const resize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    };
    resize();
    window.addEventListener("resize", resize);

    const clock = new THREE.Clock();
    let rafId: number;

    const tick = () => {
      const t = clock.getElapsedTime();
      gridMat.uniforms.uTime.value = t;

      renderer.autoClear = true;
      renderer.render(scene, camera);
      renderer.autoClear = false;
      renderer.render(overlayScene, overlayCamera);

      rafId = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      gridGeo.dispose();
      wireGeo.dispose();
      gridMat.dispose();
      fogGeo.dispose();
      fogMat.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 1 }}
      aria-hidden="true"
    >
      <canvas
        ref={canvasRef}
        style={{ display: "block", width: "100%", height: "100%" }}
      />
    </div>
  );
}
