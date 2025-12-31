"use client";

import { useEffect, useMemo, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import type { ISourceOptions } from "@tsparticles/engine";

export function ChartParticles() {
  const [init, setInit] = useState(false);

  // Initialize engine once
  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => setInit(true));
  }, []);

  // Particle configuration
  const options: ISourceOptions = useMemo(
    () => ({
      fullScreen: false,
      background: { color: { value: "transparent" } },
      fpsLimit: 60,
      particles: {
        number: {
          value: 60,
          density: { enable: true, width: 800, height: 400 },
        },
        color: {
          value: ["#00f5d4", "#8b5cf6"],
        },
        shape: { type: "circle" },
        opacity: {
          value: { min: 0.2, max: 0.5 },
        },
        size: {
          value: { min: 1, max: 2.5 },
        },
        move: {
          enable: true,
          speed: 0.4,
          direction: "right",
          straight: false,
          outModes: {
            default: "out",
            left: "out",
            right: "out",
            top: "bounce",
            bottom: "bounce",
          },
          random: true,
        },
        links: {
          enable: true,
          distance: 100,
          color: "#00f5d4",
          opacity: 0.15,
          width: 1,
        },
      },
      interactivity: {
        events: {
          onHover: {
            enable: true,
            mode: "grab",
          },
        },
        modes: {
          grab: {
            distance: 120,
            links: {
              opacity: 0.4,
              color: "#8b5cf6",
            },
          },
        },
      },
      detectRetina: true,
    }),
    []
  );

  if (!init) return null;

  return (
    <Particles
      id="chart-particles"
      className="absolute inset-0 z-0"
      options={options}
    />
  );
}
