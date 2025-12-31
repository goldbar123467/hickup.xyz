"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Fake company names for social proof
const companies = [
  "Stripe", "Vercel", "Linear", "Notion", "Figma", "Retool", "Supabase",
  "Railway", "Planetscale", "Resend", "Clerk", "Neon", "Upstash", "Axiom",
  "Inngest", "Trigger.dev", "Knock", "Loops", "Dub", "Cal.com", "Posthog",
];

const actions = [
  { text: "connected {n} agents to shared memory", icon: "🧠" },
  { text: "deployed multi-agent workflow", icon: "🔄" },
  { text: "enabled RAG knowledge sync", icon: "📚" },
  { text: "activated agent email protocol", icon: "📨" },
  { text: "upgraded to enterprise fleet", icon: "🚀" },
];

interface Toast {
  id: number;
  company: string;
  action: string;
  icon: string;
  count?: number;
  timestamp: string;
}

function LiveToast({ toast, onDismiss }: { toast: Toast; onDismiss: (id: number) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), 5000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 100, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.9 }}
      className="glass rounded-xl p-4 max-w-sm border border-primary/20 shadow-[0_0_30px_rgba(0,245,212,0.15)]"
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl">{toast.icon}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm">
            <span className="font-semibold text-primary">{toast.company}</span>
            <span className="text-white/70"> {toast.action}</span>
          </p>
          <p className="text-xs text-white/40 mt-1">{toast.timestamp}</p>
        </div>
        <div className="flex-shrink-0">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [enabled, setEnabled] = useState(false);

  // Delay start to not overwhelm on page load
  useEffect(() => {
    const timer = setTimeout(() => setEnabled(true), 4000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const createToast = () => {
      const company = companies[Math.floor(Math.random() * companies.length)];
      const actionTemplate = actions[Math.floor(Math.random() * actions.length)];
      const count = Math.floor(Math.random() * 20) + 3;
      const action = actionTemplate.text.replace("{n}", count.toString());

      const now = new Date();
      const timestamp = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')} · just now`;

      const toast: Toast = {
        id: Date.now(),
        company,
        action,
        icon: actionTemplate.icon,
        count,
        timestamp,
      };

      setToasts(prev => [...prev.slice(-2), toast]);
    };

    // First toast after 3s
    const initialTimer = setTimeout(createToast, 3000);

    // Then every 12-22 seconds (30% slower)
    const interval = setInterval(() => {
      createToast();
    }, 12000 + Math.random() * 10000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [enabled]);

  const dismissToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
      <AnimatePresence>
        {toasts.map(toast => (
          <LiveToast
            key={toast.id}
            toast={toast}
            onDismiss={dismissToast}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

export function DeploymentCounter() {
  const [count, setCount] = useState(847);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const increment = Math.floor(Math.random() * 4) + 1;
      setCount(c => c + increment);
      setIsUpdating(true);
    }, 5000 + Math.random() * 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center justify-center gap-3 mb-8"
    >
      <span className="relative flex h-3 w-3">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
        <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
      </span>
      <span className="text-white/60">
        <motion.span
          className="font-mono font-bold text-lg text-white transition-colors duration-300"
          animate={{
            scale: isUpdating ? [1, 1.08, 1] : 1,
            color: isUpdating ? ["#ffffff", "#00f5d4", "#ffffff"] : "#ffffff"
          }}
          transition={{ duration: 0.4 }}
          onAnimationComplete={() => setIsUpdating(false)}
        >
          {count.toLocaleString()}
        </motion.span>
        <span className="text-white/60 ml-1">agents deployed this week</span>
      </span>
    </motion.div>
  );
}

// Activity data for each pillar
interface ActivityItem {
  label: string;
  value: number;
  max: number;
  unit?: string;
}

function ActivityFeed({ activities, color }: { activities: ActivityItem[]; color: string }) {
  return (
    <div className="space-y-2 mt-4 pt-4 border-t border-white/[0.06]">
      {activities.map((item, i) => (
        <div key={i} className="flex items-center justify-between text-xs">
          <span className="text-white/50">{item.label}</span>
          <div className="flex items-center gap-2">
            <div className="w-16 h-1 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: color }}
                initial={{ width: 0 }}
                whileInView={{ width: `${(item.value / item.max) * 100}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: i * 0.1 }}
              />
            </div>
            <span className="text-white/70 font-mono w-12 text-right">
              {item.value}{item.unit || ''}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function PulseRing({ color, delay = 0 }: { color: string; delay?: number }) {
  return (
    <div className="absolute -inset-1 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
      <motion.div
        className="absolute inset-0 rounded-2xl"
        style={{
          border: `1px solid ${color}`,
          boxShadow: `0 0 20px ${color}40`,
        }}
        animate={{
          scale: [1, 1.02, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 2,
          delay,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}

function ConnectionLine() {
  return (
    <svg
      className="absolute top-1/2 -translate-y-1/2 left-full w-6 h-16 hidden md:block"
      style={{ marginLeft: '-0.75rem' }}
    >
      <motion.path
        d="M 0 32 Q 12 32, 24 32"
        stroke="url(#lineGradient)"
        strokeWidth="1"
        fill="none"
        strokeDasharray="4 4"
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 0.5 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
      />
      <defs>
        <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#00f5d4" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
      {/* Traveling dot */}
      <motion.circle
        r="2"
        fill="#00f5d4"
        initial={{ cx: 0, cy: 32 }}
        animate={{ cx: [0, 24, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
    </svg>
  );
}

interface LivePillarCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
  colorClass: string;
  activities: ActivityItem[];
  delay?: number;
  showConnection?: boolean;
  messageCount: number;
}

export function LivePillarCard({
  icon,
  title,
  description,
  color,
  colorClass,
  activities,
  delay = 0,
  showConnection = false,
  messageCount,
}: LivePillarCardProps) {
  const [count, setCount] = useState(messageCount);

  useEffect(() => {
    const interval = setInterval(() => {
      setCount(c => c + Math.floor(Math.random() * 3) + 1);
    }, 3500 + Math.random() * 4500); // 30% slower
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      className="relative group"
    >
      <PulseRing color={color} delay={delay} />

      <div className="glass rounded-2xl p-8 hover:bg-white/[0.05] transition-all duration-300 relative h-full">
        {/* Live indicator */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span
              className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
              style={{ background: color }}
            />
            <span
              className="relative inline-flex rounded-full h-2 w-2"
              style={{ background: color }}
            />
          </span>
          <span className="text-[10px] text-white/40 font-mono">{count.toLocaleString()} ops</span>
        </div>

        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center mb-6"
          style={{ background: `linear-gradient(135deg, ${color}33, ${color}0d)` }}
        >
          {icon}
        </div>

        <h3 className="text-2xl font-bold mb-4">{title}</h3>
        <p className="text-white/60 leading-relaxed">{description}</p>

        <ActivityFeed activities={activities} color={color} />
      </div>

      {showConnection && <ConnectionLine />}
    </motion.div>
  );
}

// SVG Icons
export const DatabaseIcon = ({ color }: { color: string }) => (
  <svg className="w-6 h-6" style={{ color }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
  </svg>
);

export const AgentsIcon = ({ color }: { color: string }) => (
  <svg className="w-6 h-6" style={{ color }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

export const EmailIcon = ({ color }: { color: string }) => (
  <svg className="w-6 h-6" style={{ color }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);
