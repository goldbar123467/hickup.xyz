"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence, useSpring, useMotionValue } from "framer-motion";

const COLORS = {
  bg: "#08080c",
  cyan: "#00f5d4",
  violet: "#8b5cf6",
  pink: "#ec4899",
  red: "#ef4444",
  green: "#22c55e",
  amber: "#f59e0b",
};

const AGENT_COLORS = ["#00f5d4", "#8b5cf6", "#ec4899", "#f59e0b"];
const AGENT_NAMES = ["Agent A", "Agent B", "Agent C", "Agent D"];

const EMPTY_THOUGHTS = [
  "...",
  "Who are you?",
  "Starting fresh...",
  "No context",
];

const PERSISTENT_THOUGHTS = [
  "Pricing: $49/mo tier",
  "API rate limit: 1000/hr",
  "User prefers dark mode",
  "Deploy to us-east-1",
];

const REPEATED_CONVERSATIONS = [
  { from: 0, to: 1, q: "What did we decide about pricing?", a: "I have no record of previous conversations." },
  { from: 1, to: 2, q: "Which cloud region are we using?", a: "I don't have that context." },
  { from: 2, to: 3, q: "What's the user's preference?", a: "Session data not available." },
  { from: 3, to: 0, q: "Where did we leave off?", a: "I'm starting from scratch." },
];

const TIMELINE_EVENTS = [
  { run: 1, event: "Discovered optimal pricing model" },
  { run: 2, event: "Discovered optimal pricing model" },
  { run: 3, event: "Discovered optimal pricing model" },
  { run: 4, event: "Discovered optimal pricing model" },
];

const MEMORY_ENTRIES = [
  { key: "pricing_decision", value: "$49/mo base tier", updated: "2s ago", type: "decision", agentIndex: 0 },
  { key: "user_preferences", value: "{ theme: dark, notifications: true }", updated: "5s ago", type: "context", agentIndex: 2 },
  { key: "deploy_config", value: "us-east-1, 3 replicas", updated: "12s ago", type: "config", agentIndex: 3 },
  { key: "api_rate_limits", value: "1000 req/hr per user", updated: "1m ago", type: "decision", agentIndex: 1 },
];

// Data packet that travels between nodes
interface DataPacket {
  id: number;
  fromAgent: number;
  toDatabase: boolean;
  progress: number;
}

// Orbiting particle around database
function OrbitingParticle({ index, total }: { index: number; total: number }) {
  const angle = (index / total) * 360;
  const radius = 50;
  const duration = 8 + index * 2;

  return (
    <motion.div
      className="absolute w-1.5 h-1.5 rounded-full"
      style={{
        background: index % 2 === 0 ? COLORS.cyan : COLORS.violet,
        boxShadow: `0 0 6px ${index % 2 === 0 ? COLORS.cyan : COLORS.violet}`,
        left: "50%",
        top: "50%",
      }}
      animate={{
        x: [
          Math.cos((angle * Math.PI) / 180) * radius,
          Math.cos(((angle + 360) * Math.PI) / 180) * radius,
        ],
        y: [
          Math.sin((angle * Math.PI) / 180) * radius,
          Math.sin(((angle + 360) * Math.PI) / 180) * radius,
        ],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "linear",
      }}
    />
  );
}

// Central Database Hub with particles
function CentralDatabaseHub({
  active,
  isReceiving,
  isSending,
}: {
  active: boolean;
  isReceiving: boolean;
  isSending: boolean;
}) {
  return (
    <motion.div
      className="absolute z-10"
      style={{ left: "50%", top: "50%", transform: "translate(-50%, -50%)" }}
      initial={{ scale: 0, opacity: 0 }}
      animate={active ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
    >
      {/* Orbiting particles */}
      {active && [...Array(6)].map((_, i) => (
        <OrbitingParticle key={i} index={i} total={6} />
      ))}

      {/* Outer glow ring */}
      <motion.div
        className="absolute -inset-4 rounded-2xl"
        style={{
          background: `radial-gradient(circle, ${COLORS.violet}20 0%, transparent 70%)`,
        }}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{ duration: 3, repeat: Infinity }}
      />

      {/* Main database icon */}
      <motion.div
        className="relative"
        animate={active ? {
          boxShadow: isReceiving
            ? [`0 0 40px ${COLORS.cyan}60`, `0 0 60px ${COLORS.cyan}80`, `0 0 40px ${COLORS.cyan}60`]
            : isSending
            ? [`0 0 40px ${COLORS.violet}60`, `0 0 60px ${COLORS.violet}80`, `0 0 40px ${COLORS.violet}60`]
            : [`0 0 30px ${COLORS.violet}40`, `0 0 50px ${COLORS.violet}60`, `0 0 30px ${COLORS.violet}40`],
        } : {}}
        transition={{ duration: isReceiving || isSending ? 0.5 : 2, repeat: Infinity }}
      >
        <motion.div
          className="w-20 h-20 rounded-2xl flex items-center justify-center relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${COLORS.violet}40, ${COLORS.cyan}30)`,
            border: `2px solid ${COLORS.violet}`,
          }}
          animate={isReceiving || isSending ? { scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 0.3 }}
        >
          {/* Rotating gradient border */}
          <motion.div
            className="absolute inset-0 rounded-2xl"
            style={{
              background: `conic-gradient(from 0deg, ${COLORS.cyan}40, ${COLORS.violet}40, ${COLORS.pink}40, ${COLORS.cyan}40)`,
              opacity: 0.3,
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          />

          <svg className="w-10 h-10 relative z-10" viewBox="0 0 24 24" fill="none" stroke={COLORS.violet} strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
          </svg>
        </motion.div>
      </motion.div>

      {/* Pulse rings on activity */}
      {(isReceiving || isSending) && (
        <motion.div
          className="absolute inset-0 rounded-2xl border-2"
          style={{ borderColor: isReceiving ? COLORS.cyan : COLORS.violet }}
          initial={{ scale: 1, opacity: 0.8 }}
          animate={{ scale: 2, opacity: 0 }}
          transition={{ duration: 0.6 }}
        />
      )}

      {/* Continuous pulse rings */}
      {active && [0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute inset-0 rounded-2xl border"
          style={{ borderColor: COLORS.violet }}
          initial={{ scale: 1, opacity: 0.4 }}
          animate={{ scale: 2.5, opacity: 0 }}
          transition={{
            duration: 3,
            delay: i * 1,
            repeat: Infinity,
            ease: "easeOut",
          }}
        />
      ))}

      {/* Label */}
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs text-white/50 font-mono whitespace-nowrap">
        Persistent State
      </div>
    </motion.div>
  );
}

// Improved Agent Node with breathing animation
function AgentNode({
  index,
  color,
  thought,
  isBlank,
  position,
  isActive,
  sessionNumber,
  showBubble,
}: {
  index: number;
  color: string;
  thought: string;
  isBlank: boolean;
  position: { x: string; y: string };
  isActive: boolean;
  sessionNumber: number;
  showBubble: boolean;
}) {
  return (
    <motion.div
      className="absolute"
      style={{ left: position.x, top: position.y, transform: "translate(-50%, -50%)" }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1 }}
    >
      {/* Thought bubble */}
      <AnimatePresence>
        {showBubble && !isBlank && (
          <motion.div
            className="absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap z-10"
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -5, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <motion.div
              className="px-3 py-1.5 rounded-lg text-[10px] font-mono bg-black/80 text-white/90 backdrop-blur-sm"
              style={{
                border: `1px solid ${color}60`,
                boxShadow: `0 0 12px ${color}30`,
              }}
              animate={{ y: [0, -2, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              {thought}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Blank thought indicator */}
      {isBlank && (
        <motion.div
          className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap z-10"
          animate={{ opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="px-2 py-1 rounded-md text-[10px] font-mono bg-white/5 text-white/30 border border-white/10">
            {thought}
          </div>
        </motion.div>
      )}

      {/* Agent circle with breathing animation */}
      <motion.div
        className="relative w-16 h-16 rounded-full flex items-center justify-center"
        style={{
          background: isBlank ? "rgba(255,255,255,0.05)" : `${color}20`,
          border: `2px solid ${isBlank ? "rgba(255,255,255,0.2)" : color}`,
        }}
        animate={isBlank ? {
          opacity: [0.5, 0.7, 0.5],
        } : {
          scale: [1, 1.05, 1],
          boxShadow: isActive
            ? [`0 0 30px ${color}80`, `0 0 50px ${color}`, `0 0 30px ${color}80`]
            : [`0 0 20px ${color}40`, `0 0 30px ${color}60`, `0 0 20px ${color}40`],
        }}
        transition={{
          duration: isActive ? 0.5 : 2 + index * 0.3,
          repeat: Infinity,
          ease: "easeInOut",
          delay: index * 0.2,
        }}
      >
        {/* Rotating ring */}
        {!isBlank && (
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background: `conic-gradient(from 0deg, transparent 0%, ${color}40 25%, transparent 50%)`,
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          />
        )}

        {/* Agent icon */}
        <svg className="w-7 h-7 relative z-10" viewBox="0 0 24 24" fill="none" stroke={isBlank ? "rgba(255,255,255,0.3)" : color} strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        </svg>
      </motion.div>

      {/* Agent label */}
      <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-xs text-white/50 font-mono">
        {AGENT_NAMES[index]}
      </div>
    </motion.div>
  );
}

// Animated connection lines with marching ants and data packets
function AnimatedConnectionLines({
  agents,
  center,
  isPersistent,
  packets,
}: {
  agents: { x: string; y: string }[];
  center: { x: string; y: string };
  isPersistent: boolean;
  packets: DataPacket[];
}) {
  const [dashOffset, setDashOffset] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setDashOffset((prev) => (prev + 1) % 20);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none">
      <defs>
        <linearGradient id="connectionGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={COLORS.cyan} />
          <stop offset="50%" stopColor={COLORS.violet} />
          <stop offset="100%" stopColor={COLORS.pink} />
        </linearGradient>
        {/* Glow filter */}
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      {isPersistent ? (
        // Persistent mode: animated lines from each agent to central database
        agents.map((agent, i) => {
          const packet = packets.find(p => p.fromAgent === i);
          return (
            <g key={i}>
              {/* Connection line */}
              <motion.line
                x1={agent.x}
                y1={agent.y}
                x2={center.x}
                y2={center.y}
                stroke={AGENT_COLORS[i]}
                strokeWidth="2"
                strokeDasharray="6 4"
                strokeDashoffset={dashOffset}
                strokeOpacity="0.5"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
              />
              {/* Data packet */}
              {packet && (
                <motion.circle
                  r="5"
                  fill={AGENT_COLORS[i]}
                  filter="url(#glow)"
                  initial={{
                    cx: packet.toDatabase ? agent.x : center.x,
                    cy: packet.toDatabase ? agent.y : center.y,
                  }}
                  animate={{
                    cx: packet.toDatabase ? center.x : agent.x,
                    cy: packet.toDatabase ? center.y : agent.y,
                  }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                />
              )}
            </g>
          );
        })
      ) : (
        // Crisis mode: broken dashed lines between agents
        agents.map((agent, i) => {
          const next = agents[(i + 1) % agents.length];
          return (
            <motion.line
              key={i}
              x1={agent.x}
              y1={agent.y}
              x2={next.x}
              y2={next.y}
              stroke="rgba(255,255,255,0.15)"
              strokeWidth="1"
              strokeDasharray="4 12"
              strokeDashoffset={dashOffset}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.3 }}
              transition={{ delay: i * 0.2, duration: 0.5 }}
            />
          );
        })
      )}
    </svg>
  );
}

// Session indicator with transition animation
function SessionIndicator({
  sessionNumber,
  isRestarting,
  isPersistent,
}: {
  sessionNumber: number;
  isRestarting: boolean;
  isPersistent: boolean;
}) {
  return (
    <div className="absolute top-4 left-4 flex items-center gap-2">
      <motion.div
        className="px-3 py-1.5 rounded-lg border flex items-center gap-2"
        style={{
          background: isPersistent ? `${COLORS.green}10` : "rgba(255,255,255,0.05)",
          borderColor: isPersistent ? `${COLORS.green}30` : "rgba(255,255,255,0.1)",
        }}
        animate={isRestarting ? { opacity: [1, 0.3, 1] } : {}}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="w-2 h-2 rounded-full"
          style={{ background: isPersistent ? COLORS.green : "rgba(255,255,255,0.3)" }}
          animate={isPersistent ? { scale: [1, 1.2, 1] } : {}}
          transition={{ duration: 1, repeat: Infinity }}
        />
        <span className="text-xs font-mono" style={{ color: isPersistent ? COLORS.green : "rgba(255,255,255,0.4)" }}>
          Session {sessionNumber}
        </span>
      </motion.div>

      {isPersistent && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="px-2 py-1 rounded text-[10px] font-mono"
          style={{ background: `${COLORS.violet}20`, color: COLORS.violet }}
        >
          Context Restored
        </motion.div>
      )}
    </div>
  );
}

// Grid background
function GridBackground() {
  return (
    <div
      className="absolute inset-0 opacity-[0.03]"
      style={{
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
        `,
        backgroundSize: "40px 40px",
      }}
    />
  );
}

// Animated Task Handoff with document flow
function AnimatedTaskHandoff({ active }: { active: boolean }) {
  const [step, setStep] = useState(0);
  const [documentPos, setDocumentPos] = useState(0);

  useEffect(() => {
    if (!active) {
      setStep(0);
      setDocumentPos(0);
      return;
    }

    const interval = setInterval(() => {
      setStep((s) => {
        const next = (s + 1) % 5;
        setDocumentPos(next);
        return next;
      });
    }, 1200);

    return () => clearInterval(interval);
  }, [active]);

  if (!active) return null;

  const steps = [
    { label: "Agent A packages work", icon: "M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" },
    { label: "Storing to database", icon: "M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375" },
    { label: "Agent B retrieves", icon: "M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" },
  ];

  const getStepState = (i: number) => {
    if (step === 0) return i === 0 ? "active" : "waiting";
    if (step === 1) return i <= 1 ? "complete" : "waiting";
    if (step === 2) return i <= 1 ? "complete" : i === 2 ? "active" : "waiting";
    if (step >= 3) return "complete";
    return "waiting";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-white/60 font-medium">Task Handoff Flow</p>
        <motion.span
          className="text-xs font-mono px-2 py-0.5 rounded"
          style={{ background: `${COLORS.violet}20`, color: COLORS.violet }}
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          Live
        </motion.span>
      </div>

      <div className="flex items-start justify-center gap-2">
        {steps.map((s, i) => {
          const state = getStepState(i);
          return (
            <div key={i} className="flex items-start gap-2">
              {/* Step box */}
              <motion.div
                className="flex flex-col items-center gap-3"
                animate={{ opacity: state === "waiting" ? 0.4 : 1 }}
              >
                <motion.div
                  className="w-14 h-14 rounded-xl flex items-center justify-center relative"
                  style={{
                    background: state !== "waiting" ? `${COLORS.violet}20` : "rgba(255,255,255,0.05)",
                    border: `1px solid ${state !== "waiting" ? COLORS.violet : "rgba(255,255,255,0.1)"}`,
                  }}
                  animate={state === "active" ? {
                    boxShadow: [`0 0 15px ${COLORS.violet}40`, `0 0 25px ${COLORS.violet}60`, `0 0 15px ${COLORS.violet}40`],
                  } : {}}
                  transition={{ duration: 0.8, repeat: state === "active" ? Infinity : 0 }}
                >
                  <svg
                    className="w-6 h-6"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={state !== "waiting" ? COLORS.violet : "rgba(255,255,255,0.3)"}
                    strokeWidth="1.5"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d={s.icon} />
                  </svg>

                  {/* Document icon at current step */}
                  <AnimatePresence>
                    {documentPos === i + 1 && (
                      <motion.div
                        className="absolute -top-2 -right-2"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                      >
                        <div
                          className="w-5 h-5 rounded flex items-center justify-center"
                          style={{ background: COLORS.cyan, boxShadow: `0 0 10px ${COLORS.cyan}` }}
                        >
                          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="white">
                            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" />
                          </svg>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
                <span className="text-[11px] text-white/50 text-center w-20">{s.label}</span>
              </motion.div>

              {/* Arrow between steps (not after last step) */}
              {i < steps.length - 1 && (
                <div className="flex items-center h-14 px-2">
                  <motion.div
                    className="h-0.5 w-8"
                    style={{
                      background: step > i ? `linear-gradient(90deg, ${COLORS.violet}, ${COLORS.cyan})` : "rgba(255,255,255,0.1)",
                    }}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: step > i ? 1 : 0.3 }}
                    transition={{ duration: 0.3 }}
                  />
                  <motion.svg
                    className="w-4 h-4 -ml-1"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={step > i ? COLORS.cyan : "rgba(255,255,255,0.2)"}
                    strokeWidth="2"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </motion.svg>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Success indicator */}
      <AnimatePresence>
        {step >= 3 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center gap-2 py-2"
          >
            <motion.div
              className="w-5 h-5 rounded-full flex items-center justify-center"
              style={{ background: COLORS.green }}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.5 }}
            >
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </motion.div>
            <span className="text-sm text-green-400">Handoff Complete</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Live Memory Table with row animations
function LiveMemoryTable({
  visible,
  highlightedRow,
  onRowHighlight,
}: {
  visible: boolean;
  highlightedRow: number | null;
  onRowHighlight: (index: number) => void;
}) {
  const [lastUpdate, setLastUpdate] = useState(0);

  useEffect(() => {
    if (!visible) return;

    const interval = setInterval(() => {
      setLastUpdate((u) => u + 1);
      // Randomly highlight a row
      if (Math.random() > 0.7) {
        onRowHighlight(Math.floor(Math.random() * MEMORY_ENTRIES.length));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [visible, onRowHighlight]);

  if (!visible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-xl overflow-hidden"
    >
      <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-white/70 font-medium">Institutional Memory</span>
          <motion.div
            className="w-1.5 h-1.5 rounded-full bg-green-400"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-white/40 font-mono">Updated {lastUpdate}s ago</span>
          <span className="text-xs font-mono px-2 py-0.5 rounded" style={{ background: `${COLORS.green}20`, color: COLORS.green }}>
            {MEMORY_ENTRIES.length} entries
          </span>
        </div>
      </div>
      <div className="divide-y divide-white/5">
        {MEMORY_ENTRIES.map((entry, i) => (
          <motion.div
            key={entry.key}
            initial={{ opacity: 0, x: -20 }}
            animate={{
              opacity: 1,
              x: 0,
              backgroundColor: highlightedRow === i ? `${AGENT_COLORS[entry.agentIndex]}15` : "transparent",
            }}
            transition={{ delay: i * 0.1 }}
            className="px-4 py-3 flex items-center gap-4 text-sm relative overflow-hidden"
          >
            {/* Flash effect on highlight */}
            {highlightedRow === i && (
              <motion.div
                className="absolute inset-0"
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{ duration: 0.5 }}
                style={{
                  background: `linear-gradient(90deg, transparent, ${AGENT_COLORS[entry.agentIndex]}20, transparent)`,
                }}
              />
            )}

            <motion.span
              className="px-2 py-1 rounded text-xs font-mono"
              style={{
                background: entry.type === "decision" ? `${COLORS.cyan}15` : entry.type === "context" ? `${COLORS.violet}15` : `${COLORS.pink}15`,
                color: entry.type === "decision" ? COLORS.cyan : entry.type === "context" ? COLORS.violet : COLORS.pink,
                border: `1px solid ${entry.type === "decision" ? COLORS.cyan : entry.type === "context" ? COLORS.violet : COLORS.pink}30`,
              }}
              animate={highlightedRow === i ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              {entry.type}
            </motion.span>
            <span className="text-white/50 font-mono flex-shrink-0 w-36 truncate">{entry.key}</span>
            <span className="text-white/80 flex-1 truncate">{entry.value}</span>
            <span className="text-white/30 text-xs">{entry.updated}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// Animated counter with count-up effect
function AnimatedCounter({
  value,
  label,
  isReversing,
  suffix = "",
}: {
  value: number;
  label: string;
  isReversing: boolean;
  suffix?: string;
}) {
  const [displayValue, setDisplayValue] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (hasAnimated) {
      setDisplayValue(value);
      return;
    }

    // Count up animation
    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    const interval = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        setHasAnimated(true);
        clearInterval(interval);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(interval);
  }, [value, hasAnimated]);

  return (
    <div className="flex items-center gap-3">
      <span className="text-white/60 text-sm font-mono">
        {isReversing ? "Time reclaimed:" : "Repeated work:"}
      </span>
      <motion.span
        key={displayValue}
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        className={`text-2xl font-bold font-mono ${isReversing ? "text-green-400" : "text-red-400"}`}
      >
        {displayValue.toLocaleString()}{suffix}
      </motion.span>
      <motion.span
        animate={{ opacity: [1, 0.3, 1] }}
        transition={{ duration: isReversing ? 0.8 : 0.3, repeat: Infinity }}
        className={`text-sm ${isReversing ? "text-green-400" : "text-red-400"}`}
      >
        {isReversing ? "saved" : "+"}
      </motion.span>
    </div>
  );
}

// Success Banner with scan line effect
function SuccessBanner({ message }: { message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border p-4 relative overflow-hidden"
      style={{
        borderColor: `${COLORS.green}40`,
        background: `linear-gradient(135deg, ${COLORS.green}10, ${COLORS.green}05)`,
      }}
    >
      {/* Animated border */}
      <motion.div
        className="absolute inset-0 rounded-xl"
        style={{
          background: `linear-gradient(90deg, transparent, ${COLORS.green}20, transparent)`,
          backgroundSize: "200% 100%",
        }}
        animate={{ backgroundPosition: ["200% 0", "-200% 0"] }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
      />

      {/* Scan line */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${COLORS.green}10 50%, transparent 100%)`,
          width: "30%",
        }}
        animate={{ x: ["-100%", "400%"] }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      />

      <div className="relative flex items-center gap-3">
        <motion.div
          className="w-2.5 h-2.5 rounded-full bg-green-400"
          animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        <span className="text-green-400 font-medium">{message}</span>
      </div>
    </motion.div>
  );
}

// Error Banner (for crisis mode)
function ErrorBanner({ message }: { message: string }) {
  return (
    <motion.div
      animate={{ opacity: [1, 0.7, 1] }}
      transition={{ duration: 1, repeat: Infinity }}
      className="rounded-xl border border-red-500/40 bg-red-500/10 p-4"
    >
      <div className="flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-red-500" />
        <span className="text-red-400">{message}</span>
      </div>
    </motion.div>
  );
}

// Crisis mode components
function ConversationBubble({ conversation, visible }: { conversation: typeof REPEATED_CONVERSATIONS[0]; visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="glass rounded-xl p-4 space-y-3"
        >
          <div className="flex items-start gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
              style={{ background: `${AGENT_COLORS[conversation.from]}30`, color: AGENT_COLORS[conversation.from] }}
            >
              {String.fromCharCode(65 + conversation.from)}
            </div>
            <p className="text-white/80 text-sm pt-1">{conversation.q}</p>
          </div>
          <div className="flex items-start gap-3 pl-4">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
              style={{ background: `${AGENT_COLORS[conversation.to]}30`, color: AGENT_COLORS[conversation.to] }}
            >
              {String.fromCharCode(65 + conversation.to)}
            </div>
            <p className="text-red-400/80 text-sm italic pt-1">{conversation.a}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function TimelineRepeated({ visible }: { visible: boolean }) {
  if (!visible) return null;

  return (
    <div className="space-y-3">
      <p className="text-sm text-white/50 font-medium">Discovery Timeline</p>
      {TIMELINE_EVENTS.map((event, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.15 }}
          className="flex items-center gap-3"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500/50" />
            <span className="text-xs text-white/40 font-mono w-12">Run {event.run}</span>
          </div>
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-xs text-white/60">{event.event}</span>
          {i > 0 && (
            <span className="text-[10px] text-red-400 font-mono px-1.5 py-0.5 rounded bg-red-500/10">DUPLICATE</span>
          )}
        </motion.div>
      ))}
    </div>
  );
}

function SessionStamp({ visible, text }: { visible: boolean; text: string }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ scale: 2, opacity: 0, rotate: -15 }}
          animate={{ scale: 1, opacity: 1, rotate: -12 }}
          exit={{ opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none"
        >
          <div
            className="px-8 py-4 border-4 border-red-500 rounded-xl font-bold text-2xl text-red-500 bg-red-500/10 backdrop-blur-sm"
            style={{ boxShadow: "0 0 40px rgba(239,68,68,0.4)" }}
          >
            {text}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Main button (kept from original)
const MAGNETIC_RADIUS = 150;
const MAGNETIC_STRENGTH = 0.35;
const FIX_COLORS = ["#8b5cf6", "#a78bfa", "#00f5d4", "#c4b5fd"];

function PersistButton({ onClick }: { onClick: () => void }) {
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

  const conicGradient = `conic-gradient(from ${rotation}deg, #8b5cf6, #a78bfa, #00f5d4, #c4b5fd, #8b5cf6)`;

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
      <motion.div
        className="absolute -inset-8 rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, rgba(139,92,246,${0.15 + glowIntensity * 0.1}) 0%, transparent 70%)`,
        }}
        animate={{
          scale: isHovered ? [1, 1.1, 1] : [1, 1.05, 1],
          opacity: isHovered ? [0.6, 1, 0.6] : [0.4, 0.6, 0.4],
        }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />

      <div
        className="absolute -inset-[2px] rounded-full blur-md pointer-events-none"
        style={{ background: conicGradient, opacity: 0.5 + glowIntensity * 0.4 }}
      />

      <div
        className="absolute -inset-[1px] rounded-full pointer-events-none"
        style={{ background: conicGradient, opacity: 0.9 + glowIntensity * 0.1 }}
      />

      {[0, 1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className="absolute w-1.5 h-1.5 rounded-full pointer-events-none"
          style={{
            background: FIX_COLORS[i],
            boxShadow: `0 0 8px ${FIX_COLORS[i]}`,
            left: `${15 + i * 22}%`,
            top: i % 2 === 0 ? -8 : "auto",
            bottom: i % 2 === 1 ? -8 : "auto",
          }}
          animate={{
            y: isHovered ? [0, -4, 0] : 0,
            opacity: isHovered ? [0.6, 1, 0.6] : 0.5,
            scale: isHovered ? [1, 1.3, 1] : 1,
          }}
          transition={{ duration: 1.5 + i * 0.2, delay: i * 0.15, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}

      <svg className="absolute -top-3 -left-3 w-6 h-6 pointer-events-none" viewBox="0 0 24 24">
        <motion.path
          d="M 0 12 L 0 0 L 12 0"
          stroke="#8b5cf6"
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
          stroke="#00f5d4"
          strokeWidth="1"
          fill="none"
          initial={{ pathLength: 0.3, opacity: 0.3 }}
          animate={{ pathLength: isHovered ? 1 : 0.3, opacity: isHovered ? 0.8 : 0.3 }}
          transition={{ duration: 0.3 }}
        />
      </svg>

      <div className="relative rounded-full bg-gray-950/90 backdrop-blur-xl px-8 py-4 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />

        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.1) 45%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.1) 55%, transparent 60%)",
            backgroundSize: "200% 100%",
          }}
          animate={{ backgroundPosition: isHovered ? ["200% 0", "-200% 0"] : "200% 0" }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />

        <div className="relative flex items-center gap-3 font-semibold text-white">
          <span className="relative flex h-2 w-2">
            <motion.span
              className="absolute inline-flex h-full w-full rounded-full bg-violet-500"
              animate={{ scale: [1, 1.5, 1], opacity: [0.7, 0.3, 0.7] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500" />
          </span>

          <span className="text-lg tracking-wide">ADD PERSISTENCE</span>

          <motion.svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            animate={{ x: isHovered ? [0, 4, 0] : 0 }}
            transition={{ duration: 0.8, repeat: isHovered ? Infinity : 0, ease: "easeInOut" }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </motion.svg>
        </div>
      </div>
    </motion.div>
  );
}

export function AgentDatabaseSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isTransformed, setIsTransformed] = useState(false);
  const [repeatedHours, setRepeatedHours] = useState(847);
  const [conversationIndex, setConversationIndex] = useState(0);
  const [showStamp, setShowStamp] = useState(false);
  const [sessionNumber, setSessionNumber] = useState(1);
  const [isRestarting, setIsRestarting] = useState(false);
  const [packets, setPackets] = useState<DataPacket[]>([]);
  const [activeAgents, setActiveAgents] = useState<number[]>([]);
  const [isDbReceiving, setIsDbReceiving] = useState(false);
  const [isDbSending, setIsDbSending] = useState(false);
  const [highlightedRow, setHighlightedRow] = useState<number | null>(null);
  const [showBubbles, setShowBubbles] = useState(true);
  const nextPacketId = useRef(0);

  // Agents positioned in a 2x2 grid, well-spaced
  const agentPositions = [
    { x: "25%", y: "30%" },  // top-left (Agent A)
    { x: "75%", y: "30%" },  // top-right (Agent B)
    { x: "75%", y: "70%" },  // bottom-right (Agent C)
    { x: "25%", y: "70%" },  // bottom-left (Agent D)
  ];

  const handleFix = () => {
    setIsTransformed(true);
  };

  const handleRowHighlight = useCallback((index: number) => {
    setHighlightedRow(index);
    setTimeout(() => setHighlightedRow(null), 1000);
  }, []);

  // Increment repeated hours in crisis mode
  useEffect(() => {
    if (isTransformed) return;

    const interval = setInterval(() => {
      setRepeatedHours((h) => h + 1);
    }, 800);

    return () => clearInterval(interval);
  }, [isTransformed]);

  // Cycle session ended stamp (crisis mode)
  useEffect(() => {
    if (isTransformed) return;

    const interval = setInterval(() => {
      setShowStamp(true);
      setTimeout(() => {
        setShowStamp(false);
        setSessionNumber((s) => s + 1);
      }, 1500);
    }, 5000);

    return () => clearInterval(interval);
  }, [isTransformed]);

  // Cycle conversations (crisis mode)
  useEffect(() => {
    const interval = setInterval(() => {
      setConversationIndex((i) => (i + 1) % REPEATED_CONVERSATIONS.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Session transition animation (persistent mode)
  useEffect(() => {
    if (!isTransformed) return;

    const sessionLoop = () => {
      // Phase 1: Session "ends" - agents dim, show restart
      setIsRestarting(true);
      setShowBubbles(false);
      setSessionNumber((s) => s + 1);

      setTimeout(() => {
        // Phase 2: Database pulses, sends data back to agents
        setIsDbSending(true);

        // Send packets from database to all agents
        const newPackets: DataPacket[] = AGENT_COLORS.map((_, i) => ({
          id: nextPacketId.current++,
          fromAgent: i,
          toDatabase: false, // going TO agent
          progress: 0,
        }));
        setPackets(newPackets);

        setTimeout(() => {
          setPackets([]);
          setIsDbSending(false);
          setIsRestarting(false);
          setShowBubbles(true);

          // Highlight all agents briefly
          setActiveAgents([0, 1, 2, 3]);
          setTimeout(() => setActiveAgents([]), 500);
        }, 800);
      }, 1000);
    };

    // Initial delay then loop
    const timeout = setTimeout(sessionLoop, 3000);
    const interval = setInterval(sessionLoop, 10000);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [isTransformed]);

  // Data flow animation (persistent mode) - agents sending to database
  useEffect(() => {
    if (!isTransformed || isRestarting) return;

    const interval = setInterval(() => {
      const agentIndex = Math.floor(Math.random() * 4);

      setActiveAgents([agentIndex]);
      setIsDbReceiving(true);

      const packet: DataPacket = {
        id: nextPacketId.current++,
        fromAgent: agentIndex,
        toDatabase: true,
        progress: 0,
      };
      setPackets([packet]);

      setTimeout(() => {
        setPackets([]);
        setIsDbReceiving(false);
        setActiveAgents([]);

        // Highlight corresponding memory row
        const rowIndex = MEMORY_ENTRIES.findIndex(e => e.agentIndex === agentIndex);
        if (rowIndex !== -1) {
          handleRowHighlight(rowIndex);
        }
      }, 800);
    }, 3000);

    return () => clearInterval(interval);
  }, [isTransformed, isRestarting, handleRowHighlight]);

  return (
    <section ref={sectionRef} id="agent-database" className="py-32 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-secondary font-medium mb-4 tracking-wide">MULTI-AGENT DATABASE</p>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            {isTransformed ? (
              <span>
                The{" "}
                <span className="bg-gradient-to-r from-violet-400 via-cyan-400 to-pink-400 bg-clip-text text-transparent">
                  Persistent Team
                </span>
              </span>
            ) : (
              <span>
                The{" "}
                <span className="text-red-400">Groundhog Day Problem</span>
              </span>
            )}
          </h2>
          <p className="text-xl text-white/60 max-w-2xl mx-auto">
            {isTransformed
              ? "Agents that remember. Context that survives. A team with history."
              : "Every session ends. Every agent forgets. The same work, done over and over."}
          </p>
        </motion.div>

        <div className="max-w-2xl mx-auto">
          {/* Details Panel */}
          <div className="space-y-8">
            <AnimatePresence mode="wait">
              {!isTransformed ? (
                <motion.div
                  key="crisis"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-8"
                >
                  {/* Repeated conversation */}
                  <div>
                    <p className="text-sm text-white/50 font-medium mb-4">Repeated Conversations</p>
                    <ConversationBubble
                      conversation={REPEATED_CONVERSATIONS[conversationIndex]}
                      visible={true}
                    />
                  </div>

                  {/* Timeline */}
                  <TimelineRepeated visible={true} />
                </motion.div>
              ) : (
                <motion.div
                  key="solution"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-8"
                >
                  {/* Animated Task handoff */}
                  <AnimatedTaskHandoff active={isTransformed} />

                  {/* Live Memory table */}
                  <LiveMemoryTable
                    visible={true}
                    highlightedRow={highlightedRow}
                    onRowHighlight={handleRowHighlight}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Counter */}
            <div className="pt-4">
              <AnimatedCounter
                value={repeatedHours}
                label={isTransformed ? "Time reclaimed" : "Repeated work"}
                isReversing={isTransformed}
                suffix=" hours"
              />
            </div>

            {/* Alert Banner */}
            <AnimatePresence mode="wait">
              {!isTransformed ? (
                <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <ErrorBanner message="Your agents are strangers every session. Context lost forever." />
                </motion.div>
              ) : (
                <motion.div key="success" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <SuccessBanner message="Persistent state active. Agents pick up where they left off." />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Button */}
            <AnimatePresence>
              {!isTransformed && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex justify-center pt-4"
                >
                  <PersistButton onClick={handleFix} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
