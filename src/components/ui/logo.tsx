"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

// Brand colors
const COLORS = {
  bg: "#08080c",
  cyan: "#00f5d4",
  violet: "#8b5cf6",
  pink: "#ec4899",
};

// Wireframe geometry vertices
const CUBE_VERTICES = [
  [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
  [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1],
];
const CUBE_EDGES = [
  [0, 1], [1, 2], [2, 3], [3, 0],
  [4, 5], [5, 6], [6, 7], [7, 4],
  [0, 4], [1, 5], [2, 6], [3, 7],
];

const PYRAMID_VERTICES = [
  [0, -1.2, 0], [-1, 0.8, -1], [1, 0.8, -1], [1, 0.8, 1], [-1, 0.8, 1],
];
const PYRAMID_EDGES = [
  [0, 1], [0, 2], [0, 3], [0, 4],
  [1, 2], [2, 3], [3, 4], [4, 1],
];

interface Wireframe {
  id: number;
  x: number;
  y: number;
  z: number;
  rotationX: number;
  rotationY: number;
  rotationZ: number;
  speedX: number;
  speedY: number;
  speedZ: number;
  type: "cube" | "pyramid";
  scale: number;
  color: string;
}

function rotatePoint(
  point: number[],
  rx: number,
  ry: number,
  rz: number
): number[] {
  let [x, y, z] = point;

  // Rotate X
  const cosX = Math.cos(rx);
  const sinX = Math.sin(rx);
  const y1 = y * cosX - z * sinX;
  const z1 = y * sinX + z * cosX;
  y = y1;
  z = z1;

  // Rotate Y
  const cosY = Math.cos(ry);
  const sinY = Math.sin(ry);
  const x1 = x * cosY + z * sinY;
  const z2 = -x * sinY + z * cosY;
  x = x1;
  z = z2;

  // Rotate Z
  const cosZ = Math.cos(rz);
  const sinZ = Math.sin(rz);
  const x2 = x * cosZ - y * sinZ;
  const y2 = x * sinZ + y * cosZ;

  return [x2, y2, z];
}

function WireframeCanvas({
  mouseX,
  mouseY,
}: {
  mouseX: number;
  mouseY: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wireframesRef = useRef<Wireframe[]>([]);
  const animationRef = useRef<number>();

  useEffect(() => {
    const wireframes: Wireframe[] = [];
    const colors = [COLORS.cyan, COLORS.violet, COLORS.pink];

    for (let i = 0; i < 8; i++) {
      wireframes.push({
        id: i,
        x: (Math.random() - 0.5) * 600,
        y: (Math.random() - 0.5) * 400,
        z: Math.random() * 200 + 100,
        rotationX: Math.random() * Math.PI * 2,
        rotationY: Math.random() * Math.PI * 2,
        rotationZ: Math.random() * Math.PI * 2,
        speedX: (Math.random() - 0.5) * 0.003,
        speedY: (Math.random() - 0.5) * 0.003,
        speedZ: (Math.random() - 0.5) * 0.002,
        type: Math.random() > 0.5 ? "cube" : "pyramid",
        scale: 15 + Math.random() * 20,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
    wireframesRef.current = wireframes;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const animate = () => {
      ctx.clearRect(0, 0, rect.width, rect.height);

      // Parallax offset based on mouse
      const parallaxX = (mouseX - centerX) * 0.02;
      const parallaxY = (mouseY - centerY) * 0.02;

      wireframesRef.current.forEach((wf) => {
        wf.rotationX += wf.speedX;
        wf.rotationY += wf.speedY;
        wf.rotationZ += wf.speedZ;

        const vertices = wf.type === "cube" ? CUBE_VERTICES : PYRAMID_VERTICES;
        const edges = wf.type === "cube" ? CUBE_EDGES : PYRAMID_EDGES;

        const projectedVertices = vertices.map((v) => {
          const rotated = rotatePoint(
            v,
            wf.rotationX,
            wf.rotationY,
            wf.rotationZ
          );
          const scale = 300 / (300 + wf.z);
          const parallaxFactor = 1 - wf.z / 400;

          return {
            x:
              centerX +
              wf.x +
              rotated[0] * wf.scale * scale +
              parallaxX * parallaxFactor,
            y:
              centerY +
              wf.y +
              rotated[1] * wf.scale * scale +
              parallaxY * parallaxFactor,
          };
        });

        // Calculate distance from mouse to wireframe center
        const wfCenterX = centerX + wf.x + parallaxX * (1 - wf.z / 400);
        const wfCenterY = centerY + wf.y + parallaxY * (1 - wf.z / 400);
        const distToMouse = Math.sqrt(
          Math.pow(mouseX - wfCenterX, 2) + Math.pow(mouseY - wfCenterY, 2)
        );
        const proximityBoost = Math.max(0, 1 - distToMouse / 200) * 0.15;

        // Depth-based opacity
        const baseOpacity = 0.08 + (1 - wf.z / 300) * 0.07;
        const opacity = Math.min(0.3, baseOpacity + proximityBoost);

        ctx.strokeStyle = wf.color;
        ctx.globalAlpha = opacity;
        ctx.lineWidth = 1;
        ctx.beginPath();

        edges.forEach(([start, end]) => {
          const p1 = projectedVertices[start];
          const p2 = projectedVertices[end];
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
        });

        ctx.stroke();
      });

      ctx.globalAlpha = 1;
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [mouseX, mouseY]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  );
}

interface GlitchTextProps {
  text: string;
  suffix?: string;
  isHovered: boolean;
  glitchIntensity: number;
}

function GlitchText({ text, suffix, isHovered, glitchIntensity }: GlitchTextProps) {
  const intensity = isHovered ? 8 : glitchIntensity * 4;

  return (
    <span className="relative inline-block select-none">
      {/* Cyan layer */}
      <span
        className="absolute inset-0 text-transparent"
        style={{
          WebkitTextStroke: `1px ${COLORS.cyan}`,
          transform: `translateX(${-intensity}px)`,
          opacity: glitchIntensity > 0 || isHovered ? 0.7 : 0,
          transition: isHovered ? "none" : "opacity 0.1s",
          clipPath:
            glitchIntensity > 0 || isHovered
              ? `polygon(0 ${30 + Math.random() * 20}%, 100% ${30 + Math.random() * 20}%, 100% ${60 + Math.random() * 20}%, 0 ${60 + Math.random() * 20}%)`
              : "none",
        }}
      >
        {text}
        {suffix && <span>{suffix}</span>}
      </span>

      {/* Pink layer */}
      <span
        className="absolute inset-0 text-transparent"
        style={{
          WebkitTextStroke: `1px ${COLORS.pink}`,
          transform: `translateX(${intensity}px)`,
          opacity: glitchIntensity > 0 || isHovered ? 0.7 : 0,
          transition: isHovered ? "none" : "opacity 0.1s",
          clipPath:
            glitchIntensity > 0 || isHovered
              ? `polygon(0 ${10 + Math.random() * 20}%, 100% ${10 + Math.random() * 20}%, 100% ${40 + Math.random() * 20}%, 0 ${40 + Math.random() * 20}%)`
              : "none",
        }}
      >
        {text}
        {suffix && <span>{suffix}</span>}
      </span>

      {/* Main text */}
      <span
        className="relative"
        style={{
          color: "white",
          textShadow: isHovered
            ? `0 0 20px ${COLORS.pink}, 0 0 40px ${COLORS.violet}40`
            : `0 0 10px ${COLORS.violet}40`,
          transform: glitchIntensity > 0 ? `translateX(${(Math.random() - 0.5) * 3}px)` : "none",
        }}
      >
        {text}
        {suffix && (
          <span style={{ color: COLORS.cyan }}>{suffix}</span>
        )}
      </span>
    </span>
  );
}

export function HickupLogo({ className = "" }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [glitchIntensity, setGlitchIntensity] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Idle micro-glitch
  useEffect(() => {
    const triggerGlitch = () => {
      setGlitchIntensity(1);
      setTimeout(() => setGlitchIntensity(0), 100 + Math.random() * 100);
    };

    const scheduleNextGlitch = () => {
      const delay = 3000 + Math.random() * 2000;
      return setTimeout(() => {
        if (!isHovered) triggerGlitch();
        scheduleNextGlitch();
      }, delay);
    };

    const timeout = scheduleNextGlitch();
    return () => clearTimeout(timeout);
  }, [isHovered]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ background: COLORS.bg }}
    >
      <WireframeCanvas mouseX={mousePos.x} mouseY={mousePos.y} />

      <div className="relative z-10 flex items-center justify-center h-full">
        <motion.div
          className="font-bold tracking-tight"
          style={{ fontFamily: "Inter, sans-serif" }}
          animate={{
            scale: isHovered ? 1.02 : 1,
          }}
          transition={{ duration: 0.2 }}
        >
          <span className="text-4xl md:text-6xl lg:text-7xl">
            <GlitchText
              text="Hickup"
              suffix=".xyz"
              isHovered={isHovered}
              glitchIntensity={glitchIntensity}
            />
          </span>
        </motion.div>
      </div>

      {/* Glow overlay on hover */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{
          opacity: isHovered ? 0.15 : 0,
        }}
        style={{
          background: `radial-gradient(circle at ${mousePos.x}px ${mousePos.y}px, ${COLORS.pink}, transparent 50%)`,
        }}
      />
    </div>
  );
}

const NAV_SECTIONS = [
  { id: "adoption", label: "Adoption" },
  { id: "pillars", label: "Infrastructure" },
  { id: "rag-system", label: "RAG" },
  { id: "agent-database", label: "Agents" },
  { id: "agent-email", label: "Email" },
  { id: "philosophy", label: "Philosophy" },
  { id: "contact", label: "Contact" },
];

function NavLink({
  href,
  label,
  isActive,
  progress
}: {
  href: string;
  label: string;
  isActive: boolean;
  progress: number;
}) {
  return (
    <a
      href={href}
      className="relative text-sm transition-colors duration-300"
      style={{
        color: isActive ? "white" : "rgba(255,255,255,0.6)",
        textShadow: isActive
          ? `0 0 20px ${COLORS.cyan}, 0 0 40px ${COLORS.cyan}40, 0 0 60px ${COLORS.violet}30`
          : "none",
      }}
    >
      {label}
      {/* Background track */}
      <div
        className="absolute -bottom-1 left-0 right-0 h-[2px] bg-white/10 rounded-full"
      />
      {/* Progress fill */}
      {isActive && (
        <motion.div
          className="absolute -bottom-1 left-0 h-[2px] rounded-full"
          style={{
            width: `${progress * 100}%`,
            background: `linear-gradient(90deg, ${COLORS.cyan}, ${COLORS.violet})`,
            boxShadow: `0 0 10px ${COLORS.cyan}, 0 0 20px ${COLORS.violet}40`,
          }}
          initial={{ width: 0 }}
          transition={{ duration: 0.1 }}
        />
      )}
    </a>
  );
}

export function HickupHeader() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [glitchIntensity, setGlitchIntensity] = useState(0);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [sectionProgress, setSectionProgress] = useState<Record<string, number>>({});
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const triggerGlitch = () => {
      setGlitchIntensity(1);
      setTimeout(() => setGlitchIntensity(0), 100 + Math.random() * 100);
    };

    const scheduleNextGlitch = () => {
      const delay = 3000 + Math.random() * 2000;
      return setTimeout(() => {
        if (!isHovered) triggerGlitch();
        scheduleNextGlitch();
      }, delay);
    };

    const timeout = scheduleNextGlitch();
    return () => clearTimeout(timeout);
  }, [isHovered]);

  // Scroll spy to detect active section and track progress
  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    NAV_SECTIONS.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) {
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                setActiveSection(id);
              }
            });
          },
          {
            rootMargin: "-40% 0px -40% 0px",
            threshold: 0,
          }
        );

        observer.observe(element);
        observers.push(observer);
      }
    });

    // Scroll handler to calculate progress through each section
    const handleScroll = () => {
      const newProgress: Record<string, number> = {};

      NAV_SECTIONS.forEach(({ id }) => {
        const element = document.getElementById(id);
        if (element) {
          const rect = element.getBoundingClientRect();
          const windowHeight = window.innerHeight;

          // Calculate how much of the section has been scrolled through
          // Section starts entering when top hits bottom of viewport
          // Section fully scrolled when bottom hits top of viewport
          const sectionTop = rect.top;
          const sectionHeight = rect.height;

          // Progress: 0 when section top is at viewport center, 1 when section bottom is at viewport center
          const viewportCenter = windowHeight / 2;
          const scrolledPast = viewportCenter - sectionTop;
          const progress = Math.min(1, Math.max(0, scrolledPast / sectionHeight));

          newProgress[id] = progress;
        }
      });

      setSectionProgress(newProgress);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial call

    return () => {
      observers.forEach((observer) => observer.disconnect());
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!headerRef.current) return;
    const rect = headerRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  }, []);

  return (
    <header
      ref={headerRef}
      className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-white/[0.08]"
      style={{ background: `${COLORS.bg}ee` }}
      onMouseMove={handleMouseMove}
    >
      <div className="absolute inset-0 backdrop-blur-xl" />

      <WireframeCanvas mouseX={mousePos.x} mouseY={mousePos.y} />

      <div className="relative z-10 h-full max-w-6xl mx-auto px-6 flex items-center justify-between">
        <motion.a
          href="/"
          className="font-bold text-xl tracking-tight cursor-pointer"
          style={{ fontFamily: "Inter, sans-serif" }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          whileHover={{ scale: 1.02 }}
        >
          <GlitchText
            text="Hickup"
            suffix=".xyz"
            isHovered={isHovered}
            glitchIntensity={glitchIntensity}
          />
        </motion.a>

        <nav className="hidden md:flex items-center flex-1 justify-evenly max-w-2xl ml-12">
          {NAV_SECTIONS.map(({ id, label }) => (
            <NavLink
              key={id}
              href={`#${id}`}
              label={label}
              isActive={activeSection === id}
              progress={sectionProgress[id] || 0}
            />
          ))}
        </nav>
      </div>
    </header>
  );
}

export default HickupLogo;
