"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  ReferenceLine,
} from "recharts";
import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
import { ChartParticles } from "./chart-particles";

// Monthly data telling the story
const data = [
  { month: "Jan 25", adoption: 8, enterprises: 12, label: "2025", index: 0 },
  { month: "Mar 25", adoption: 10, enterprises: 15, label: "", index: 1 },
  { month: "Jun 25", adoption: 14, enterprises: 19, label: "", index: 2 },
  { month: "Sep 25", adoption: 18, enterprises: 24, label: "", index: 3 },
  { month: "Dec 25", adoption: 22, enterprises: 29, label: "", index: 4 },
  { month: "Mar 26", adoption: 25, enterprises: 33, label: "2026", index: 5 },
  { month: "Jun 26", adoption: 23, enterprises: 31, label: "", index: 6 },
  { month: "Aug 26", adoption: 21, enterprises: 28, label: "", index: 7 },
  { month: "Nov 26", adoption: 28, enterprises: 38, label: "", index: 8, event: "breakthrough" },
  { month: "Feb 27", adoption: 38, enterprises: 48, label: "2027", index: 9 },
  { month: "Jun 27", adoption: 47, enterprises: 58, label: "", index: 10 },
  { month: "Oct 27", adoption: 54, enterprises: 66, label: "", index: 11 },
  { month: "Feb 28", adoption: 61, enterprises: 73, label: "2028", index: 12, event: "closing" },
  { month: "Jun 28", adoption: 68, enterprises: 79, label: "", index: 13 },
  { month: "Oct 28", adoption: 74, enterprises: 84, label: "", index: 14 },
  { month: "Feb 29", adoption: 79, enterprises: 88, label: "2029", index: 15 },
  { month: "Jun 29", adoption: 83, enterprises: 91, label: "", index: 16 },
  { month: "Oct 29", adoption: 86, enterprises: 93, label: "", index: 17 },
  { month: "Mar 30", adoption: 89, enterprises: 95, label: "2030", index: 18 },
  { month: "Jun 30", adoption: 91, enterprises: 96, label: "", index: 19 },
  { month: "Dec 30", adoption: 94, enterprises: 98, label: "", index: 20 },
];

const CURRENT_INDEX = 4; // Dec 25

// Event cards content
const eventCards: Record<string, { title: string; subtitle: string }> = {
  breakthrough: {
    title: "The Breakthrough",
    subtitle: "Multi-agent coordination solved. Mass adoption begins.",
  },
  closing: {
    title: "Window Closing",
    subtitle: "73% of competitors now have agent fleets.",
  },
};

function EventCard({
  event,
  isVisible,
  position
}: {
  event: { title: string; subtitle: string };
  isVisible: boolean;
  position: { x: number; y: number };
}) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="absolute z-20 pointer-events-none"
          style={{ left: position.x, top: position.y }}
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <div className="glass rounded-lg px-4 py-3 border border-primary/30 shadow-[0_0_30px_rgba(0,245,212,0.2)]">
            <p className="text-primary font-bold text-sm">{event.title}</p>
            <p className="text-white/60 text-xs mt-1">{event.subtitle}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function CompanyCounter({ ahead, behind }: { ahead: number; behind: number }) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6 text-xs sm:text-sm">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-secondary" />
        <span className="text-white/50">
          <span className="font-mono font-bold text-secondary">{ahead}</span> companies ahead
        </span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-primary" />
        <span className="text-white/50">
          <span className="font-mono font-bold text-primary">{behind}</span> companies behind
        </span>
      </div>
    </div>
  );
}

function LiveTicker() {
  const [count, setCount] = useState(2847);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const increment = Math.floor(Math.random() * 3) + 1;
      setCount((c) => c + increment);
      setIsUpdating(true);
    }, 4000 + Math.random() * 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      className="flex items-center gap-2 sm:gap-3"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
    >
      <span className="relative flex h-2 w-2 sm:h-3 sm:w-3">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 sm:h-3 sm:w-3 bg-primary"></span>
      </span>
      <span className="text-white/60 text-xs sm:text-sm">
        <motion.span
          className="font-mono font-bold text-white"
          animate={{
            scale: isUpdating ? [1, 1.08, 1] : 1,
            color: isUpdating ? ["#ffffff", "#00f5d4", "#ffffff"] : "#ffffff",
          }}
          transition={{ duration: 0.4 }}
          onAnimationComplete={() => setIsUpdating(false)}
        >
          {count.toLocaleString()}
        </motion.span>
        {" "}adopted this week
      </span>
    </motion.div>
  );
}

export function AdoptionChart() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [activeEvent, setActiveEvent] = useState<string | null>(null);

  // Scrubber state
  const scrubberX = useMotionValue(0);
  const scrubberProgress = useMotionValue(0);
  const springX = useSpring(scrubberX, { stiffness: 300, damping: 30 });
  const [isDragging, setIsDragging] = useState(false);
  const [scrubberValue, setScrubberValue] = useState(0);

  // Company counter
  const [companyStats, setCompanyStats] = useState({ ahead: 127, behind: 23 });

  const chartPadding = { left: 40, right: 20, top: 30, bottom: 30 };

  // Handle resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({ width: rect.width, height: rect.height });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // Update company stats based on scrubber
  useEffect(() => {
    const baseAhead = 127;
    const baseBehind = 23;
    const progress = scrubberValue;

    // As you scrub forward, more companies get ahead
    const aheadMultiplier = 1 + progress * 3;
    const behindMultiplier = Math.max(0.1, 1 - progress * 0.8);

    setCompanyStats({
      ahead: Math.floor(baseAhead * aheadMultiplier),
      behind: Math.floor(baseBehind * behindMultiplier),
    });

    // Trigger events based on scrubber position
    if (progress > 0.35 && progress < 0.5) {
      setActiveEvent("breakthrough");
    } else if (progress > 0.7) {
      setActiveEvent("closing");
    } else {
      setActiveEvent(null);
    }
  }, [scrubberValue]);

  // Calculate scrubber position
  const chartWidth = dimensions.width - chartPadding.left - chartPadding.right;
  const currentX = chartPadding.left + (CURRENT_INDEX / (data.length - 1)) * chartWidth;
  const maxDragX = chartWidth - (CURRENT_INDEX / (data.length - 1)) * chartWidth;

  const handleDrag = useCallback((_: any, info: { offset: { x: number } }) => {
    const progress = Math.max(0, Math.min(1, info.offset.x / maxDragX));
    scrubberProgress.set(progress);
    setScrubberValue(progress);
  }, [maxDragX, scrubberProgress]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    // Snap back to present
    scrubberX.set(0);
    scrubberProgress.set(0);
    setScrubberValue(0);
  }, [scrubberX, scrubberProgress]);

  // Calculate event card positions
  const getEventPosition = (eventType: string) => {
    const eventIndex = data.findIndex((d) => d.event === eventType);
    if (eventIndex === -1) return { x: 0, y: 0 };

    const x = chartPadding.left + (eventIndex / (data.length - 1)) * chartWidth;
    const y = chartPadding.top + 40;
    return { x: x - 80, y };
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      onViewportEnter={() => setIsVisible(true)}
      className="glass rounded-2xl p-6 md:p-8"
    >
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
        <div>
          <h3 className="text-xl sm:text-2xl font-bold mb-2">AI Agent Adoption Forecast</h3>
          <p className="text-white/60 text-xs sm:text-sm">
            Drag the timeline to see the future unfold.
          </p>
        </div>
        <LiveTicker />
      </div>

      <CompanyCounter ahead={companyStats.ahead} behind={companyStats.behind} />

      <div
        ref={containerRef}
        className="relative h-[320px] md:h-[400px] w-full mt-6"
      >
        {/* Future blur overlay */}
        <div
          className="absolute pointer-events-none z-10 transition-all duration-100"
          style={{
            left: currentX,
            top: chartPadding.top,
            right: chartPadding.right,
            bottom: chartPadding.bottom,
            backdropFilter: isDragging ? "none" : "blur(2px)",
            background: isDragging ? "transparent" : "linear-gradient(90deg, transparent, rgba(8,8,12,0.3) 20%)",
          }}
        />

        {/* Particles */}
        {isVisible && <ChartParticles />}

        {/* Event cards */}
        {activeEvent && eventCards[activeEvent] && (
          <EventCard
            event={eventCards[activeEvent]}
            isVisible={true}
            position={getEventPosition(activeEvent)}
          />
        )}

        {/* Main chart */}
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={chartPadding}>
            <defs>
              <linearGradient id="primaryGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00f5d4" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#00f5d4" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="secondaryGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gapGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ec4899" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#ec4899" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }}
              dy={10}
              interval={dimensions.width < 500 ? 4 : "preserveStartEnd"}
              tickFormatter={(value) => dimensions.width < 400 ? value.slice(-2) : value}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }}
              tickFormatter={(value) => `${value}%`}
              domain={[0, 100]}
            />

            <ReferenceLine
              x="Nov 26"
              stroke="#00f5d4"
              strokeDasharray="4 4"
              strokeOpacity={0.4}
            />

            <Area
              type="monotone"
              dataKey="adoption"
              stroke="#00f5d4"
              strokeWidth={2}
              fill="url(#primaryGradient)"
              isAnimationActive={false}
            />
            <Area
              type="monotone"
              dataKey="enterprises"
              stroke="#8b5cf6"
              strokeWidth={2}
              fill="url(#secondaryGradient)"
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>

        {/* Draggable scrubber */}
        {dimensions.width > 0 && (
          <motion.div
            className="absolute z-30 cursor-grab active:cursor-grabbing"
            style={{
              left: currentX - 12,
              top: chartPadding.top + (dimensions.height - chartPadding.top - chartPadding.bottom) * (1 - data[CURRENT_INDEX].adoption / 100) - 12,
              x: springX,
            }}
            drag="x"
            dragConstraints={{ left: 0, right: maxDragX }}
            dragElastic={0.1}
            onDragStart={() => setIsDragging(true)}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
          >
            {/* Main scrubber dot */}
            <motion.div
              className="relative w-6 h-6"
              animate={{
                scale: isDragging ? 1.2 : 1,
              }}
            >
              {/* Outer pulse */}
              <motion.div
                className="absolute inset-0 rounded-full bg-tertiary"
                animate={{
                  scale: [1, 1.8, 1],
                  opacity: [0.6, 0, 0.6],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              {/* Core dot */}
              <div className="absolute inset-1 rounded-full bg-tertiary shadow-[0_0_20px_rgba(236,72,153,0.8)]" />
              <div className="absolute inset-2 rounded-full bg-white" />
            </motion.div>

            {/* Label */}
            <motion.div
              className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap"
              animate={{ opacity: isDragging ? 1 : 0.7 }}
            >
              <span className="text-xs font-medium text-tertiary bg-background/80 px-2 py-1 rounded">
                {isDragging ? "Drag to explore →" : "You are here"}
              </span>
            </motion.div>
          </motion.div>
        )}

        {/* Window closed message */}
        <AnimatePresence>
          {scrubberValue > 0.8 && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="glass rounded-xl px-6 py-4 border border-tertiary/50">
                <p className="text-tertiary font-bold text-lg">The window is closed.</p>
                <p className="text-white/50 text-sm mt-1">Release to return to present.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 sm:gap-6 mt-6 text-xs sm:text-sm">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-primary" />
          <span className="text-white/60">AI agent adoption</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-secondary" />
          <span className="text-white/60">Enterprise multi-agent</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2 sm:h-3 sm:w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 sm:h-3 sm:w-3 bg-tertiary"></span>
          </span>
          <span className="text-white/60">Drag to explore</span>
        </div>
      </div>

      <p className="text-center text-white/30 text-xs mt-4">
        The future is uncertain until you drag through it.
      </p>
    </motion.div>
  );
}
