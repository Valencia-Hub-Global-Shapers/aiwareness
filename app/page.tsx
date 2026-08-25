"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";
import { loadHubRegistry, findHub } from "@/lib/hubs";
import { getDictionary } from "@/lib/i18n";
import type { HubIndexEntry } from "@/lib/types";

export default function OnboardingPage() {
  const router = useRouter();
  const [birthYear, setBirthYear] = useState("");
  const [hubs, setHubs] = useState<HubIndexEntry[] | null>(null);
  const [hubsError, setHubsError] = useState("");
  const [hub, setHub] = useState("");
  const [consent, setConsent] = useState(false);
  const [mode, setMode] = useState<"simple" | "digital">("digital");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadHubRegistry()
      .then((registry) => {
        setHubs(registry);
        if (registry.length > 0) setHub(registry[0].id);
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
    localStorage.setItem("aiwareness_mode", mode);
    router.push("/phase1");
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-8 px-6 py-12">
      <header>
        <p className="font-mono text-sm uppercase tracking-widest text-signal">
          Global Shapers
        </p>
        <h1 className="font-display text-4xl leading-tight">AIwareness</h1>
        <p className="mt-2 text-mute">{t.subtitle}</p>
      </header>

      {hubsError && <p className="text-sm text-alert">{hubsError}</p>}

      {!hubsError && hubs === null && (
        <p className="text-sm text-mute">{t.loading}</p>
      )}

      {!hubsError && hubs !== null && hubs.length === 0 && (
        <p className="text-sm text-alert">
          No hay ningún hub configurado todavía.
        </p>
      )}

      {!hubsError && hubs !== null && hubs.length > 0 && (
      <div className="flex flex-col gap-5">
        <label className="flex flex-col gap-2">
          <span className="text-sm text-mute">{t.birthYearLabel}</span>
          <input
            type="number"
            inputMode="numeric"
            placeholder="1995"
            value={birthYear}
            onChange={(e) => setBirthYear(e.target.value)}
            className="rounded-xl border border-mute/40 bg-transparent px-4 py-3 text-lg text-paper outline-none focus:border-signal"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm text-mute">{t.hubLabel}</span>
          <select
            value={hub}
            onChange={(e) => setHub(e.target.value)}
            className="rounded-xl border border-mute/40 bg-ink px-4 py-3 text-lg text-paper outline-none focus:border-signal"
          >
            {hubs.map((h) => (
              <option key={h.id} value={h.id}>
                {h.label}
              </option>
            ))}
          </select>
        </label>

        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm text-mute">{t.modeLegend}</legend>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setMode("simple")}
              aria-pressed={mode === "simple"}
              className={`rounded-xl border px-4 py-4 text-left transition ${
                mode === "simple"
                  ? "border-signal bg-signal/10"
                  : "border-mute/40"
              }`}
            >
              <span className="block font-display text-lg">
                {t.modeSimpleTitle}
              </span>
              <span className="block text-sm text-mute">
                {t.modeSimpleDesc}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setMode("digital")}
              aria-pressed={mode === "digital"}
              className={`rounded-xl border px-4 py-4 text-left transition ${
                mode === "digital"
                  ? "border-signal bg-signal/10"
                  : "border-mute/40"
              }`}
            >
              <span className="block font-display text-lg">
                {t.modeDigitalTitle}
              </span>
              <span className="block text-sm text-mute">
                {t.modeDigitalDesc}
              </span>
            </button>
          </div>
        </fieldset>

        <label className="flex items-start gap-3 text-sm text-mute">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-1 h-5 w-5"
          />
          {t.consent}
        </label>

        {error && <p className="text-sm text-alert">{error}</p>}

        <button
          onClick={handleStart}
          disabled={loading}
          className="rounded-xl bg-signal px-6 py-4 font-display text-lg text-ink transition hover:opacity-90 disabled:opacity-50"
        >
          {loading ? t.loading : t.start}
        </button>
      </div>
      )}
    </main>
  );
}
