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
    <div className="flex flex-col gap-6">
      <p className="font-mono text-sm text-mute">
        {index + 1} / {total}
      </p>

      <ZoomableImage
        src={imageUrl}
        alt={t.alt}
        sizes="(max-width: 480px) 100vw, 480px"
        priority
        resetKey={index}
        className="h-[65vh]"
      />

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
