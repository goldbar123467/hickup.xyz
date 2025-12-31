"use client";

import { useEffect, useRef, useState } from "react";

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseOpacity: number;
  opacity: number;
}

const NODE_COUNT = 45;
const CONNECTION_DISTANCE = 150;
const CURSOR_ACTIVATION_RADIUS = 200;
const CURSOR_INFLUENCE_STRENGTH = 0.15;

export function NeuralField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<Node[]>([]);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const animationRef = useRef<number>();
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Initialize nodes
  useEffect(() => {
    const initNodes = () => {
      const nodes: Node[] = [];
      for (let i = 0; i < NODE_COUNT; i++) {
        nodes.push({
          x: Math.random() * dimensions.width,
          y: Math.random() * dimensions.height,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          radius: Math.random() * 2 + 1,
          baseOpacity: Math.random() * 0.3 + 0.1,
          opacity: 0.1,
        });
      }
      nodesRef.current = nodes;
    };

    if (dimensions.width > 0 && dimensions.height > 0) {
      initNodes();
    }
  }, [dimensions]);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        setDimensions({ width: rect.width, height: rect.height });
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Handle mouse move
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        mouseRef.current = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        };
      }
    };

    const handleMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || dimensions.width === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas resolution
    const dpr = window.devicePixelRatio || 1;
    canvas.width = dimensions.width * dpr;
    canvas.height = dimensions.height * dpr;
    ctx.scale(dpr, dpr);

    const animate = () => {
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);

      const nodes = nodesRef.current;
      const mouse = mouseRef.current;

      // Update and draw nodes
      for (const node of nodes) {
        // Move node
        node.x += node.vx;
        node.y += node.vy;

        // Bounce off edges
        if (node.x < 0 || node.x > dimensions.width) node.vx *= -1;
        if (node.y < 0 || node.y > dimensions.height) node.vy *= -1;

        // Keep in bounds
        node.x = Math.max(0, Math.min(dimensions.width, node.x));
        node.y = Math.max(0, Math.min(dimensions.height, node.y));

        // Calculate distance to cursor
        const dx = mouse.x - node.x;
        const dy = mouse.y - node.y;
        const distToCursor = Math.sqrt(dx * dx + dy * dy);

        // Activate nodes near cursor
        const targetOpacity =
          distToCursor < CURSOR_ACTIVATION_RADIUS
            ? node.baseOpacity + (1 - distToCursor / CURSOR_ACTIVATION_RADIUS) * 0.6
            : node.baseOpacity;

        // Smooth opacity transition
        node.opacity += (targetOpacity - node.opacity) * 0.08;

        // Slight attraction to cursor
        if (distToCursor < CURSOR_ACTIVATION_RADIUS && distToCursor > 20) {
          node.vx += (dx / distToCursor) * CURSOR_INFLUENCE_STRENGTH * 0.01;
          node.vy += (dy / distToCursor) * CURSOR_INFLUENCE_STRENGTH * 0.01;
        }

        // Dampen velocity
        node.vx *= 0.99;
        node.vy *= 0.99;

        // Draw node
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 245, 212, ${node.opacity})`;
        ctx.fill();
      }

      // Draw connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const nodeA = nodes[i];
          const nodeB = nodes[j];

          const dx = nodeA.x - nodeB.x;
          const dy = nodeA.y - nodeB.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < CONNECTION_DISTANCE) {
            // Check if either node is activated
            const avgOpacity = (nodeA.opacity + nodeB.opacity) / 2;
            const connectionOpacity = (1 - dist / CONNECTION_DISTANCE) * avgOpacity * 0.5;

            if (connectionOpacity > 0.02) {
              ctx.beginPath();
              ctx.moveTo(nodeA.x, nodeA.y);
              ctx.lineTo(nodeB.x, nodeB.y);

              // Gradient from cyan to purple based on position
              const gradient = ctx.createLinearGradient(
                nodeA.x,
                nodeA.y,
                nodeB.x,
                nodeB.y
              );
              gradient.addColorStop(0, `rgba(0, 245, 212, ${connectionOpacity})`);
              gradient.addColorStop(1, `rgba(139, 92, 246, ${connectionOpacity})`);

              ctx.strokeStyle = gradient;
              ctx.lineWidth = 1;
              ctx.stroke();
            }
          }
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [dimensions]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: 0.7 }}
    />
  );
}
