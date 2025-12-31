"use client";

import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";

// Hidden code snippets revealed on hover
const hiddenCode = `-- memories table schema
CREATE TABLE memories (
  id UUID PRIMARY KEY,
  content TEXT NOT NULL,
  embedding VECTOR(768),
  predicted_quality FLOAT,
  usefulness_score FLOAT,
  tier tier_enum DEFAULT 'active',
  created_at TIMESTAMPTZ
);

-- Agent mail message queue
SELECT * FROM agent_messages
WHERE recipient = 'librarian'
  AND status = 'pending'
ORDER BY priority DESC;

-- Quality prediction
def extract_features(content):
    return {
        "length": len(content),
        "has_code": CODE_PATTERN.match,
        "specificity": calc_specificity(),
        "source_trust": get_weight()
    }`;

// Simulated activity logs
const activityLogs = [
  { type: "query", text: "Vector search → 23ms" },
  { type: "insert", text: "Memory stored → tier: core" },
  { type: "train", text: "Model retrain → v12" },
  { type: "message", text: "Handoff → librarian" },
  { type: "query", text: "Trace logged → #4,847" },
  { type: "score", text: "Quality gate → 0.87" },
];

function ActivityLog({ log, onComplete }: { log: typeof activityLogs[0]; onComplete: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 4000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  const colors: Record<string, string> = {
    query: "#00f5d4",
    insert: "#8b5cf6",
    train: "#ec4899",
    message: "#00f5d4",
    score: "#8b5cf6",
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: -20, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="absolute top-4 right-4 glass rounded-lg px-3 py-2 text-xs font-mono"
      style={{ borderColor: colors[log.type], borderWidth: 1 }}
    >
      <span style={{ color: colors[log.type] }}>●</span>{" "}
      <span className="text-white/70">{log.text}</span>
    </motion.div>
  );
}

export function InfrastructureCard() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [currentLog, setCurrentLog] = useState<typeof activityLogs[0] | null>(null);
  const [logKey, setLogKey] = useState(0);
  const [queryCount, setQueryCount] = useState(47);

  // Handle mouse move for X-ray effect
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  // Simulate live activity
  useEffect(() => {
    // Query counter
    const counterInterval = setInterval(() => {
      setQueryCount(c => c + Math.floor(Math.random() * 5) + 1);
    }, 2500);

    // Activity logs
    const logInterval = setInterval(() => {
      const randomLog = activityLogs[Math.floor(Math.random() * activityLogs.length)];
      setCurrentLog(randomLog);
      setLogKey(k => k + 1);
    }, 6000);

    // Initial log after delay
    const initialLog = setTimeout(() => {
      setCurrentLog(activityLogs[0]);
      setLogKey(1);
    }, 2500);

    return () => {
      clearInterval(counterInterval);
      clearInterval(logInterval);
      clearTimeout(initialLog);
    };
  }, []);

  return (
    <motion.div
      ref={containerRef}
      className="relative rounded-2xl overflow-hidden cursor-crosshair"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      {/* Animated gradient border */}
      <div className="absolute inset-0 rounded-2xl p-[1px] bg-gradient-to-r from-primary via-secondary to-tertiary opacity-50">
        <div className="w-full h-full rounded-2xl bg-background" />
      </div>

      {/* Flowing particles on corners */}
      {[0, 1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full z-10"
          style={{
            background: i % 2 === 0 ? "#00f5d4" : "#8b5cf6",
            boxShadow: `0 0 12px ${i % 2 === 0 ? "#00f5d4" : "#8b5cf6"}`,
            top: i < 2 ? 8 : "auto",
            bottom: i >= 2 ? 8 : "auto",
            left: i % 2 === 0 ? 8 : "auto",
            right: i % 2 === 1 ? 8 : "auto",
          }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2,
            delay: i * 0.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Main card content */}
      <div className="relative glass rounded-2xl p-8">
        {/* Live metrics badge */}
        <div className="absolute top-4 left-4 flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          <span className="text-xs font-mono text-white/50">
            <span className="text-primary font-bold tabular-nums">
              {queryCount}
            </span>
            {" "}queries / sec
          </span>
        </div>

        {/* Activity log notifications */}
        {currentLog && (
          <ActivityLog
            key={logKey}
            log={currentLog}
            onComplete={() => setCurrentLog(null)}
          />
        )}

        {/* Surface content (marketing copy) - fades where cursor reveals code */}
        <div
          className="relative z-10 pt-8 transition-opacity duration-100"
          style={{
            maskImage: isHovering
              ? `radial-gradient(ellipse 350px 300px at ${mousePos.x}px ${mousePos.y - 32}px, transparent 0%, transparent 50%, black 100%)`
              : "none",
            WebkitMaskImage: isHovering
              ? `radial-gradient(ellipse 350px 300px at ${mousePos.x}px ${mousePos.y - 32}px, transparent 0%, transparent 50%, black 100%)`
              : "none",
          }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Infrastructure, not wrappers
          </h2>
          <p className="text-lg text-white/70 leading-relaxed mb-6">
            Most agent tools add layers between you and the model. We build the systems that run underneath.
            The difference matters when you need to debug a production failure at 3am, or when you need
            to understand exactly why an agent made a specific decision.
          </p>
          <p className="text-lg text-white/70 leading-relaxed">
            We give you PostgreSQL tables you can query directly, message queues you can inspect,
            and quality models you can retrain. No black boxes. No vendor lock-in.
            Just solid infrastructure that you actually own.
          </p>
        </div>

        {/* Hidden layer (code) - revealed by cursor X-ray */}
        <div
          className="absolute inset-0 p-8 pt-16 overflow-hidden pointer-events-none transition-opacity duration-200"
          style={{
            opacity: isHovering ? 1 : 0,
            maskImage: `radial-gradient(ellipse 350px 300px at ${mousePos.x}px ${mousePos.y}px, black 0%, black 60%, transparent 100%)`,
            WebkitMaskImage: `radial-gradient(ellipse 350px 300px at ${mousePos.x}px ${mousePos.y}px, black 0%, black 60%, transparent 100%)`,
          }}
        >
          <pre className="font-mono text-sm text-primary leading-relaxed whitespace-pre-wrap">
            {hiddenCode}
          </pre>
        </div>

        {/* Subtle cursor glow effect */}
        <div
          className="absolute w-64 h-64 rounded-full pointer-events-none transition-opacity duration-200"
          style={{
            opacity: isHovering ? 1 : 0,
            background: "radial-gradient(circle, rgba(0,245,212,0.04) 0%, transparent 70%)",
            left: mousePos.x - 128,
            top: mousePos.y - 128,
          }}
        />

        {/* Hint text */}
        <p
          className="text-xs text-white/30 mt-6 text-center transition-opacity duration-300"
          style={{ opacity: isHovering ? 0 : 0.5 }}
        >
          hover to reveal the infrastructure beneath
        </p>
      </div>
    </motion.div>
  );
}
