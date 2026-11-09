// SPDX-License-Identifier: MIT
// Copyright (c) 2024 Eduardo Calvo
// Source: https://github.com/educlopez/smoothui/blob/b6312bc/packages/smoothui/components/rolling-text/index.tsx
// Modified by Motif; see the item's provenance.
import { cn } from "@/lib/motif-runtime";
import { motion, useInView, useReducedMotion } from "motion/react";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";

/* @motif:defaults */
export const defaults = {
  text: '042,918',
  glyphs: '',
  rampLength: 4,
  duration: 500,
  stagger: 40,
  direction: 'up',
  trigger: 'mount',
  font: 'mono',
}
/* @motif:end */

const FONT_STACKS: Record<string, string> = {
  mono: "'JetBrains Mono Variable', ui-monospace, monospace",
  sans: "'Inter Tight Variable', ui-sans-serif, system-ui, sans-serif",
  display: "'Archivo Black', ui-sans-serif, system-ui, sans-serif",
};

export type RollingTextDirection = "up" | "down";
export type RollingTextTrigger = "mount" | "inView" | "hover" | "manual";

export interface RollingTextProps {
  className?: string;
  style?: CSSProperties;
  /** Font family key: mono, sans or display. */
  font?: string;
  /** Direction the glyph column rolls in before landing. */
  direction?: RollingTextDirection;
  /** Roll duration per character, in milliseconds. */
  duration?: number;
  /**
   * Ramp alphabet cycled through before landing on the target character.
   * Defaults to the unique characters found in `text`.
   */
  glyphs?: string;
  /** Plays the roll when `trigger` is "manual" and this flips to `true`. */
  playing?: boolean;
  /** Number of intermediate glyphs shown before the target lands. */
  rampLength?: number;
  /** Per-character stagger, in milliseconds. */
  stagger?: number;
  text: string;
  trigger?: RollingTextTrigger;
}

export type TextSplitFlapProps = Partial<Omit<RollingTextProps, "direction" | "trigger">> & {
  direction?: string;
  trigger?: string;
};

interface RollingCharacter {
  isWhitespace: boolean;
  items: string[];
  key: string;
  targetIndex: number;
}

const DEFAULT_DURATION = 500;
const DEFAULT_STAGGER = 40;
const DEFAULT_RAMP_LENGTH = 4;
const MS = 1000;
const PERCENT = 100;
const DEFAULT_GLYPH_POOL =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
const MOVEMENT_EASE = [0.645, 0.045, 0.355, 1] as const;

const segmentGraphemes = (value: string): string[] => {
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    const segmenter = new Intl.Segmenter(undefined, {
      granularity: "grapheme",
    });
    return Array.from(segmenter.segment(value), (entry) => entry.segment);
  }
  return [...value];
};

const buildGlyphPool = (text: string, glyphs?: string): string[] => {
  if (glyphs && glyphs.length > 0) {
    return segmentGraphemes(glyphs);
  }
  const unique = Array.from(
    new Set(segmentGraphemes(text).filter((char) => char.trim().length > 0))
  );
  return unique.length > 1 ? unique : segmentGraphemes(DEFAULT_GLYPH_POOL);
};

const buildRamp = (
  target: string,
  pool: string[],
  rampLength: number,
  direction: RollingTextDirection
): string[] => {
  const randomGlyphs = Array.from(
    { length: rampLength },
    () => pool[Math.floor(Math.random() * pool.length)] ?? target
  );
  const ramp = [...randomGlyphs, target];
  return direction === "down" ? ramp.reverse() : ramp;
};

const buildCharacters = (
  text: string,
  pool: string[],
  rampLength: number,
  direction: RollingTextDirection
): RollingCharacter[] => {
  const occurrences = new Map<string, number>();
  return segmentGraphemes(text).map((char) => {
    const count = occurrences.get(char) ?? 0;
    occurrences.set(char, count + 1);
    const isWhitespace = char.trim().length === 0;
    const items = isWhitespace
      ? [char]
      : buildRamp(char, pool, rampLength, direction);
    return {
      isWhitespace,
      items,
      key: `${char}-${count}`,
      targetIndex: direction === "down" ? 0 : items.length - 1,
    };
  });
};

/**
 * RollingText — odometer-style vertical roll. Each character cycles
 * through a short ramp of glyphs, like a split-flap display, before
 * landing on its target.
 */
export function TextSplitFlap({
  className,
  style,
  playing = false,
  ...props
}: TextSplitFlapProps) {
  const merged = { ...defaults, ...props };
  const text = merged.text;
  const glyphs = merged.glyphs;
  const direction = (merged.direction === "down" ? "down" : "up") as RollingTextDirection;
  const trigger = merged.trigger as RollingTextTrigger;
  const duration = merged.duration ?? DEFAULT_DURATION;
  const rampLength = Math.max(1, Math.round(merged.rampLength ?? DEFAULT_RAMP_LENGTH));
  const stagger = merged.stagger ?? DEFAULT_STAGGER;
  const rootClass = cn("inline-block", className);
  const rootStyle: CSSProperties = { fontFamily: FONT_STACKS[merged.font] ?? FONT_STACKS.mono, ...style };
  const containerRef = useRef<HTMLSpanElement>(null);
  const inView = useInView(containerRef, { once: true });
  const shouldReduceMotion = useReducedMotion();
  const [playCount, setPlayCount] = useState(() =>
    trigger === "mount" ? 1 : 0
  );
  const [isHoverDevice, setIsHoverDevice] = useState(false);
  const wasPlayingRef = useRef(playing);

  useEffect(() => {
    const hoverQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    setIsHoverDevice(hoverQuery.matches);
    const handleHoverChange = (event: MediaQueryListEvent) => {
      setIsHoverDevice(event.matches);
    };
    hoverQuery.addEventListener("change", handleHoverChange);
    return () => hoverQuery.removeEventListener("change", handleHoverChange);
  }, []);

  useEffect(() => {
    if (trigger === "inView" && inView && !shouldReduceMotion) {
      setPlayCount((count) => count + 1);
    }
  }, [trigger, inView, shouldReduceMotion]);

  useEffect(() => {
    if (
      trigger === "manual" &&
      playing &&
      !wasPlayingRef.current &&
      !shouldReduceMotion
    ) {
      setPlayCount((count) => count + 1);
    }
    wasPlayingRef.current = playing;
  }, [trigger, playing, shouldReduceMotion]);

  const pool = useMemo(() => buildGlyphPool(text, glyphs), [text, glyphs]);
  const characters = useMemo(
    // playCount 变化时重新随机一串过渡字形。
    () => (playCount >= 0 ? buildCharacters(text, pool, rampLength, direction) : []),
    [text, pool, rampLength, direction, playCount]
  );

  const handlePointerEnter = () => {
    if (trigger === "hover" && isHoverDevice && !shouldReduceMotion) {
      setPlayCount((count) => count + 1);
    }
  };

  if (shouldReduceMotion) {
    return (
      <span className={rootClass} style={rootStyle}>
        {text}
      </span>
    );
  }

  return (
    <span
      className={rootClass}
      style={rootStyle}
      onPointerEnter={handlePointerEnter}
      ref={containerRef}
    >
      {/* Every glyph below is aria-hidden, so the readable copy lives here. An
          aria-label on this plain span would be dropped by assistive tech. */}
      <span className="sr-only">{text}</span>
      {characters.map((character, characterIndex) =>
        character.isWhitespace ? (
          <span
            aria-hidden="true"
            key={character.key}
            style={{ display: "inline-block", whiteSpace: "pre" }}
          >
            {character.items[0]}
          </span>
        ) : (
          <span
            aria-hidden="true"
            key={character.key}
            style={{
              display: "inline-block",
              height: "1em",
              lineHeight: "1em",
              overflow: "hidden",
              verticalAlign: "bottom",
            }}
          >
            <motion.span
              animate={{
                y: `${-(character.targetIndex / character.items.length) * PERCENT}%`,
              }}
              initial={{
                y:
                  direction === "down"
                    ? `${-((character.items.length - 1) / character.items.length) * PERCENT}%`
                    : "0%",
              }}
              key={playCount}
              style={{ display: "flex", flexDirection: "column" }}
              transition={{
                delay: (characterIndex * stagger) / MS,
                duration: duration / MS,
                ease: MOVEMENT_EASE,
              }}
            >
              {character.items.map((glyph, glyphIndex) => (
                <span
                  key={glyphIndex}
                  style={{
                    display: "block",
                    height: "1em",
                    lineHeight: "1em",
                  }}
                >
                  {glyph}
                </span>
              ))}
            </motion.span>
          </span>
        )
      )}
    </span>
  );
}
