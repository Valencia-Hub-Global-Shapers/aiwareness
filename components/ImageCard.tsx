"use client";

import ZoomableImage from "@/components/ZoomableImage";
import { getDictionary } from "@/lib/i18n";

interface ImageCardProps {
  imageUrl: string;
  index: number;
  total: number;
  language?: string | null;
  onAnswer: (answeredAiGenerated: boolean) => void;
}

/**
 * Tarjeta de fase 1: siempre ofrece dos botones grandes y claros. No se
 * muestra ningún feedback de acierto/error tras responder.
 */
export default function ImageCard({
  imageUrl,
  index,
  total,
  language,
  onAnswer,
}: ImageCardProps) {
  const t = getDictionary(language).imageCard;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3">
        <p className="text-sm tabular-nums text-muted">
          {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </p>
        <div className="h-0.5 bg-line">
          <div
            className="h-full bg-blue transition-all"
            style={{ width: `${((index + 1) / total) * 100}%` }}
          />
        </div>
      </div>

      <ZoomableImage
        src={imageUrl}
        alt={t.alt}
        sizes="(max-width: 480px) 100vw, 480px"
        priority
        resetKey={index}
        className="h-[65vh]"
      />

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => onAnswer(false)}
          className="rounded border border-line-strong bg-white px-4 py-5 font-display text-xl text-ink transition hover:border-ink active:bg-paper-2"
        >
          {t.real}
        </button>
        <button
          onClick={() => onAnswer(true)}
          className="rounded border border-line-strong bg-white px-4 py-5 font-display text-xl text-ink transition hover:border-ink active:bg-paper-2"
        >
          {t.aiGenerated}
        </button>
      </div>
    </div>
  );
}
