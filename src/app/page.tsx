"use client";

import { motion } from "framer-motion";
import { AdoptionChart } from "@/components/ui/adoption-chart";
import {
  ToastContainer,
  DeploymentCounter,
  LivePillarCard,
  DatabaseIcon,
  AgentsIcon,
  EmailIcon,
} from "@/components/ui/live-dashboard";
import { InfrastructureCard } from "@/components/ui/infrastructure-card";
import { CyclingText } from "@/components/ui/cycling-text";
import { NeuralField } from "@/components/ui/neural-field";
import { MagneticButton, RippleContainer } from "@/components/ui/magnetic-button";
import { RAGCrisisSection } from "@/components/ui/rag-crisis";
import { AgentDatabaseSection } from "@/components/ui/agent-database";
import { AgentEmailSection } from "@/components/ui/agent-email";

function TextReveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
    >
      {children}
    </motion.div>
  );
}

function GlassCard({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      className="glass rounded-2xl p-8 hover:bg-white/[0.05] transition-colors duration-300"
    >
      {children}
    </motion.div>
  );
}

function GradientText({ children }: { children: React.ReactNode }) {
  return (
    <span className="bg-gradient-to-r from-primary via-secondary to-tertiary bg-clip-text text-transparent">
      {children}
    </span>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-background pt-16">
      {/* Live Activity Toasts */}
      <ToastContainer />
      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col justify-center py-32 px-6 overflow-hidden">
        {/* Neural Field Background */}
        <NeuralField />

        <RippleContainer>
        <div className="relative z-10 max-w-5xl mx-auto">
          <TextReveal>
            <p className="text-primary font-medium mb-4 tracking-wide">MCP TOOLS INFRASTRUCTURE</p>
          </TextReveal>

          <TextReveal delay={0.1}>
            <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold mb-6 leading-tight">
              AI agents answer <CyclingText />
            </h1>
          </TextReveal>

          <TextReveal delay={0.2}>
            <h2 className="text-xl sm:text-3xl md:text-5xl font-bold mb-8 text-white/80">
              MCP tools answer <span className="text-white">how do we get AI agents to do what we want</span>
            </h2>
          </TextReveal>

          <TextReveal delay={0.3}>
            <p className="text-base sm:text-xl text-white/60 max-w-2xl mb-12">
              We build the infrastructure that makes AI agents reliable, coordinated, and controllable.
              Not wrappers. Not abstractions. The actual systems that run underneath.
            </p>
          </TextReveal>

          <TextReveal delay={0.4}>
            <MagneticButton href="mailto:clarkkitchen22@gmail.com">
              Talk to us about your agent stack
            </MagneticButton>
          </TextReveal>
        </div>
        </RippleContainer>
      </section>

      {/* Adoption Forecast Section */}
      <section id="adoption" className="py-32 px-6">
        <div className="max-w-4xl mx-auto">
          <TextReveal>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-center">
              The shift is <GradientText>already happening</GradientText>
            </h2>
          </TextReveal>
          <TextReveal delay={0.1}>
            <p className="text-xl text-white/60 text-center max-w-2xl mx-auto mb-12">
              By 2030, AI agents will be as common as cloud infrastructure. The question
              is not whether your business will use them, but whether you will control them.
            </p>
          </TextReveal>
          <AdoptionChart />
        </div>
      </section>

      {/* Three Pillars Section - Live Dashboard */}
      <section id="pillars" className="py-16 sm:py-32 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <TextReveal>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-4 text-center">
              Three pillars of <GradientText>agent infrastructure</GradientText>
            </h2>
          </TextReveal>

          <TextReveal delay={0.1}>
            <p className="text-base sm:text-xl text-white/60 text-center max-w-2xl mx-auto mb-8">
              Every production agent system needs memory, coordination, and communication.
              We build each layer to work independently or together.
            </p>
          </TextReveal>

          <DeploymentCounter />

          <div className="grid md:grid-cols-3 gap-4 sm:gap-6">
            <LivePillarCard
              icon={<DatabaseIcon color="#00f5d4" />}
              title="RAG Knowledge System"
              description="Self-improving memory that learns what good context looks like. Every retrieval trains the next one. Quality gates reject noise before it pollutes your knowledge base."
              color="#00f5d4"
              colorClass="primary"
              delay={0.2}
              showConnection
              messageCount={12847}
              activities={[
                { label: "Retrieval accuracy", value: 94, max: 100, unit: "%" },
                { label: "Quality score avg", value: 0.87, max: 1, unit: "" },
                { label: "Active memories", value: 48, max: 100, unit: "k" },
              ]}
            />

            <LivePillarCard
              icon={<AgentsIcon color="#8b5cf6" />}
              title="Multi-Agent Database"
              description="Persistent state that survives between agent runs. Agents share context, hand off tasks, and build on each other&apos;s work. Institutional memory for your fleet."
              color="#8b5cf6"
              colorClass="secondary"
              delay={0.3}
              showConnection
              messageCount={8432}
              activities={[
                { label: "Active agents", value: 127, max: 200, unit: "" },
                { label: "Task handoffs/hr", value: 342, max: 500, unit: "" },
                { label: "Context sync", value: 99.2, max: 100, unit: "%" },
              ]}
            />

            <LivePillarCard
              icon={<EmailIcon color="#ec4899" />}
              title="Agent Email Protocol"
              description="Asynchronous messaging between agents that just works. Route tasks to specialists with delivery guarantees, not brittle function calls."
              color="#ec4899"
              colorClass="tertiary"
              delay={0.4}
              messageCount={24156}
              activities={[
                { label: "Messages/min", value: 847, max: 1000, unit: "" },
                { label: "Delivery rate", value: 99.9, max: 100, unit: "%" },
                { label: "Avg latency", value: 23, max: 100, unit: "ms" },
              ]}
            />
          </div>
        </div>
      </section>

      {/* RAG Knowledge System Deep Dive */}
      <RAGCrisisSection />

      {/* Multi-Agent Database Deep Dive */}
      <AgentDatabaseSection />

      {/* Agent Email Protocol Deep Dive */}
      <AgentEmailSection />

      {/* Philosophy Section - X-Ray + Live Pulse */}
      <section id="philosophy" className="py-32 px-6">
        <div className="max-w-4xl mx-auto">
          <InfrastructureCard />
        </div>
      </section>

      {/* CTA Section */}
      <section id="contact" className="py-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <TextReveal>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to build <GradientText>agent infrastructure</GradientText> that scales?
            </h2>
          </TextReveal>
          <TextReveal delay={0.1}>
            <p className="text-xl text-white/60 mb-10 max-w-2xl mx-auto">
              We work directly with engineering teams to design and deploy custom MCP tools.
              No sales calls. Just a conversation about what you&apos;re building.
            </p>
          </TextReveal>
          <TextReveal delay={0.2}>
            <MagneticButton href="mailto:clarkkitchen22@gmail.com">
              Talk to us about your agent stack
            </MagneticButton>
          </TextReveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/[0.08]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/40 text-sm">
            © {new Date().getFullYear()} Hickup. Building agent infrastructure.
          </p>
          <p className="text-white/40 text-sm">
            <a href="mailto:clarkkitchen22@gmail.com" className="hover:text-white/60 transition-colors">
              clarkkitchen22@gmail.com
            </a>
          </p>
        </div>
      </footer>
    </main>
  );
}
