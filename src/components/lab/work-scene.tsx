"use client";

import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { ContactShadows, Html, OrbitControls } from "@react-three/drei";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ComponentType,
  type RefObject,
} from "react";
import * as THREE from "three";
import { caseStudies } from "@/content/work";
import { ChartModel, PlaneModel, ScreenModel, StarModel } from "./models";
import { detectQualityTier, qualitySettings, readSavedTier, saveTier, type QualityTier } from "./quality";

const MODELS: Record<string, { Model: ComponentType; height: number; short: string }> = {
  "lego-hero-stories": { Model: StarModel, height: 1.65, short: "LEGO" },
  "sita-mission-watch": { Model: PlaneModel, height: 1.3, short: "SITA" },
  "rbc-riskhub": { Model: ChartModel, height: 1.6, short: "RBC" },
  "pgl-live-graphics": { Model: ScreenModel, height: 1.7, short: "PGL" },
};

const spots = caseStudies.filter((study) => study.slug in MODELS).map((study) => ({ ...study, ...MODELS[study.slug] }));
type Spot = (typeof spots)[number];

const WIDE_LAYOUT: [number, number, number][] = [
  [-3.3, 0, 0],
  [-1.1, 0, -0.6],
  [1.1, 0, -0.6],
  [3.3, 0, 0],
];
const NARROW_LAYOUT: [number, number, number][] = [
  [-1.5, 0, -1.8],
  [1.5, 0, -1.8],
  [-1.5, 0, 1.6],
  [1.5, 0, 1.6],
];
const FOV = 40;
const QUALITY_LABELS: Record<QualityTier, string> = { low: "Low", medium: "Medium", high: "High" };

function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (onChange) => {
      const media = window.matchMedia(query);
      media.addEventListener("change", onChange);
      return () => media.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

function hasWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

type Goal = { position: THREE.Vector3; target: THREE.Vector3 };

// Eases the camera towards the goal, then hands control back to the user.
function CameraRig({ goal, motion }: { goal: Goal; motion: boolean }) {
  const camera = useThree((state) => state.camera);
  const controls = useThree((state) => state.controls) as (THREE.EventDispatcher & { target: THREE.Vector3; update: () => void }) | null;
  const invalidate = useThree((state) => state.invalidate);
  const animating = useRef(true);
  const lookAt = useRef(goal.target.clone());

  useEffect(() => {
    animating.current = true;
    invalidate();
  }, [goal, invalidate]);

  // Dragging the scene cancels the fly-to
  useEffect(() => {
    if (!controls) return;
    const stop = () => {
      animating.current = false;
    };
    controls.addEventListener("start" as never, stop);
    return () => controls.removeEventListener("start" as never, stop);
  }, [controls]);

  useFrame((_, delta) => {
    if (!animating.current) return;
    const k = motion ? 1 - Math.exp(-4 * delta) : 1;
    const target = controls?.target ?? lookAt.current;
    camera.position.lerp(goal.position, k);
    target.lerp(goal.target, k);
    if (controls) controls.update();
    else camera.lookAt(target);

    const done = camera.position.distanceTo(goal.position) < 0.01 && target.distanceTo(goal.target) < 0.01;
    if (done) animating.current = false;
    else invalidate();
  });

  return null;
}

function StatsProbe({ onStats }: { onStats: (stats: { calls: number; dpr: number }) => void }) {
  const gl = useThree((state) => state.gl);
  useEffect(() => {
    const id = window.setInterval(() => onStats({ calls: gl.info.render.calls, dpr: gl.getPixelRatio() }), 1000);
    return () => window.clearInterval(id);
  }, [gl, onStats]);
  return null;
}

type SpotProps = {
  spot: Spot;
  index: number;
  position: [number, number, number];
  highlighted: boolean;
  selected: boolean;
  compact: boolean;
  // While zoomed in, focusing another hotspot flies to it so focus never lands off screen
  followFocus: boolean;
  motion: boolean;
  onSelect: (slug: string) => void;
  onHover: (slug: string | null) => void;
  buttonRef: (el: HTMLButtonElement | null) => void;
  overlay: RefObject<HTMLElement>;
};

function SpotObject({
  spot,
  index,
  position,
  highlighted,
  selected,
  compact,
  followFocus,
  motion,
  onSelect,
  onHover,
  buttonRef,
  overlay,
}: SpotProps) {
  const group = useRef<THREE.Group>(null);
  const invalidate = useThree((state) => state.invalidate);
  const { Model } = spot;

  useEffect(() => invalidate(), [highlighted, invalidate]);

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    const scale = highlighted ? 1.08 : 1;
    if (motion) {
      g.scale.setScalar(THREE.MathUtils.damp(g.scale.x, scale, 8, delta));
      g.rotation.y = Math.sin(state.clock.elapsedTime * 0.5 + index * 1.7) * 0.18;
    } else {
      g.scale.setScalar(scale);
      g.rotation.y = 0;
    }
  });

  const onPointerOver = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    onHover(spot.slug);
    document.body.style.cursor = "pointer";
  };
  const onPointerOut = () => {
    onHover(null);
    document.body.style.cursor = "";
  };

  return (
    <group position={position}>
      <group
        ref={group}
        onClick={(event) => {
          event.stopPropagation();
          onSelect(spot.slug);
        }}
        onPointerOver={onPointerOver}
        onPointerOut={onPointerOut}
      >
        <Model />
      </group>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.005, 0]} visible={highlighted}>
        <ringGeometry args={[0.85, 0.95, 48]} />
        <meshBasicMaterial color="#5cc3d3" transparent opacity={0.9} />
      </mesh>
      <Html position={[0, spot.height + 0.35, 0]} center zIndexRange={[10, 0]} portal={overlay}>
        <button
          ref={buttonRef}
          type="button"
          className={`hotspot${highlighted ? " is-active" : ""}`}
          aria-pressed={selected}
          onClick={() => onSelect(spot.slug)}
          onFocus={() => {
            onHover(spot.slug);
            if (followFocus && !selected) onSelect(spot.slug);
          }}
          onBlur={() => onHover(null)}
          onMouseEnter={() => onHover(spot.slug)}
          onMouseLeave={() => onHover(null)}
          aria-label={compact ? spot.client : undefined}
        >
          {compact ? spot.short : spot.client}
        </button>
      </Html>
    </group>
  );
}

type SceneProps = {
  selected: string | null;
  hovered: string | null;
  motion: boolean;
  controls: boolean;
  dark: boolean;
  onSelect: (slug: string) => void;
  onHover: (slug: string | null) => void;
  buttonRefs: RefObject<Record<string, HTMLButtonElement | null>>;
  overlay: RefObject<HTMLElement>;
  onStats: (stats: { calls: number; dpr: number }) => void;
};

function Scene({ selected, hovered, motion, controls, dark, onSelect, onHover, buttonRefs, overlay, onStats }: SceneProps) {
  const size = useThree((state) => state.size);
  const aspect = size.width / Math.max(size.height, 1);
  const narrow = aspect < 1.05;
  const layout = narrow ? NARROW_LAYOUT : WIDE_LAYOUT;

  const goal = useMemo<Goal>(() => {
    const index = spots.findIndex((spot) => spot.slug === selected);
    if (index >= 0) {
      const [x, y, z] = layout[index];
      return {
        // On narrow screens film from higher up so the front row drops out of frame
        position: new THREE.Vector3(x, y + (narrow ? 4.2 : 1.6), z + (narrow ? 3 : 3.4)),
        target: new THREE.Vector3(x, y + 0.75, z),
      };
    }
    // Fit the whole scene horizontally for the current aspect ratio
    const halfWidth = narrow ? 2.9 : 4.6;
    const tan = Math.tan(THREE.MathUtils.degToRad(FOV / 2));
    const distance = Math.max(halfWidth / (tan * aspect), 6.5);
    // On narrow screens look down from higher up, so the back row stays visible
    return narrow
      ? { position: new THREE.Vector3(0, distance * 0.78, distance * 0.72), target: new THREE.Vector3(0, 0.4, 0) }
      : { position: new THREE.Vector3(0, distance * 0.42, distance), target: new THREE.Vector3(0, 0.8, 0) };
  }, [selected, layout, narrow, aspect]);

  return (
    <>
      <hemisphereLight args={["#ffffff", "#8899a6", 1.1]} />
      <directionalLight position={[4, 8, 6]} intensity={1.6} />

      <mesh rotation-x={-Math.PI / 2}>
        <circleGeometry args={[narrow ? 3.9 : 5.4, 64]} />
        <meshStandardMaterial color={dark ? "#1d2a30" : "#e3ebee"} />
      </mesh>
      <ContactShadows key={narrow ? "narrow" : "wide"} position={[0, 0.002, 0]} opacity={0.35} scale={14} blur={2.4} far={3} frames={1} />

      {spots.map((spot, index) => (
        <SpotObject
          key={spot.slug}
          spot={spot}
          index={index}
          position={layout[index]}
          highlighted={hovered === spot.slug || selected === spot.slug}
          selected={selected === spot.slug}
          compact={narrow}
          followFocus={selected !== null}
          motion={motion}
          onSelect={onSelect}
          onHover={onHover}
          buttonRef={(el) => {
            buttonRefs.current[spot.slug] = el;
          }}
          overlay={overlay}
        />
      ))}

      {controls && (
        <OrbitControls
          makeDefault
          enableZoom={false}
          enablePan={false}
          enableDamping={motion}
          minPolarAngle={0.6}
          maxPolarAngle={1.35}
          minAzimuthAngle={-0.7}
          maxAzimuthAngle={0.7}
        />
      )}
      <CameraRig goal={goal} motion={motion} />
      <StatsProbe onStats={onStats} />
    </>
  );
}

export function WorkScene() {
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const finePointer = useMediaQuery("(pointer: fine)");
  const dark = useMediaQuery("(prefers-color-scheme: dark)");
  const motion = !reducedMotion;

  const [webgl] = useState(hasWebGL);
  const [autoTier] = useState(detectQualityTier);
  const [tier, setTier] = useState<QualityTier>(() => readSavedTier() ?? autoTier);
  const [selected, setSelected] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [visible, setVisible] = useState(true);
  const [stats, setStats] = useState<{ calls: number; dpr: number } | null>(null);
  const stage = useRef<HTMLDivElement>(null);
  // A fixed container for the hotspot buttons, so drei's <Html> never has to move them
  const overlay = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  // Stop rendering entirely while the scene is off screen
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Return focus to the project's hotspot so keyboard users keep their place
  const back = useCallback(() => {
    if (selected) buttonRefs.current[selected]?.focus();
    setSelected(null);
  }, [selected]);

  const chooseTier = (next: QualityTier) => {
    setTier(next);
    saveTier(next);
  };

  const index = spots.findIndex((spot) => spot.slug === selected);
  const current = index >= 0 ? spots[index] : undefined;

  // Step through the projects; from the overview, start at the first or the last one
  const go = (direction: 1 | -1) => {
    const next = index < 0 ? (direction === 1 ? 0 : spots.length - 1) : (index + direction + spots.length) % spots.length;
    setSelected(spots[next].slug);
  };
  const settings = qualitySettings[tier];
  const frameloop = !visible ? "never" : motion ? "always" : "demand";

  if (!webgl) {
    return (
      <div className="lab__panel">
        <p>Your browser can&apos;t display WebGL, so here is the same content without 3D:</p>
        <ul className="case__list">
          {spots.map((spot) => (
            <li key={spot.slug}>
              <Link href={`/work/${spot.slug}`}>
                {spot.client}: {spot.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div
      onKeyDown={(event) => {
        if (event.key === "Escape" && selected) back();
        else if (event.key === "ArrowRight") go(1);
        else if (event.key === "ArrowLeft") go(-1);
        else return;
        event.preventDefault();
      }}
    >
      <p id="lab-instructions" className="visually-hidden">
        Interactive 3D scene with four projects. Use Tab to move between them and Enter to select one, or the left and
        right arrow keys to step through them. Press Escape to return to the overview.
      </p>
      <div ref={stage} className="lab__stage" aria-describedby="lab-instructions">
        <Canvas
          key={tier}
          dpr={settings.dpr}
          gl={{ antialias: settings.antialias, alpha: true, powerPreference: tier === "low" ? "low-power" : "high-performance" }}
          camera={{ fov: FOV, position: [0, 4, 11] }}
          frameloop={frameloop}
        >
          <Scene
            selected={selected}
            hovered={hovered}
            motion={motion}
            controls={finePointer}
            dark={dark}
            onSelect={setSelected}
            onHover={setHovered}
            buttonRefs={buttonRefs}
            overlay={overlay as RefObject<HTMLElement>}
            onStats={setStats}
          />
        </Canvas>
        <div ref={overlay} className="lab__overlay" />

        <div className="lab__nav">
          {current && (
            <button type="button" className="lab__chip lab__overview" onClick={back} aria-label="Back to overview">
              <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true">
                <path d="M3 8V3h5M17 8V3h-5M3 12v5h5M17 12v5h-5" fill="none" stroke="currentColor" strokeWidth="1.8" />
              </svg>
              <span className="lab__overview-label">Overview</span>
            </button>
          )}
          <button type="button" className="lab__arrow" onClick={() => go(-1)} aria-label="Previous project">
            <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true">
              <path d="M12.5 4 6.5 10l6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
          <p className="lab__position" aria-hidden="true">
            {current ? (
              <>
                <span>
                  {index + 1} / {spots.length}
                </span>{" "}
                {current.short}
              </>
            ) : (
              "Overview"
            )}
          </p>
          <button type="button" className="lab__arrow" onClick={() => go(1)} aria-label="Next project">
            <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true">
              <path d="m7.5 4 6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      <div className="lab__toolbar">
        <div className="lab__quality" role="group" aria-label="Rendering quality">
          <span>Quality</span>
          <div className="segmented">
            {(Object.keys(QUALITY_LABELS) as QualityTier[]).map((option) => (
              <button key={option} type="button" aria-pressed={tier === option} onClick={() => chooseTier(option)}>
                {QUALITY_LABELS[option]}
              </button>
            ))}
          </div>
          <span className="lab__auto">Auto-detected: {QUALITY_LABELS[autoTier].toLowerCase()}</span>
        </div>
        <p className="lab__stats">
          {stats ? `Pixel ratio ${stats.dpr} · ${stats.calls} draw calls` : "Measuring…"}
          {reducedMotion && " · reduced motion"}
        </p>
      </div>

      <p className="visually-hidden" aria-live="polite">
        {current ? `Selected ${current.client}: ${current.title}. Press Escape to return to the overview.` : ""}
      </p>

      <div className="lab__panel">
        {current ? (
          <>
            <p className="eyebrow">{current.client}</p>
            <h2>{current.title}</h2>
            <p>{current.summary}</p>
            <div className="actions">
              <Link className="button" href={`/work/${current.slug}`}>
                Read the case study
              </Link>
              <button type="button" className="button button--ghost" onClick={back}>
                Back to overview
              </button>
            </div>
          </>
        ) : (
          <p className="lab__hint">
            Select a project in the scene by clicking or tapping it, or step through them with the arrows (
            <kbd>←</kbd> <kbd>→</kbd> on a keyboard).
            {finePointer && " Drag to look around."}
          </p>
        )}
      </div>
    </div>
  );
}
