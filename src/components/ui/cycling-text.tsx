"use client";

import { useState, useEffect, useRef } from "react";

const phrases = [
  "how does AI do something",
  "how does AI make decisions",
  "how does AI coordinate at scale",
  "how does AI stay reliable",
];

// Typing speed in ms per character
const TYPE_SPEED = 65;        // 30% slower typing to pull viewer in
const DELETE_SPEED = 25;      // Quick delete once they've read it
const PAUSE_BEFORE_DELETE = 5625;  // Long pause to let it sink in (50% more)
const PAUSE_BEFORE_TYPE = 500;     // Brief pause before next phrase

export function CyclingText() {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [showCursor, setShowCursor] = useState(true);
  const [hoveredIndices, setHoveredIndices] = useState<Set<number>>(new Set());
  const containerRef = useRef<HTMLSpanElement>(null);
  const charRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const currentPhrase = phrases[phraseIndex];

  // Cursor blink
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 530);
    return () => clearInterval(cursorInterval);
  }, []);

  // Typing logic
  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (!isDeleting) {
      if (displayText.length < currentPhrase.length) {
        timeout = setTimeout(() => {
          setDisplayText(currentPhrase.slice(0, displayText.length + 1));
        }, TYPE_SPEED);
      } else {
        timeout = setTimeout(() => {
          setIsDeleting(true);
        }, PAUSE_BEFORE_DELETE);
      }
    } else {
      if (displayText.length > 0) {
        timeout = setTimeout(() => {
          setDisplayText(displayText.slice(0, -1));
        }, DELETE_SPEED);
      } else {
        timeout = setTimeout(() => {
          setIsDeleting(false);
          setPhraseIndex((prev) => (prev + 1) % phrases.length);
        }, PAUSE_BEFORE_TYPE);
      }
    }

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, currentPhrase]);

  // Track mouse and find closest 2 characters
  const handleMouseMove = (e: React.MouseEvent) => {
    const mouseX = e.clientX;
    const mouseY = e.clientY;

    const distances: { index: number; dist: number }[] = [];

    charRefs.current.forEach((ref, index) => {
      if (ref) {
        const rect = ref.getBoundingClientRect();
        const charCenterX = rect.left + rect.width / 2;
        const charCenterY = rect.top + rect.height / 2;
        const dist = Math.sqrt(
          Math.pow(mouseX - charCenterX, 2) + Math.pow(mouseY - charCenterY, 2)
        );
        distances.push({ index, dist });
      }
    });

    // Sort by distance and get closest 2
    distances.sort((a, b) => a.dist - b.dist);
    const closest = distances.slice(0, 2).map((d) => d.index);
    setHoveredIndices(new Set(closest));
  };

  const handleMouseLeave = () => {
    setHoveredIndices(new Set());
  };

  return (
    <span
      ref={containerRef}
      className="inline-block cursor-pointer select-none"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {displayText.split("").map((char, index) => {
        const isHovered = hoveredIndices.has(index);
        return (
          <span
            key={index}
            ref={(el) => { charRefs.current[index] = el; }}
            className="inline bg-clip-text text-transparent"
            style={{
              backgroundImage: isHovered
                ? `linear-gradient(135deg, #00f5d4, #8b5cf6)`
                : `linear-gradient(135deg, #ec4899, #8b5cf6)`,
              transition: "background-image 0.25s ease",
            }}
          >
            {char === " " ? "\u00A0" : char}
          </span>
        );
      })}
      <span
        className="inline-block w-[2px] h-[0.85em] ml-0.5 align-middle opacity-80"
        style={{
          backgroundColor: showCursor ? "#8b5cf6" : "transparent",
        }}
      />
    </span>
  );
}
