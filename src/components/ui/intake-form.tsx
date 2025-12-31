"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const USE_CASES = [
  "RAG / Knowledge Management",
  "Multi-Agent Coordination",
  "Agent-to-Agent Communication",
  "Custom MCP Tools",
  "Full Stack Agent Infrastructure",
  "Other",
];

const AGENT_COUNTS = [
  "Just exploring",
  "1-5 agents",
  "6-20 agents",
  "20+ agents",
  "Enterprise scale",
];

export function IntakeForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    agentCount: "",
    useCase: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to send");
      }

      setStatus("success");
      setFormData({
        name: "",
        email: "",
        company: "",
        agentCount: "",
        useCase: "",
        message: "",
      });
    } catch {
      setStatus("error");
      setErrorMessage("Something went wrong. Please try again or email us directly.");
    }
  };

  const inputClass =
    "w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all text-sm sm:text-base";
  const labelClass = "block text-sm text-white/60 mb-2";

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="glass rounded-2xl p-6 sm:p-8 max-w-2xl mx-auto"
    >
      <div className="text-center mb-8">
        <h3 className="text-xl sm:text-2xl font-bold mb-2">
          Tell us about your agent stack
        </h3>
        <p className="text-white/50 text-sm sm:text-base">
          We will get back to you within 24 hours.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {status === "success" ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-12"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4"
            >
              <svg
                className="w-8 h-8 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </motion.div>
            <h4 className="text-xl font-bold text-white mb-2">Message sent!</h4>
            <p className="text-white/50">We will be in touch soon.</p>
            <button
              onClick={() => setStatus("idle")}
              className="mt-6 text-primary hover:text-primary/80 text-sm underline"
            >
              Send another message
            </button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
              <div>
                <label className={labelClass}>Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Your name"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="you@company.com"
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Company</label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) =>
                  setFormData({ ...formData, company: e.target.value })
                }
                placeholder="Company name"
                className={inputClass}
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
              <div>
                <label className={labelClass}>Current agent count</label>
                <select
                  value={formData.agentCount}
                  onChange={(e) =>
                    setFormData({ ...formData, agentCount: e.target.value })
                  }
                  className={inputClass}
                >
                  <option value="">Select...</option>
                  {AGENT_COUNTS.map((count) => (
                    <option key={count} value={count}>
                      {count}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Primary use case</label>
                <select
                  value={formData.useCase}
                  onChange={(e) =>
                    setFormData({ ...formData, useCase: e.target.value })
                  }
                  className={inputClass}
                >
                  <option value="">Select...</option>
                  {USE_CASES.map((uc) => (
                    <option key={uc} value={uc}>
                      {uc}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className={labelClass}>What are you building? *</label>
              <textarea
                required
                rows={4}
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                placeholder="Tell us about your agent infrastructure needs, current challenges, or what you're trying to build..."
                className={`${inputClass} resize-none`}
              />
            </div>

            {status === "error" && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-400 text-sm"
              >
                {errorMessage}
              </motion.p>
            )}

            <motion.button
              type="submit"
              disabled={status === "loading"}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-primary to-secondary text-background font-semibold py-3 sm:py-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              {status === "loading" ? (
                <span className="flex items-center justify-center gap-2">
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full"
                  />
                  Sending...
                </span>
              ) : (
                "Send Message"
              )}
            </motion.button>

            <p className="text-center text-white/30 text-xs">
              Or email us directly at{" "}
              <a
                href="mailto:clarkkitchen22@gmail.com"
                className="text-primary hover:underline"
              >
                clarkkitchen22@gmail.com
              </a>
            </p>
          </motion.form>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
