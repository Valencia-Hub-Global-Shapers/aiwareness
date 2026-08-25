"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { getDictionary } from "@/lib/i18n";

interface ImageCardProps {
  imageUrl: string;
  index: number;
  total: number;
  mode: "simple" | "digital";
  language?: string | null;
  onAnswer: (answeredAiGenerated: boolean) => void;
}

/**
 * Tarjeta de fase 1. Siempre ofrece dos botones grandes y claros.
 * En modo "digital" además permite deslizar (swipe) como atajo, pero el
 * botón nunca desaparece: la accesibilidad no es opcional.
 * No se muestra ningún feedback de acierto/error tras responder.
 */
export default function ImageCard({
  imageUrl,
  index,
  total,
  mode,
  language,
  onAnswer,
}: ImageCardProps) {
  const [dragX, setDragX] = useState(0);
  const startX = useRef<number | null>(null);
  const t = getDictionary(language).imageCard;

  function handlePointerDown(e: React.PointerEvent) {
    if (mode !== "digital") return;
    startX.current = e.clientX;
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (mode !== "digital" || startX.current === null) return;
    setDragX(e.clientX - startX.current);
  }

  function handlePointerUp() {
    if (mode !== "digital" || startX.current === null) return;
    const threshold = 100;
    if (dragX > threshold) {
      onAnswer(false); // derecha = "real"
    } else if (dragX < -threshold) {
      onAnswer(true); // izquierda = "generada por IA"
    }
    startX.current = null;
    setDragX(0);
  }

  return (
    <div className="flex flex-col gap-6">
      <p className="font-mono text-sm text-mute">
        {index + 1} / {total}
      </p>

      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        style={{ transform: `translateX(${dragX}px) rotate(${dragX / 20}deg)` }}
        className="relative aspect-square w-full touch-none overflow-hidden rounded-2xl border border-mute/30 bg-paper/5 transition-transform"
      >
        <Image
          src={imageUrl}
          alt={t.alt}
          fill
          className="object-cover"
          sizes="(max-width: 480px) 100vw, 480px"
          priority
        />
      </div>

      {mode === "digital" && (
        <p className="text-center text-xs text-mute">{t.swipeHint}</p>
      )}

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => onAnswer(false)}
          className="rounded-xl border-2 border-paper/20 px-4 py-5 font-display text-xl transition hover:border-signal"
        >
          {t.real}
        </button>
        <button
          onClick={() => onAnswer(true)}
          className="rounded-xl border-2 border-paper/20 px-4 py-5 font-display text-xl transition hover:border-alert"
        >
          {t.aiGenerated}
        </button>
      </div>
    </div>
  );
}
