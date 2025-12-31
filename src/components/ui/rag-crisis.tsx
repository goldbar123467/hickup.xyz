"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useSpring, useMotionValue } from "framer-motion";

const COLORS = {
  bg: "#08080c",
  cyan: "#00f5d4",
  violet: "#8b5cf6",
  pink: "#ec4899",
  red: "#ef4444",
  green: "#22c55e",
};

const BAD_QUERIES = [
  { q: "What's our refund policy?", a: "The mitochondria is the powerhouse of the cell..." },
  { q: "How do I reset my password?", a: "According to Q3 earnings, revenue increased by..." },
  { q: "What are the shipping options?", a: "def calculate_tax(amount): return amount * 0.08" },
  { q: "When does support close?", a: "The French Revolution began in 1789 when..." },
];

const GOOD_QUERIES = [
  { q: "What's our refund policy?", a: "Full refund within 30 days, no questions asked. After 30 days, store credit only." },
  { q: "How do I reset my password?", a: "Click 'Forgot Password' on login page. Check email for reset link. Link expires in 24h." },
  { q: "What are the shipping options?", a: "Standard (5-7 days, free), Express (2-3 days, $12), Overnight ($25)." },
  { q: "When does support close?", a: "Live chat: 24/7. Phone support: 9am-6pm EST, Mon-Fri." },
];

function GlitchText({ text, intensity = 1 }: { text: string; intensity?: number }) {
  const [glitchOffset, setGlitchOffset] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setGlitchOffset(Math.random() * intensity * 3);
    }, 50);
    return () => clearInterval(interval);
  }, [intensity]);

  return (
    <span className="relative">
      <span
        className="absolute text-red-500/50"
        style={{ transform: `translateX(${-glitchOffset}px)` }}
      >
        {text}
      </span>
      <span
        className="absolute text-cyan-500/50"
        style={{ transform: `translateX(${glitchOffset}px)` }}
      >
        {text}
      </span>
      <span className="relative">{text}</span>
    </span>
  );
}

function Terminal({
  queries,
  isGlitchy,
  currentIndex,
}: {
  queries: typeof BAD_QUERIES;
  isGlitchy: boolean;
  currentIndex: number;
}) {
  return (
    <div
      className={`rounded-lg border overflow-hidden transition-all duration-500 ${
        isGlitchy
          ? "border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.3)]"
          : "border-cyan-500/50 shadow-[0_0_30px_rgba(0,245,212,0.3)]"
      }`}
      style={{ background: `${COLORS.bg}` }}
    >
      {/* Terminal header */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-white/10 bg-white/5">
        <div className={`w-3 h-3 rounded-full ${isGlitchy ? "bg-red-500" : "bg-green-500"}`} />
        <div className="w-3 h-3 rounded-full bg-yellow-500" />
        <div className="w-3 h-3 rounded-full bg-green-500" />
        <span className="ml-2 text-xs text-white/40 font-mono">rag-system.terminal</span>
      </div>

      {/* Terminal content */}
      <div className="p-4 font-mono text-sm space-y-3 min-h-[200px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${isGlitchy}-${currentIndex}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-start gap-2">
              <span className="text-cyan-400">Q:</span>
              <span className="text-white/80">{queries[currentIndex].q}</span>
            </div>
            <div className="flex items-start gap-2 mt-2">
              <span className={isGlitchy ? "text-red-400" : "text-green-400"}>A:</span>
              <span className={isGlitchy ? "text-white/60" : "text-white/80"}>
                {isGlitchy ? (
                  <GlitchText text={queries[currentIndex].a} />
                ) : (
                  queries[currentIndex].a
                )}
              </span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function HallucinationBadge({ visible }: { visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="absolute -top-3 -right-3 z-10"
        >
          <motion.div
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 0.5, repeat: Infinity }}
            className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full shadow-[0_0_20px_rgba(239,68,68,0.5)]"
          >
            HALLUCINATION DETECTED
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function QualityGateBadge({ visible }: { visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="absolute -top-3 -right-3 z-10"
        >
          <div className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full shadow-[0_0_20px_rgba(34,197,94,0.5)]">
            QUALITY VERIFIED
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function TrustScore({ score, isDecaying }: { score: number; isDecaying: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-white/60 text-sm font-mono">Trust score:</span>
      <motion.span
        key={score}
        initial={{ scale: 1.2 }}
        animate={{ scale: 1 }}
        className={`text-2xl font-bold font-mono ${
          isDecaying ? "text-red-400" : "text-green-400"
        }`}
      >
        {score}%
      </motion.span>
      {isDecaying && (
        <motion.span
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 0.3, repeat: Infinity }}
          className="text-red-400 text-sm"
        >
          ▼
        </motion.span>
      )}
      {!isDecaying && (
        <motion.span
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          className="text-green-400 text-sm"
        >
          ▲
        </motion.span>
      )}
    </div>
  );
}

function FallingBlocks({ isReversed }: { isReversed: boolean }) {
  const blocks = [
    { label: "Customer churn", delay: 0 },
    { label: "Wrong decisions", delay: 0.1 },
    { label: "Wasted compute", delay: 0.2 },
    { label: "Lost trust", delay: 0.3 },
    { label: "Bad data", delay: 0.4 },
  ];

  return (
    <div className="relative h-48 overflow-hidden">
      <AnimatePresence mode="wait">
        {!isReversed ? (
          <motion.div
            key="falling"
            className="absolute inset-0 flex flex-col items-center justify-end gap-2"
          >
            {blocks.map((block, i) => (
              <motion.div
                key={block.label}
                initial={{ y: -200, opacity: 0, rotate: Math.random() * 20 - 10 }}
                animate={{ y: 0, opacity: 1, rotate: 0 }}
                transition={{
                  delay: block.delay,
                  duration: 0.5,
                  type: "spring",
                  stiffness: 100,
                }}
                className="px-4 py-2 bg-red-500/20 border border-red-500/50 rounded text-red-400 text-sm font-mono"
              >
                {block.label}
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="rising"
            className="absolute inset-0 flex flex-col items-center justify-center gap-2"
          >
            {blocks.reverse().map((block, i) => (
              <motion.div
                key={block.label}
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: -200, opacity: 0 }}
                transition={{
                  delay: i * 0.1,
                  duration: 0.8,
                }}
                className="px-4 py-2 bg-red-500/20 border border-red-500/50 rounded text-red-400 text-sm font-mono"
              >
                {block.label}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function QualityGate({ active }: { active: boolean }) {
  const [rejectedChunks, setRejectedChunks] = useState<number[]>([]);

  useEffect(() => {
    if (!active) {
      setRejectedChunks([]);
      return;
    }

    const interval = setInterval(() => {
      setRejectedChunks((prev) => [...prev.slice(-5), Date.now()]);
    }, 800);

    return () => clearInterval(interval);
  }, [active]);

  return (
    <div className="relative h-48 flex items-center justify-center">
      {/* Shield */}
      <motion.div
        animate={active ? { scale: [1, 1.05, 1], opacity: 1 } : { opacity: 0.3 }}
        transition={{ duration: 1, repeat: active ? Infinity : 0 }}
        className="relative"
      >
        <div
          className="w-24 h-28 rounded-b-full border-4 border-cyan-500 flex items-center justify-center"
          style={{
            background: active
              ? "linear-gradient(180deg, rgba(0,245,212,0.2) 0%, rgba(139,92,246,0.2) 100%)"
              : "transparent",
            boxShadow: active ? `0 0 40px ${COLORS.cyan}40` : "none",
          }}
        >
          {/* Shield icon SVG */}
          <svg
            className="w-10 h-10"
            viewBox="0 0 24 24"
            fill="none"
            stroke={COLORS.cyan}
            strokeWidth="1.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
            />
          </svg>
        </div>
      </motion.div>

      {/* Bouncing chunks */}
      <AnimatePresence>
        {rejectedChunks.map((id) => (
          <motion.div
            key={id}
            initial={{ x: -100, y: 0, opacity: 1 }}
            animate={{ x: -150, y: [0, -30, 60], opacity: 0, rotate: 45 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute left-1/2 top-1/2 -translate-y-1/2"
          >
            <div className="px-2 py-1 bg-red-500/30 border border-red-500 rounded text-xs text-red-400">
              bad chunk
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function FeedbackLoop({ active }: { active: boolean }) {
  return (
    <div className="relative h-48 flex items-center justify-center">
      <svg className="w-40 h-40" viewBox="0 0 100 100">
        {/* Circular path */}
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="2"
        />

        {/* Animated gradient arc */}
        {active && (
          <motion.circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="url(#loopGradient)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="60 200"
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            style={{ transformOrigin: "center" }}
          />
        )}

        <defs>
          <linearGradient id="loopGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={COLORS.cyan} />
            <stop offset="100%" stopColor={COLORS.violet} />
          </linearGradient>
        </defs>
      </svg>

      {/* Labels */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 text-xs text-cyan-400 font-mono">
        retrieval
      </div>
      <div className="absolute right-0 top-1/2 -translate-y-1/2 text-xs text-violet-400 font-mono">
        quality
      </div>
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-xs text-pink-400 font-mono">
        training
      </div>
      <div className="absolute left-0 top-1/2 -translate-y-1/2 text-xs text-cyan-400 font-mono">
        improve
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  unit,
  delay,
  color,
}: {
  label: string;
  value: number;
  unit: string;
  delay: number;
  color: string;
}) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    let step = 0;

    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        step++;
        current = Math.min(value, increment * step);
        setDisplayValue(Math.round(current * 10) / 10);

        if (step >= steps) {
          clearInterval(interval);
          setDisplayValue(value);
        }
      }, duration / steps);

      return () => clearInterval(interval);
    }, delay * 1000);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="glass rounded-xl p-6 text-center"
      style={{
        boxShadow: `0 0 30px ${color}20`,
        borderColor: `${color}30`,
      }}
    >
      <div
        className="text-4xl font-bold font-mono mb-2"
        style={{ color }}
      >
        {displayValue}
        {unit}
      </div>
      <div className="text-white/60 text-sm">{label}</div>
    </motion.div>
  );
}

function AlertBanner({ message, type }: { message: string; type: "error" | "success" }) {
  const isError = type === "error";

  return (
    <motion.div
      animate={isError ? { opacity: [1, 0.7, 1] } : {}}
      transition={{ duration: 1, repeat: isError ? Infinity : 0 }}
      className={`rounded-lg border p-4 ${
        isError
          ? "border-red-500/50 bg-red-500/10"
          : "border-green-500/50 bg-green-500/10"
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-2 h-2 rounded-full ${
            isError ? "bg-red-500" : "bg-green-500"
          }`}
        />
        <span className={isError ? "text-red-400" : "text-green-400"}>
          {message}
        </span>
      </div>
    </motion.div>
  );
}

const MAGNETIC_RADIUS = 150;
const MAGNETIC_STRENGTH = 0.35;
const BRAND_COLORS = ["#00f5d4", "#00d4aa", "#8b5cf6", "#ec4899"];

function FixNowButton({ onClick }: { onClick: () => void }) {
  const buttonRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [glowIntensity, setGlowIntensity] = useState(0);
  const [rotation, setRotation] = useState(0);
  const rotationSpeed = useRef(1);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 150, damping: 15 });
  const springY = useSpring(y, { stiffness: 150, damping: 15 });

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

  return (
    <motion.div
      ref={buttonRef}
      className="relative group cursor-pointer"
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
    >
      {/* Radial pulse */}
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

      {/* Blurred halo */}
      <div
        className="absolute -inset-[2px] rounded-full blur-md pointer-events-none"
        style={{
          background: conicGradient,
          opacity: 0.4 + glowIntensity * 0.4,
        }}
      />

      {/* Sharp rotating gradient border */}
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

      {/* Corner accents */}
      <svg className="absolute -top-3 -left-3 w-6 h-6 pointer-events-none" viewBox="0 0 24 24">
        <motion.path
          d="M 0 12 L 0 0 L 12 0"
          stroke="#00f5d4"
          strokeWidth="1"
          fill="none"
          initial={{ pathLength: 0.3, opacity: 0.3 }}
          animate={{ pathLength: isHovered ? 1 : 0.3, opacity: isHovered ? 0.8 : 0.3 }}
          transition={{ duration: 0.3 }}
        />
      </svg>
      <svg className="absolute -bottom-3 -right-3 w-6 h-6 pointer-events-none rotate-180" viewBox="0 0 24 24">
        <motion.path
          d="M 0 12 L 0 0 L 12 0"
          stroke="#ec4899"
          strokeWidth="1"
          fill="none"
          initial={{ pathLength: 0.3, opacity: 0.3 }}
          animate={{ pathLength: isHovered ? 1 : 0.3, opacity: isHovered ? 0.8 : 0.3 }}
          transition={{ duration: 0.3 }}
        />
      </svg>

      {/* Glass interior */}
      <div className="relative rounded-full bg-gray-950/90 backdrop-blur-xl px-8 py-4 overflow-hidden">
        {/* Noise texture */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Shimmer */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.1) 45%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.1) 55%, transparent 60%)",
            backgroundSize: "200% 100%",
          }}
          animate={{ backgroundPosition: isHovered ? ["200% 0", "-200% 0"] : "200% 0" }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />

        {/* Content */}
        <div className="relative flex items-center gap-3 font-semibold text-white">
          <span className="relative flex h-2 w-2">
            <motion.span
              className="absolute inline-flex h-full w-full rounded-full bg-primary"
              animate={{ scale: [1, 1.5, 1], opacity: [0.7, 0.3, 0.7] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
          </span>

          <span className="text-lg tracking-wide">FIX NOW</span>

          <motion.svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            animate={{ x: isHovered ? [0, 4, 0] : 0 }}
            transition={{ duration: 0.8, repeat: isHovered ? Infinity : 0, ease: "easeInOut" }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </motion.svg>
        </div>
      </div>
    </motion.div>
  );
}

export function RAGCrisisSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  const [isTransformed, setIsTransformed] = useState(false);
  const [trustScore, setTrustScore] = useState(73);
  const [queryIndex, setQueryIndex] = useState(0);

  const handleFix = () => {
    setIsTransformed(true);
  };

  // Decay trust score in crisis mode
  useEffect(() => {
    if (isTransformed) {
      setTrustScore(94);
      return;
    }

    const interval = setInterval(() => {
      setTrustScore((prev) => Math.max(45, prev - 1));
    }, 500);

    return () => clearInterval(interval);
  }, [isTransformed]);

  // Cycle through queries
  useEffect(() => {
    const interval = setInterval(() => {
      setQueryIndex((prev) => (prev + 1) % 4);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section
      ref={sectionRef}
      id="rag-system"
      className="py-32 px-6 min-h-screen"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-primary font-medium mb-4 tracking-wide">
            RAG KNOWLEDGE SYSTEM
          </p>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            {isTransformed ? (
              <span>
                The{" "}
                <span className="bg-gradient-to-r from-cyan-400 via-violet-400 to-pink-400 bg-clip-text text-transparent">
                  Flywheel
                </span>
              </span>
            ) : (
              <span>
                The{" "}
                <span className="text-red-400">Memory Crisis</span>
              </span>
            )}
          </h2>
          <p className="text-xl text-white/60 max-w-2xl mx-auto">
            {isTransformed
              ? "Self-improving retrieval that gets smarter with every query."
              : "Most RAG systems train themselves to be wrong."}
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Terminal */}
          <div className="relative">
            <HallucinationBadge visible={!isTransformed} />
            <QualityGateBadge visible={isTransformed} />
            <Terminal
              queries={isTransformed ? GOOD_QUERIES : BAD_QUERIES}
              isGlitchy={!isTransformed}
              currentIndex={queryIndex}
            />

            {/* Trust score */}
            <div className="mt-6">
              <TrustScore score={trustScore} isDecaying={!isTransformed} />
            </div>

            {/* Alert */}
            <div className="mt-6">
              <AnimatePresence mode="wait">
                {!isTransformed ? (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <AlertBanner
                      type="error"
                      message="Your knowledge base is training itself to be wrong."
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <AlertBanner
                      type="success"
                      message="Quality gates active. Bad retrievals rejected at the door."
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Fix Now Button */}
            <AnimatePresence>
              {!isTransformed && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="mt-8 flex justify-center"
                >
                  <FixNowButton onClick={handleFix} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right: Visualization */}
          <div className="space-y-8">
            <AnimatePresence mode="wait">
              {!isTransformed ? (
                <motion.div
                  key="crisis"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <FallingBlocks isReversed={false} />
                </motion.div>
              ) : (
                <motion.div
                  key="solution"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-2 gap-6"
                >
                  <QualityGate active={isTransformed} />
                  <FeedbackLoop active={isTransformed} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Stats cards - only show in transformed state */}
        <AnimatePresence>
          {isTransformed && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ delay: 0.3 }}
              className="grid md:grid-cols-3 gap-6 mt-16"
            >
              <StatCard
                label="Retrieval accuracy"
                value={94}
                unit="%"
                delay={0.4}
                color={COLORS.cyan}
              />
              <StatCard
                label="Quality score avg"
                value={0.87}
                unit=""
                delay={0.5}
                color={COLORS.violet}
              />
              <StatCard
                label="Active memories"
                value={48}
                unit="k"
                delay={0.6}
                color={COLORS.pink}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
