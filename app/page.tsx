"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";
import { loadHubRegistry, findHub } from "@/lib/hubs";
import { getDictionary } from "@/lib/i18n";
import HubPicker from "@/components/HubPicker";
import type { HubIndexEntry } from "@/lib/types";

export default function OnboardingPage() {
  const router = useRouter();
  const [birthYear, setBirthYear] = useState("");
  const [hubs, setHubs] = useState<HubIndexEntry[] | null>(null);
  const [hubsError, setHubsError] = useState("");
  const [hub, setHub] = useState("");
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadHubRegistry()
      .then((registry) => {
        const sorted = [...registry].sort((a, b) =>
          a.label.localeCompare(b.label)
        );
        setHubs(sorted);
        if (sorted.length > 0) setHub(sorted[0].id);
      })
      .catch(() => setHubsError("No se pudo cargar la lista de hubs."));
  }, []);

  const selectedHub = hubs ? findHub(hubs, hub) : undefined;
  const t = getDictionary(selectedHub?.language).onboarding;

  async function handleStart() {
    if (!selectedHub) return;
    setError("");

    // El chequeo del año debe coincidir con el "check" de la base de
    // datos (birth_year > 1900): si difieren, un valor límite pasa la
    // validación del cliente y luego falla en el insert con un error
    // genérico, confundible con un fallo real de guardado.
    const year = parseInt(birthYear, 10);
    const currentYear = new Date().getFullYear();
    if (!year || year <= 1900 || year > currentYear) {
      setError(t.errorInvalidYear);
      return;
    }
    if (!consent) {
      setError(t.errorConsent);
      return;
    }

    setLoading(true);
    const participantId = crypto.randomUUID();

    if (isSupabaseConfigured) {
      const { error: dbError } = await supabase.from("participants").insert({
        id: participantId,
        birth_year: year,
        hub: selectedHub.id,
        country: selectedHub.country,
        consent: true,
      });

      if (dbError) {
        setLoading(false);
        setError(t.errorSave);
        return;
      }
    }

    setLoading(false);

    localStorage.setItem("aiwareness_participant_id", participantId);
    localStorage.setItem("aiwareness_hub", selectedHub.id);
    localStorage.setItem("aiwareness_language", selectedHub.language);
    localStorage.setItem("aiwareness_country", selectedHub.country);
    localStorage.setItem("aiwareness_birth_year", String(year));
    router.push("/phase1");
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col px-6 py-10">
      <div className="flex items-baseline justify-between gap-2 text-xs">
        <p className="font-medium uppercase tracking-[0.16em] text-muted">
          Global Shapers
        </p>
        <a
          href="https://valencia-hub-global-shapers.github.io/?lang=en"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue underline underline-offset-2 hover:text-blue-deep"
        >
          Made from Valencia Hub
        </a>
      </div>

      <header className="mb-10 mt-16">
        <h1 className="font-display text-5xl leading-none text-ink">
          AIwareness
        </h1>
        <p className="mt-4 text-lg leading-snug text-ink-soft">{t.subtitle}</p>
      </header>

      {hubsError && <p className="text-sm text-accent-deep">{hubsError}</p>}

      {!hubsError && hubs === null && (
        <p className="text-sm text-muted">{t.loading}</p>
      )}

      {!hubsError && hubs !== null && hubs.length === 0 && (
        <p className="text-sm text-accent-deep">
          No hay ningún hub configurado todavía.
        </p>
      )}

      {!hubsError && hubs !== null && hubs.length > 0 && (
        <div className="flex flex-col gap-6 border-t border-line pt-8">
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-ink">
              {t.birthYearLabel}
            </span>
            <input
              type="number"
              inputMode="numeric"
              placeholder="1995"
              value={birthYear}
              onChange={(e) => setBirthYear(e.target.value)}
              className="rounded border border-line-strong bg-white px-4 py-3 text-lg text-ink outline-none transition focus:border-blue"
            />
          </label>

          <HubPicker
            hubs={hubs}
            value={hub}
            onChange={setHub}
            label={t.hubLabel}
            placeholder={t.hubSearchPlaceholder}
            noResultsText={t.hubNoResults}
          />

          <label className="flex items-start gap-3 text-sm leading-snug text-ink-soft">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-0.5 h-5 w-5 shrink-0 accent-blue"
            />
            {t.consent}
          </label>

          {error && <p className="text-sm text-accent-deep">{error}</p>}

          <button
            onClick={handleStart}
            disabled={loading}
            className="rounded bg-blue px-6 py-4 font-medium text-white transition hover:bg-blue-deep disabled:opacity-50"
          >
            {loading ? t.loading : t.start}
          </button>
        </div>
      )}

      <footer className="mt-auto pt-12 text-xs leading-relaxed text-muted">
        Images from the{" "}
        <a
          href="https://huggingface.co/datasets/Rajarshi-Roy-research/Defactify_Image_Dataset"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-ink"
        >
          Defactify Image Dataset
        </a>{" "}
        (Roy et al., 2026,{" "}
        <a
          href="https://arxiv.org/abs/2601.00553"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-ink"
        >
          arXiv:2601.00553
        </a>
        ). Many thanks to the authors for making it open.
      </footer>
    </main>
  );
}
