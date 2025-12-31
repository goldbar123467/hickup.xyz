"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useSpring, useMotionValue, AnimatePresence } from "framer-motion";

interface Ripple {
  id: number;
  x: number;
  y: number;
  color: string;
}

interface MagneticButtonProps {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
}

const MAGNETIC_RADIUS = 150;
const MAGNETIC_STRENGTH = 0.35;
const BRAND_COLORS = ["#00f5d4", "#00d4aa", "#8b5cf6", "#ec4899"];

export function MagneticButton({ children, href, onClick }: MagneticButtonProps) {
  const buttonRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [glowIntensity, setGlowIntensity] = useState(0);
  const [rotation, setRotation] = useState(0);
  const rotationSpeed = useRef(1);

  // Spring physics for magnetic effect
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 150, damping: 15 });
  const springY = useSpring(y, { stiffness: 150, damping: 15 });

  // Rotating border animation
  useEffect(() => {
    let animationId: number;

    const animate = () => {
      rotationSpeed.current = isHovered ? 3 : 1;
      setRotation((r) => (r + rotationSpeed.current) % 360);
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [isHovered]);

  // Handle mouse move for magnetic effect
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!buttonRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const distX = e.clientX - centerX;
    const distY = e.clientY - centerY;
    const distance = Math.sqrt(distX * distX + distY * distY);

    if (distance < MAGNETIC_RADIUS) {
      const intensity = 1 - distance / MAGNETIC_RADIUS;
      setGlowIntensity(intensity);
      x.set(distX * MAGNETIC_STRENGTH * intensity);
      y.set(distY * MAGNETIC_STRENGTH * intensity);
    } else {
      setGlowIntensity(0);
      x.set(0);
      y.set(0);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setGlowIntensity(0);
    x.set(0);
    y.set(0);
  };

  const conicGradient = `conic-gradient(from ${rotation}deg, #00f5d4, #00d4aa, #8b5cf6, #ec4899, #8b5cf6, #00d4aa, #00f5d4)`;

  const ButtonContent = (
    <motion.div
      ref={buttonRef}
      className="relative group cursor-pointer"
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      whileTap={{ scale: 0.98 }}
    >
      {/* Layer 1: Radial pulse (ambient presence) */}
      <motion.div
        className="absolute -inset-8 rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, rgba(0,245,212,${0.08 * glowIntensity}) 0%, transparent 70%)`,
        }}
        animate={{
          scale: isHovered ? [1, 1.1, 1] : 1,
          opacity: isHovered ? [0.5, 0.8, 0.5] : 0.3,
        }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Layer 2: Blurred halo (soft glow) */}
      <div
        className="absolute -inset-[2px] rounded-full blur-md pointer-events-none"
        style={{
          background: conicGradient,
          opacity: 0.4 + glowIntensity * 0.4,
        }}
      />

      {/* Layer 3: Sharp rotating gradient border */}
      <div
        className="absolute -inset-[1px] rounded-full pointer-events-none"
        style={{
          background: conicGradient,
          opacity: 0.8 + glowIntensity * 0.2,
        }}
      />

      {/* Floating orbs */}
      {[0, 1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className="absolute w-1.5 h-1.5 rounded-full pointer-events-none"
          style={{
            background: BRAND_COLORS[i],
            boxShadow: `0 0 8px ${BRAND_COLORS[i]}`,
            left: `${20 + i * 20}%`,
            top: i % 2 === 0 ? -8 : "auto",
            bottom: i % 2 === 1 ? -8 : "auto",
          }}
          animate={{
            y: isHovered ? [0, -4, 0] : 0,
            opacity: isHovered ? [0.6, 1, 0.6] : 0.4,
            scale: isHovered ? [1, 1.3, 1] : 1,
          }}
          transition={{
            duration: 1.5 + i * 0.2,
            delay: i * 0.15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Corner accent lines */}
      <svg
        className="absolute -top-3 -left-3 w-6 h-6 pointer-events-none"
        viewBox="0 0 24 24"
      >
        <motion.path
          d="M 0 12 L 0 0 L 12 0"
          stroke="#00f5d4"
          strokeWidth="1"
          fill="none"
          initial={{ pathLength: 0.3, opacity: 0.3 }}
          animate={{
            pathLength: isHovered ? 1 : 0.3,
            opacity: isHovered ? 0.8 : 0.3,
          }}
          transition={{ duration: 0.3 }}
        />
      </svg>
      <svg
        className="absolute -bottom-3 -right-3 w-6 h-6 pointer-events-none rotate-180"
        viewBox="0 0 24 24"
      >
        <motion.path
          d="M 0 12 L 0 0 L 12 0"
          stroke="#ec4899"
          strokeWidth="1"
          fill="none"
          initial={{ pathLength: 0.3, opacity: 0.3 }}
          animate={{
            pathLength: isHovered ? 1 : 0.3,
            opacity: isHovered ? 0.8 : 0.3,
          }}
          transition={{ duration: 0.3 }}
        />
      </svg>

      {/* Glass interior */}
      <div className="relative rounded-full bg-gray-950/90 backdrop-blur-xl px-6 py-3 overflow-hidden">
        {/* Noise texture overlay */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Shimmer highlight */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.1) 45%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.1) 55%, transparent 60%)",
            backgroundSize: "200% 100%",
          }}
          animate={{
            backgroundPosition: isHovered ? ["200% 0", "-200% 0"] : "200% 0",
          }}
          transition={{
            duration: 1.5,
            ease: "easeInOut",
          }}
        />

        {/* Button content */}
        <div className="relative flex items-center gap-3 font-semibold text-white">
          {/* Pulsing dot */}
          <span className="relative flex h-2 w-2">
            <motion.span
              className="absolute inline-flex h-full w-full rounded-full bg-primary"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.7, 0.3, 0.7],
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
          </span>

          {children}

          {/* Animated arrow */}
          <motion.svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            animate={{
              x: isHovered ? [0, 4, 0] : 0,
            }}
            transition={{
              duration: 0.8,
              repeat: isHovered ? Infinity : 0,
              ease: "easeInOut",
            }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 8l4 4m0 0l-4 4m4-4H3"
            />
          </motion.svg>
        </div>
      </div>
    </motion.div>
  );

  if (href) {
    return <a href={href} className="inline-block">{ButtonContent}</a>;
  }

  return <div onClick={onClick} className="inline-block">{ButtonContent}</div>;
}

// Ripple container for the hero section
export function RippleContainer({ children }: { children: React.ReactNode }) {
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastRippleTime = useRef(0);

  const handleMouseMove = (e: React.MouseEvent) => {
    const now = Date.now();
    // Throttle to ~30% of mouse events
    if (now - lastRippleTime.current < 150) return;

    // Only spawn 30% of the time
    if (Math.random() > 0.3) return;

    lastRippleTime.current = now;

    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();

    const ripple: Ripple = {
      id: now,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      color: BRAND_COLORS[Math.floor(Math.random() * BRAND_COLORS.length)],
    };

    setRipples((prev) => [...prev.slice(-8), ripple]);
  };

  const removeRipple = (id: number) => {
    setRipples((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseMove={handleMouseMove}
    >
      {/* Ripple layer */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <AnimatePresence>
          {ripples.map((ripple) => (
            <motion.div
              key={ripple.id}
              className="absolute rounded-full pointer-events-none"
              style={{
                left: ripple.x,
                top: ripple.y,
                width: 0,
                height: 0,
                border: `1px solid ${ripple.color}`,
                boxShadow: `0 0 10px ${ripple.color}40`,
              }}
              initial={{
                width: 0,
                height: 0,
                x: 0,
                y: 0,
                opacity: 0.6
              }}
              animate={{
                width: 100,
                height: 100,
                x: -50,
                y: -50,
                opacity: 0
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              onAnimationComplete={() => removeRipple(ripple.id)}
            />
          ))}
        </AnimatePresence>
      </div>

      {children}
    </div>
  );
}
