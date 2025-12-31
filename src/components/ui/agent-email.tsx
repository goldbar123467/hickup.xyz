"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence, useSpring, useMotionValue } from "framer-motion";

const COLORS = {
  bg: "#08080c",
  cyan: "#00f5d4",
  violet: "#8b5cf6",
  pink: "#ec4899",
  amber: "#f59e0b",
  green: "#22c55e",
  win95Gray: "#c0c0c0",
  win95DarkGray: "#808080",
  win95Blue: "#000080",
};

// Envelope state type
type EnvelopeStatus = "spawning" | "toQueue" | "inQueue" | "toReceiver" | "delivered";
interface Envelope {
  id: number;
  status: EnvelopeStatus;
  slotIndex: number | null;
  spawnTime: number;
}

// Windows 95 style window
function Win95Window({
  title,
  children,
  error,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  error?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`border-2 ${className}`}
      style={{
        borderColor: "#dfdfdf #404040 #404040 #dfdfdf",
        background: COLORS.win95Gray,
        fontFamily: '"MS Sans Serif", Arial, sans-serif',
        imageRendering: "pixelated",
      }}
    >
      {/* Title bar */}
      <div
        className="flex items-center justify-between px-1 py-0.5"
        style={{
          background: error ? "#800000" : `linear-gradient(90deg, ${COLORS.win95Blue}, #1084d0)`,
        }}
      >
        <span className="text-white text-xs font-bold truncate">{title}</span>
        <div className="flex gap-0.5">
          <button
            className="w-4 h-4 text-xs flex items-center justify-center"
            style={{
              background: COLORS.win95Gray,
              borderColor: "#dfdfdf #404040 #404040 #dfdfdf",
              borderWidth: 2,
            }}
          >
            _
          </button>
          <button
            className="w-4 h-4 text-xs flex items-center justify-center"
            style={{
              background: COLORS.win95Gray,
              borderColor: "#dfdfdf #404040 #404040 #dfdfdf",
              borderWidth: 2,
            }}
          >
            X
          </button>
        </div>
      </div>
      {/* Content */}
      <div className="p-2">{children}</div>
    </div>
  );
}

// Pixelated CRT Monitor
function CRTMonitor({
  children,
  label,
  status,
  isOff,
}: {
  children: React.ReactNode;
  label: string;
  status?: "busy" | "ready" | "error" | "waiting";
  isOff?: boolean;
}) {
  return (
    <div className="flex flex-col items-center">
      {/* Monitor */}
      <div
        className="relative rounded-lg p-3"
        style={{
          background: "linear-gradient(180deg, #d4cfc4 0%, #a8a299 100%)",
          border: "3px solid #6b6560",
        }}
      >
        {/* Screen bezel */}
        <div
          className="rounded p-1"
          style={{
            background: "#1a1a1a",
            border: "4px solid #2a2520",
          }}
        >
          {/* Screen */}
          <div
            className="relative w-28 h-20 overflow-hidden"
            style={{
              background: isOff ? "#0a0a0a" : "#008080",
              boxShadow: isOff ? "none" : "inset 0 0 20px rgba(0,0,0,0.5)",
            }}
          >
            {/* Scanlines */}
            {!isOff && (
              <div
                className="absolute inset-0 pointer-events-none opacity-20"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(0,0,0,0.3) 1px, rgba(0,0,0,0.3) 2px)",
                }}
              />
            )}
            {/* CRT curve effect */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.4) 100%)",
              }}
            />
            {children}
          </div>
        </div>
        {/* Power LED */}
        <div className="flex justify-center mt-2">
          <div
            className="w-2 h-2 rounded-full"
            style={{
              background: isOff ? "#333" : status === "error" ? "#ff0000" : "#00ff00",
              boxShadow: isOff ? "none" : `0 0 5px ${status === "error" ? "#ff0000" : "#00ff00"}`,
            }}
          />
        </div>
      </div>
      {/* Stand */}
      <div
        className="w-12 h-3 -mt-1"
        style={{ background: "linear-gradient(180deg, #a8a299, #6b6560)" }}
      />
      <div
        className="w-20 h-2 rounded-b"
        style={{ background: "linear-gradient(180deg, #6b6560, #4a4540)" }}
      />
      {/* Label */}
      <span className="text-xs text-white/40 font-mono mt-2">{label}</span>
      {status && (
        <span
          className="text-[10px] font-mono mt-1"
          style={{
            color:
              status === "ready" ? "#00ff00" : status === "error" ? "#ff4444" : "#ffaa00",
          }}
        >
          {status === "busy" && "BUSY"}
          {status === "ready" && "READY"}
          {status === "error" && "ERROR"}
          {status === "waiting" && "WAITING..."}
        </span>
      )}
    </div>
  );
}

// Flying folder animation
function FlyingFolder({
  isFlying,
  progress,
  failed,
  fromX,
  toX,
}: {
  isFlying: boolean;
  progress: number;
  failed: boolean;
  fromX: number;
  toX: number;
}) {
  if (!isFlying) return null;

  const currentX = fromX + (toX - fromX) * progress;
  // Parabolic arc
  const arcHeight = -60;
  const currentY = arcHeight * Math.sin(progress * Math.PI);

  return (
    <motion.div
      className="absolute z-20"
      style={{
        left: currentX,
        top: `calc(50% + ${currentY}px)`,
        transform: "translate(-50%, -50%)",
      }}
      animate={failed ? { opacity: [1, 0], scale: [1, 0.5], rotate: [0, 45] } : {}}
      transition={{ duration: 0.3 }}
    >
      {/* Manila folder icon */}
      <svg width="32" height="28" viewBox="0 0 32 28" style={{ imageRendering: "pixelated" }}>
        <rect x="0" y="4" width="32" height="24" fill="#f5d442" stroke="#b8860b" strokeWidth="2" />
        <rect x="2" y="0" width="12" height="6" fill="#f5d442" stroke="#b8860b" strokeWidth="2" />
        <rect x="4" y="8" width="24" height="2" fill="#e8c736" />
      </svg>
      {failed && (
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {/* Glitch effect */}
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="absolute bg-red-500"
              style={{
                width: Math.random() * 20 + 5,
                height: 2,
                left: Math.random() * 20 - 10,
                top: Math.random() * 20,
                opacity: 0.8,
              }}
            />
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}

// Windows 95 Error Modal
function ErrorModal({ visible, message }: { visible: boolean; message: string }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="absolute inset-0 flex items-center justify-center z-30"
        >
          <Win95Window title="Error" error>
            <div className="flex items-start gap-2 min-w-[200px]">
              {/* Error icon */}
              <div className="w-8 h-8 flex items-center justify-center">
                <svg width="32" height="32" viewBox="0 0 32 32">
                  <circle cx="16" cy="16" r="14" fill="#ff0000" stroke="#800000" strokeWidth="2" />
                  <text x="16" y="22" textAnchor="middle" fill="white" fontSize="20" fontWeight="bold">
                    X
                  </text>
                </svg>
              </div>
              <p className="text-xs text-black flex-1">{message}</p>
            </div>
            <div className="flex justify-center mt-3">
              <button
                className="px-4 py-1 text-xs"
                style={{
                  background: COLORS.win95Gray,
                  borderColor: "#dfdfdf #404040 #404040 #dfdfdf",
                  borderWidth: 2,
                }}
              >
                OK
              </button>
            </div>
          </Win95Window>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Stat Card (modern shadcn style)
function StatCard({
  value,
  label,
  color,
  delay = 0,
  animateValue = false
}: {
  value: string | number;
  label: string;
  color: string;
  delay?: number;
  animateValue?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + delay }}
      className="glass rounded-xl p-5 text-center"
      style={{
        boxShadow: `0 0 30px ${color}15`,
        borderColor: `${color}25`,
      }}
    >
      <motion.div
        className="text-2xl md:text-3xl font-bold font-mono mb-1"
        style={{ color }}
        key={value}
        initial={animateValue ? { scale: 1.1 } : false}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        {value}
      </motion.div>
      <div className="text-white/40 text-xs md:text-sm">{label}</div>
    </motion.div>
  );
}

// Envelope Icon Component
function EnvelopeIcon({ size = 24, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <defs>
        <linearGradient id="envelopeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={COLORS.cyan} />
          <stop offset="100%" stopColor={COLORS.violet} />
        </linearGradient>
      </defs>
      <rect x="2" y="4" width="20" height="16" rx="2" fill="url(#envelopeGrad)" />
      <path d="M2 6L12 13L22 6" stroke="white" strokeWidth="1.5" strokeOpacity="0.6" />
    </svg>
  );
}

// Flying Envelope that travels the data path
function DataEnvelope({
  envelope,
  positions,
  onComplete,
}: {
  envelope: Envelope;
  positions: { sender: number; queue: number; receiver: number };
  onComplete: (id: number, nextStatus: EnvelopeStatus) => void;
}) {
  const getAnimationProps = () => {
    switch (envelope.status) {
      case "spawning":
        return {
          initial: { x: positions.sender, y: 0, scale: 0, opacity: 0 },
          animate: { x: positions.sender, y: 0, scale: 1, opacity: 1 },
          transition: { duration: 0.3, ease: "backOut" },
          onAnimationComplete: () => onComplete(envelope.id, "toQueue"),
        };
      case "toQueue":
        return {
          initial: { x: positions.sender, y: 0, rotate: 0 },
          animate: {
            x: positions.queue,
            y: [0, -30, 0],
            rotate: [0, 10, -5, 0],
          },
          transition: { duration: 0.8, ease: "easeInOut" },
          onAnimationComplete: () => onComplete(envelope.id, "inQueue"),
        };
      case "toReceiver":
        return {
          initial: { x: positions.queue, y: 0, scale: 0.7 },
          animate: {
            x: positions.receiver,
            y: [0, -25, 0],
            scale: 1,
            rotate: [0, -8, 5, 0],
          },
          transition: { duration: 0.8, ease: "easeInOut" },
          onAnimationComplete: () => onComplete(envelope.id, "delivered"),
        };
      default:
        return {};
    }
  };

  if (envelope.status === "inQueue" || envelope.status === "delivered") {
    return null;
  }

  const props = getAnimationProps();

  return (
    <motion.div
      className="absolute z-20 pointer-events-none"
      style={{
        top: "50%",
        marginTop: -12,
        filter: `drop-shadow(0 0 10px ${COLORS.cyan}80)`,
      }}
      {...props}
    >
      <EnvelopeIcon size={24} />
    </motion.div>
  );
}

// Modern Node Card (Sender/Queue/Receiver)
function NodeCard({
  label,
  color,
  children,
  isReceiving = false,
  className = "",
}: {
  label: string;
  color: string;
  children: React.ReactNode;
  isReceiving?: boolean;
  className?: string;
}) {
  return (
    <motion.div
      className={`flex flex-col items-center ${className}`}
      animate={isReceiving ? { scale: [1, 1.02, 1] } : {}}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="rounded-xl p-[1px] relative overflow-hidden min-w-[140px]"
        style={{
          background: `linear-gradient(135deg, ${color}60, ${color}30)`,
        }}
        animate={isReceiving ? {
          boxShadow: [`0 0 20px ${color}30`, `0 0 40px ${color}50`, `0 0 20px ${color}30`],
        } : {
          boxShadow: `0 0 20px ${color}20`,
        }}
        transition={{ duration: 0.5 }}
      >
        <div
          className="rounded-xl min-h-[100px] p-4 relative overflow-hidden backdrop-blur-xl"
          style={{ background: `${COLORS.bg}f0` }}
        >
          {children}
        </div>
      </motion.div>
      <span className="text-sm text-white/60 font-medium mt-3">{label}</span>
    </motion.div>
  );
}

// Queue Slot Component
function QueueSlot({
  index,
  hasEnvelope,
  isActive
}: {
  index: number;
  hasEnvelope: boolean;
  isActive: boolean;
}) {
  return (
    <motion.div
      className="flex items-center gap-2 px-3 py-2 rounded-lg"
      style={{
        background: hasEnvelope ? `${COLORS.pink}15` : "rgba(255,255,255,0.03)",
        border: `1px solid ${hasEnvelope ? COLORS.pink : "rgba(255,255,255,0.08)"}`,
      }}
      animate={isActive ? {
        scale: [1, 1.05, 1],
        borderColor: [COLORS.pink, COLORS.cyan, COLORS.pink],
      } : hasEnvelope ? {
        y: [0, -1, 0],
      } : {}}
      transition={isActive ? { duration: 0.3 } : { duration: 2, repeat: Infinity, ease: "easeInOut" }}
    >
      {hasEnvelope ? (
        <EnvelopeIcon size={16} />
      ) : (
        <div className="w-4 h-4 rounded border border-dashed border-white/20" />
      )}
      <span className={`text-xs font-mono ${hasEnvelope ? "text-white/80" : "text-white/30"}`}>
        Slot {index + 1}
      </span>
    </motion.div>
  );
}

// Connection Path SVG
function ConnectionPath({
  isActive,
  progress = 0
}: {
  isActive: boolean;
  progress?: number;
}) {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 5 }}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={COLORS.cyan} />
          <stop offset="50%" stopColor={COLORS.pink} />
          <stop offset="100%" stopColor={COLORS.violet} />
        </linearGradient>
      </defs>
      {/* Sender to Queue path */}
      <motion.line
        x1="18%"
        y1="50%"
        x2="42%"
        y2="50%"
        stroke="url(#pathGradient)"
        strokeWidth="2"
        strokeDasharray="6 4"
        strokeOpacity={isActive ? 0.8 : 0.3}
        animate={isActive ? { strokeOpacity: [0.4, 0.8, 0.4] } : {}}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
      {/* Queue to Receiver path */}
      <motion.line
        x1="58%"
        y1="50%"
        x2="82%"
        y2="50%"
        stroke="url(#pathGradient)"
        strokeWidth="2"
        strokeDasharray="6 4"
        strokeOpacity={isActive ? 0.8 : 0.3}
        animate={isActive ? { strokeOpacity: [0.4, 0.8, 0.4] } : {}}
        transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
      />
    </svg>
  );
}

// Main Data Flow Visualization
function DataFlowVisualization({
  onDelivery,
}: {
  onDelivery: () => void;
}) {
  const [envelopes, setEnvelopes] = useState<Envelope[]>([]);
  const [queueSlots, setQueueSlots] = useState<(number | null)[]>([null, null, null]);
  const [activeSlot, setActiveSlot] = useState<number | null>(null);
  const [isReceiving, setIsReceiving] = useState(false);
  const [queuedCount, setQueuedCount] = useState(0);
  const nextId = useRef(0);

  // Positions as percentages
  const positions = {
    sender: 60,    // 15% from left
    queue: 280,    // 50%
    receiver: 500, // 85%
  };

  // Spawn new envelope
  const spawnEnvelope = useCallback(() => {
    const newEnvelope: Envelope = {
      id: nextId.current++,
      status: "spawning",
      slotIndex: null,
      spawnTime: Date.now(),
    };
    setEnvelopes(prev => [...prev, newEnvelope]);
  }, []);

  // Handle envelope state transitions
  const handleEnvelopeComplete = useCallback((id: number, nextStatus: EnvelopeStatus) => {
    setEnvelopes(prev => prev.map(env => {
      if (env.id !== id) return env;

      if (nextStatus === "inQueue") {
        // Find empty slot
        const emptySlotIndex = queueSlots.findIndex(slot => slot === null);
        if (emptySlotIndex !== -1) {
          setQueueSlots(slots => {
            const newSlots = [...slots];
            newSlots[emptySlotIndex] = id;
            return newSlots;
          });
          setActiveSlot(emptySlotIndex);
          setQueuedCount(c => c + 1);
          setTimeout(() => setActiveSlot(null), 300);

          // Schedule departure from queue
          setTimeout(() => {
            setQueueSlots(slots => {
              const newSlots = [...slots];
              const slotIdx = newSlots.findIndex(s => s === id);
              if (slotIdx !== -1) newSlots[slotIdx] = null;
              return newSlots;
            });
            setQueuedCount(c => Math.max(0, c - 1));
            setEnvelopes(envs => envs.map(e =>
              e.id === id ? { ...e, status: "toReceiver" as EnvelopeStatus } : e
            ));
          }, 1500 + Math.random() * 1000);
        }
        return { ...env, status: nextStatus, slotIndex: emptySlotIndex };
      }

      if (nextStatus === "delivered") {
        setIsReceiving(true);
        setTimeout(() => setIsReceiving(false), 300);
        onDelivery();
        // Remove envelope after delivery
        setTimeout(() => {
          setEnvelopes(envs => envs.filter(e => e.id !== id));
        }, 100);
      }

      return { ...env, status: nextStatus };
    }));
  }, [queueSlots, onDelivery]);

  // Spawn envelopes periodically
  useEffect(() => {
    const interval = setInterval(() => {
      // Only spawn if we have room in queue
      const activeEnvelopes = envelopes.filter(e => e.status !== "delivered").length;
      if (activeEnvelopes < 5) {
        spawnEnvelope();
      }
    }, 2000 + Math.random() * 1000);

    // Initial spawn
    const timeout = setTimeout(spawnEnvelope, 500);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [spawnEnvelope, envelopes]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative glass rounded-2xl p-8 overflow-hidden min-h-[280px]"
      style={{
        boxShadow: `0 0 60px ${COLORS.cyan}10, 0 0 30px ${COLORS.violet}10`,
      }}
    >
      {/* Gradient background */}
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 15% 50%, ${COLORS.cyan}15, transparent 40%), radial-gradient(ellipse at 50% 50%, ${COLORS.pink}10, transparent 40%), radial-gradient(ellipse at 85% 50%, ${COLORS.violet}15, transparent 40%)`,
        }}
      />

      {/* Connection paths */}
      <ConnectionPath isActive={envelopes.length > 0} />

      {/* Main content */}
      <div className="relative flex items-center justify-between px-4 h-[200px]">
        {/* Sender Node */}
        <NodeCard label="Sender" color={COLORS.cyan}>
          <div className="text-xs font-mono space-y-2">
            <div className="flex items-center gap-2">
              <motion.div
                className="w-2 h-2 rounded-full bg-green-400"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
              <span className="text-green-400">Online</span>
            </div>
            <div className="text-white/50">
              Sending messages...
            </div>
            <div className="flex items-center gap-1 text-white/40">
              <EnvelopeIcon size={12} />
              <span>Ready to emit</span>
            </div>
          </div>
        </NodeCard>

        {/* Queue Node */}
        <NodeCard label="Queue" color={COLORS.pink} className="mx-4">
          <div className="space-y-2">
            {[0, 1, 2].map(i => (
              <QueueSlot
                key={i}
                index={i}
                hasEnvelope={queueSlots[i] !== null}
                isActive={activeSlot === i}
              />
            ))}
          </div>
        </NodeCard>

        {/* Receiver Node */}
        <NodeCard label="Receiver" color={COLORS.violet} isReceiving={isReceiving}>
          <div className="text-xs font-mono space-y-2">
            <div className="flex items-center gap-2">
              <motion.div
                className="w-2 h-2 rounded-full bg-green-400"
                animate={{ scale: isReceiving ? [1, 1.5, 1] : 1 }}
                transition={{ duration: 0.3 }}
              />
              <span className="text-green-400">Processing</span>
            </div>
            <div className="text-white/60 font-medium">
              {queuedCount} queued
            </div>
            <div className="flex items-center gap-1 text-white/40">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span>Receiving</span>
            </div>
          </div>
        </NodeCard>

        {/* Flying Envelopes */}
        {envelopes.map(envelope => (
          <DataEnvelope
            key={envelope.id}
            envelope={envelope}
            positions={positions}
            onComplete={handleEnvelopeComplete}
          />
        ))}
      </div>
    </motion.div>
  );
}

// Modern Email Section with connected stats
function ModernEmailSection() {
  const [deliveryCount, setDeliveryCount] = useState(847);
  const [hasAnimated, setHasAnimated] = useState(false);

  const handleDelivery = useCallback(() => {
    setDeliveryCount(c => c + 1);
  }, []);

  useEffect(() => {
    // Trigger initial animation
    const timeout = setTimeout(() => setHasAnimated(true), 100);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <motion.div
      key="modern"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-8"
    >
      {/* Data Flow Visualization */}
      <DataFlowVisualization onDelivery={handleDelivery} />

      {/* Stats Row with padding */}
      <div className="pt-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard value="99.9%" label="Delivery Rate" color={COLORS.cyan} delay={0} />
          <StatCard value="23ms" label="Avg Latency" color={COLORS.violet} delay={0.1} />
          <StatCard
            value={`${deliveryCount}/min`}
            label="Throughput"
            color={COLORS.pink}
            delay={0.2}
            animateValue={hasAnimated}
          />
          <StatCard value="0" label="Messages Lost" color={COLORS.green} delay={0.3} />
        </div>
      </div>

      {/* Alert */}
      <ModernAlert message="Async messaging with guaranteed delivery. Your agents communicate like email conquered the world." />

      {/* Message Table */}
      <MessageTable visible={true} />
    </motion.div>
  );
}

// LCD Counter Display (for retro mode)
function LCDCounter({ value, label, isGood }: { value: string; label: string; isGood?: boolean }) {
  return (
    <div className="flex flex-col items-center">
      <div
        className="px-4 py-2 rounded font-mono text-xl tracking-wider"
        style={{
          background: "#0a0a05",
          border: "2px solid #222",
          color: isGood ? "#00ff88" : "#ff4422",
          textShadow: isGood ? "0 0 10px #00ff88" : "0 0 10px #ff4422",
          fontFamily: '"Courier New", monospace',
        }}
      >
        {value}
      </div>
      <span className="text-xs text-white/40 mt-2">{label}</span>
    </div>
  );
}

// Blue Screen of Death
function BlueScreen({ visible }: { visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 flex flex-col items-center justify-center p-2 z-10"
          style={{ background: "#0000aa" }}
        >
          <p className="text-white text-[8px] text-center font-mono leading-tight">
            A fatal exception has occurred at 0x00000000
          </p>
          <p className="text-white text-[6px] mt-1 font-mono">
            Press any key to continue_
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Retro Alert (amber on black)
function RetroAlert({ message }: { message: string }) {
  return (
    <motion.div
      animate={{ opacity: [1, 0.7, 1] }}
      transition={{ duration: 1, repeat: Infinity }}
      className="rounded border-2 p-3"
      style={{
        background: "#0a0a00",
        borderColor: "#ff8800",
      }}
    >
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-amber-500" />
        <span style={{ color: "#ffaa00", fontFamily: "monospace" }} className="text-sm">
          {message}
        </span>
      </div>
    </motion.div>
  );
}

// Message Table
function MessageTable({ visible }: { visible: boolean }) {
  const messages = [
    { id: "msg_7a2f", sender: "Agent-A", recipient: "Agent-B", status: "Delivered", retries: 0, time: "23ms" },
    { id: "msg_8b3e", sender: "Agent-C", recipient: "Agent-A", status: "Delivered", retries: 1, time: "47ms" },
    { id: "msg_9c4d", sender: "Agent-B", recipient: "Agent-D", status: "Delivered", retries: 0, time: "18ms" },
    { id: "msg_0d5e", sender: "Agent-D", recipient: "Agent-C", status: "Delivered", retries: 0, time: "31ms" },
  ];

  if (!visible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="glass rounded-xl overflow-hidden"
    >
      <div className="px-5 py-3 border-b border-white/10 flex items-center justify-between">
        <span className="text-sm text-white/80 font-medium">Protocol Activity</span>
        <span className="text-xs text-green-400 font-mono">Live</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.02]">
              <th className="px-5 py-3 text-left text-white/40 font-medium text-xs">Message ID</th>
              <th className="px-5 py-3 text-left text-white/40 font-medium text-xs">From</th>
              <th className="px-5 py-3 text-left text-white/40 font-medium text-xs">To</th>
              <th className="px-5 py-3 text-left text-white/40 font-medium text-xs">Status</th>
              <th className="px-5 py-3 text-left text-white/40 font-medium text-xs">Retries</th>
              <th className="px-5 py-3 text-left text-white/40 font-medium text-xs">Latency</th>
            </tr>
          </thead>
          <tbody>
            {messages.map((msg, i) => (
              <motion.tr
                key={msg.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.08 }}
                className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
              >
                <td className="px-5 py-3 text-white/50 font-mono text-xs">{msg.id}</td>
                <td className="px-5 py-3 text-white/80">{msg.sender}</td>
                <td className="px-5 py-3 text-white/80">{msg.recipient}</td>
                <td className="px-5 py-3">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs bg-green-500/10 text-green-400 border border-green-500/20">
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {msg.status}
                  </span>
                </td>
                <td className="px-5 py-3 text-white/50 font-mono text-xs">{msg.retries}</td>
                <td className="px-5 py-3">
                  <span className="text-cyan-400 font-mono text-xs">{msg.time}</span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

// Progress Bar (Win95 style)
function Win95ProgressBar({ progress, label }: { progress: number; label: string }) {
  return (
    <div className="space-y-1">
      <div
        className="h-4 relative"
        style={{
          background: COLORS.win95Gray,
          border: "2px inset #808080",
        }}
      >
        <div
          className="h-full"
          style={{
            width: `${progress}%`,
            background: COLORS.win95Blue,
          }}
        />
      </div>
      <p className="text-[10px] text-black text-center">{label}</p>
    </div>
  );
}

// Modern Success Alert
function ModernAlert({ message }: { message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="glass rounded-xl p-4 flex-1 max-w-md"
      style={{
        borderColor: `${COLORS.cyan}30`,
        boxShadow: `0 0 20px ${COLORS.cyan}10`,
      }}
    >
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${COLORS.cyan}20` }}>
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke={COLORS.cyan} strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <span className="text-white/80 text-sm">{message}</span>
      </div>
    </motion.div>
  );
}

// Main button
const MAGNETIC_RADIUS = 150;
const MAGNETIC_STRENGTH = 0.35;
const BRAND_COLORS = ["#00f5d4", "#00d4aa", "#8b5cf6", "#ec4899"];

function UpgradeButton({ onClick }: { onClick: () => void }) {
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

      <div
        className="absolute -inset-[2px] rounded-full blur-md pointer-events-none"
        style={{ background: conicGradient, opacity: 0.4 + glowIntensity * 0.4 }}
      />

      <div
        className="absolute -inset-[1px] rounded-full pointer-events-none"
        style={{ background: conicGradient, opacity: 0.8 + glowIntensity * 0.2 }}
      />

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
          transition={{ duration: 1.5 + i * 0.2, delay: i * 0.15, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}

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
              className="absolute inline-flex h-full w-full rounded-full bg-primary"
              animate={{ scale: [1, 1.5, 1], opacity: [0.7, 0.3, 0.7] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
          </span>

          <span className="text-lg tracking-wide">UPGRADE NOW</span>

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

export function AgentEmailSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isTransformed, setIsTransformed] = useState(false);
  const [packetsLost, setPacketsLost] = useState(2847);
  const [folderProgress, setFolderProgress] = useState(0);
  const [folderFlying, setFolderFlying] = useState(true);
  const [folderFailed, setFolderFailed] = useState(false);
  const [showError, setShowError] = useState(false);
  const [showBSOD, setShowBSOD] = useState(false);
  const [pc2Status, setPC2Status] = useState<"busy" | "ready" | "error" | "waiting">("waiting");

  const handleUpgrade = () => {
    setIsTransformed(true);
  };

  // Animate folder flying and failing
  useEffect(() => {
    if (isTransformed) return;

    const cycle = () => {
      setFolderFlying(true);
      setFolderFailed(false);
      setFolderProgress(0);
      setShowError(false);
      setShowBSOD(false);
      setPC2Status("waiting");

      // Animate progress
      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += 0.02;
        setFolderProgress(progress);

        if (progress > 0.3 && progress < 0.4) {
          setPC2Status("busy");
        }

        if (progress >= 0.65) {
          clearInterval(progressInterval);
          setFolderFailed(true);
          setPC2Status("error");
          setShowBSOD(true);

          setTimeout(() => {
            setShowError(true);
            setFolderFlying(false);
          }, 500);

          setTimeout(() => {
            setShowBSOD(false);
            setShowError(false);
            cycle();
          }, 3000);
        }
      }, 50);
    };

    cycle();

    return () => {};
  }, [isTransformed]);

  // Increment packets lost
  useEffect(() => {
    if (isTransformed) return;

    const interval = setInterval(() => {
      setPacketsLost((p) => p + 1);
    }, 300);

    return () => clearInterval(interval);
  }, [isTransformed]);

  return (
    <section ref={sectionRef} id="agent-email" className="py-32 px-6 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-tertiary font-medium mb-4 tracking-wide">AGENT EMAIL PROTOCOL</p>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            {isTransformed ? (
              <span>
                The{" "}
                <span className="bg-gradient-to-r from-pink-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
                  Modern Protocol
                </span>
              </span>
            ) : (
              <span>
                The{" "}
                <span className="text-amber-400">Dial-Up Days</span>
                {" "}Are Over
              </span>
            )}
          </h2>
          <p className="text-xl text-white/60 max-w-2xl mx-auto">
            {isTransformed
              ? "Async messaging with delivery guarantees. How email conquered the world."
              : "We solved this for humans in 1995. Why are your agents still living here?"}
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {!isTransformed ? (
            <motion.div
              key="retro"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              {/* File Transfer Visualization */}
              <div
                className="relative rounded-xl p-8 overflow-hidden"
                style={{ background: "rgba(0,128,128,0.1)", border: "1px solid rgba(0,128,128,0.3)" }}
              >
                {/* Flying folder */}
                <div className="relative h-48 flex items-center justify-around">
                  <CRTMonitor label="Agent-A" status="ready">
                    <div className="flex items-center justify-center h-full">
                      <Win95Window title="Sending..." className="scale-[0.6] origin-center">
                        <Win95ProgressBar
                          progress={folderProgress * 100}
                          label={`Sending context... ${Math.round(folderProgress * 100)}%`}
                        />
                      </Win95Window>
                    </div>
                  </CRTMonitor>

                  <FlyingFolder
                    isFlying={folderFlying}
                    progress={folderProgress}
                    failed={folderFailed}
                    fromX={120}
                    toX={280}
                  />

                  <CRTMonitor label="Agent-B" status={pc2Status}>
                    <BlueScreen visible={showBSOD} />
                    {!showBSOD && (
                      <div className="flex items-center justify-center h-full">
                        {pc2Status === "busy" && (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="text-white"
                          >
                            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" />
                            </svg>
                          </motion.div>
                        )}
                        {pc2Status === "waiting" && (
                          <span className="text-white/40 text-[10px] text-center">
                            Waiting for<br />connection...
                          </span>
                        )}
                      </div>
                    )}
                  </CRTMonitor>

                  <CRTMonitor label="Agent-C" status="waiting" isOff={showBSOD}>
                    <div className="flex items-center justify-center h-full">
                      <span className="text-white/40 text-[10px]">Queued</span>
                    </div>
                  </CRTMonitor>
                </div>

                <ErrorModal visible={showError} message="Agent not responding. Message lost forever." />
              </div>

              {/* Counter and Alert */}
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <LCDCounter value={packetsLost.toLocaleString()} label="Packets Lost" />
                <RetroAlert message="Synchronous calls are dial-up architecture in a broadband world." />
              </div>

              {/* Upgrade Button */}
              <div className="flex justify-center pt-8">
                <UpgradeButton onClick={handleUpgrade} />
              </div>
            </motion.div>
          ) : (
            <ModernEmailSection />
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
