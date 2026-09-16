"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

interface ZoomableImageProps {
  src: string;
  alt: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
  /** Changing this value resets zoom/pan (e.g. pass the current index). */
  resetKey?: string | number;
}

const MIN_SCALE = 1;
const MAX_SCALE = 3;
const ZOOM_STEP = 0.5;

/**
 * Shows an image centered and fully contained by default. Once zoomed in
 * via the +/- controls, the image can be dragged to pan.
 */
export default function ZoomableImage({
  src,
  alt,
  sizes,
  priority,
  className = "",
  resetKey,
}: ZoomableImageProps) {
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const dragStart = useRef<{ x: number; y: number } | null>(null);
  const panStart = useRef({ x: 0, y: 0 });
  const isZoomed = scale > MIN_SCALE;

  useEffect(() => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  }, [resetKey]);

  function handlePointerDown(e: React.PointerEvent) {
    if (!isZoomed) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragStart.current = { x: e.clientX, y: e.clientY };
    panStart.current = offset;
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!isZoomed || !dragStart.current) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setOffset({ x: panStart.current.x + dx, y: panStart.current.y + dy });
  }

  function handlePointerUp() {
    dragStart.current = null;
  }

  function zoomIn() {
    setScale((s) => Math.min(MAX_SCALE, s + ZOOM_STEP));
  }

  function zoomOut() {
    setScale((s) => {
      const next = Math.max(MIN_SCALE, s - ZOOM_STEP);
      if (next === MIN_SCALE) setOffset({ x: 0, y: 0 });
      return next;
    });
  }

  return (
    <div
      className={`relative w-full overflow-hidden rounded-2xl border border-mute/30 bg-paper/5 ${className}`}
      style={{ touchAction: isZoomed ? "none" : "pan-y" }}
    >
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="absolute inset-0 transition-transform"
        style={{
          transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
          cursor: isZoomed ? "grab" : "default",
        }}
      >
        <Image
          src={src}
          alt={alt}
          fill
          className="object-contain"
          sizes={sizes}
          priority={priority}
        />
      </div>

      <div className="absolute bottom-3 right-3 flex gap-2">
        <button
          type="button"
          onClick={zoomOut}
          disabled={scale <= MIN_SCALE}
          aria-label="Zoom out"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-mute/30 bg-ink/70 text-lg leading-none text-paper transition hover:border-signal disabled:opacity-30"
        >
          −
        </button>
        <button
          type="button"
          onClick={zoomIn}
          disabled={scale >= MAX_SCALE}
          aria-label="Zoom in"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-mute/30 bg-ink/70 text-lg leading-none text-paper transition hover:border-signal disabled:opacity-30"
        >
          +
        </button>
      </div>
    </div>
  );
}
