"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { GENERIC_HUB_ID } from "@/lib/hubs";
import { getImageUrl } from "@/lib/images";
import type { DashboardStats } from "@/lib/dashboard";
import type { HubIndexEntry, Manifest } from "@/lib/types";

interface DashboardViewProps {
  hubs: HubIndexEntry[];
  manifest: Manifest;
  stats: DashboardStats | null;
  generatedAt: string;
}

const ALL = "all";
const MIN_ANSWERS = 5;
const TOP_N = 5;
const AGE_BUCKETS: { label: string; min: number; max: number }[] = [
  { label: "<18", min: 0, max: 17 },
  { label: "18-24", min: 18, max: 24 },
  { label: "25-34", min: 25, max: 34 },
  { label: "35-44", min: 35, max: 44 },
  { label: "45-54", min: 45, max: 54 },
  { label: "55-64", min: 55, max: 64 },
  { label: "65+", min: 65, max: 200 },
];

type Confusion = "ai_as_real" | "real_as_ai";

function pct(value: number): string {
  return `${Math.round(value * 100)}%`;
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="border-t border-line-strong pt-4">
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">
        {label}
      </p>
      <p className="mt-2 font-display text-5xl leading-none tabular-nums text-ink">
        {value}
      </p>
    </div>
  );
}

function Section({
  title,
  note,
  children,
}: {
  title: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-line pt-8">
      <h2 className="font-display text-2xl text-ink">{title}</h2>
      {note && <p className="mt-1 text-sm text-muted">{note}</p>}
      <div className="mt-6">{children}</div>
    </section>
  );
}

function Empty() {
  return <p className="text-sm text-muted">No data yet.</p>;
}

/** Horizontal bar row; the bar is the only encoding, value printed at the end. */
function BarRow({
  label,
  value,
  max,
  text,
  tone = "blue",
}: {
  label: string;
  value: number;
  max: number;
  text: string;
  tone?: "blue" | "accent";
}) {
  const width = max > 0 ? Math.max((value / max) * 100, value > 0 ? 1 : 0) : 0;
  return (
    <li className="flex items-center gap-3 text-sm">
      {label && (
        <span className="w-16 shrink-0 tabular-nums text-ink-soft">{label}</span>
      )}
      <span className="h-5 flex-1 rounded bg-paper-2">
        <span
          className={`block h-full rounded ${
            tone === "blue" ? "bg-blue" : "bg-accent"
          }`}
          style={{ width: `${width}%` }}
        />
      </span>
      <span className="w-20 shrink-0 text-right tabular-nums text-ink">
        {text}
      </span>
    </li>
  );
}

export default function DashboardView({
  hubs,
  manifest,
  stats,
  generatedAt,
}: DashboardViewProps) {
  const [hubId, setHubId] = useState(ALL);
  const [confusion, setConfusion] = useState<Confusion>("ai_as_real");

  const year = new Date(generatedAt).getUTCFullYear();
  const inScope = (hub: string) => hubId === ALL || hub === hubId;

  const view = useMemo(() => {
    const empty = {
      people: 0,
      answers: 0,
      correct: 0,
      hubsWithData: 0,
      countries: 0,
      ages: AGE_BUCKETS.map((b) => ({ ...b, people: 0, attempts: 0, correct: 0 })),
      perHub: [] as { hub: HubIndexEntry; people: number; rate: number }[],
      aiAccuracy: null as number | null,
      realAccuracy: null as number | null,
      ranked: [] as {
        id: string;
        file: string;
        shown: number;
        wrong: number;
      }[],
    };
    if (!stats) return empty;

    const hubById = new Map(hubs.map((h) => [h.id, h]));
    const bucketOf = (birthYear: number) => {
      const age = year - birthYear;
      return AGE_BUCKETS.find((b) => age >= b.min && age <= b.max);
    };

    // Global KPIs: hubs and countries joined are always overall. The
    // generic hub is not a city, so it does not count as a hub or country
    // (its people and answers still count everywhere).
    const activeHubs = new Set(
      stats.participants.map((p) => p.hub).filter((id) => id !== GENERIC_HUB_ID)
    );
    const activeCountries = new Set(
      [...activeHubs].map((id) => hubById.get(id)?.country).filter(Boolean)
    );

    const ages = empty.ages.map((b) => ({ ...b }));
    let people = 0;
    for (const p of stats.participants) {
      if (!inScope(p.hub)) continue;
      people += p.n;
      const b = bucketOf(p.birth_year);
      const slot = b && ages.find((a) => a.label === b.label);
      if (slot) slot.people += p.n;
    }
    for (const r of stats.by_birth_year) {
      if (!inScope(r.hub)) continue;
      const b = bucketOf(r.birth_year);
      const slot = b && ages.find((a) => a.label === b.label);
      if (slot) {
        slot.attempts += r.attempts;
        slot.correct += r.correct;
      }
    }

    // Per image, summed across the hubs in scope.
    const perImage = new Map<string, { shown: number; correct: number; saidAi: number }>();
    for (const r of stats.images) {
      if (!inScope(r.hub)) continue;
      const cur = perImage.get(r.image_id) ?? { shown: 0, correct: 0, saidAi: 0 };
      cur.shown += r.shown;
      cur.correct += r.correct;
      cur.saidAi += r.said_ai;
      perImage.set(r.image_id, cur);
    }

    let answers = 0;
    let correct = 0;
    let aiShown = 0;
    let aiCorrect = 0;
    let realShown = 0;
    let realCorrect = 0;
    const ranked: typeof empty.ranked = [];
    for (const [id, r] of perImage) {
      const entry = manifest[id];
      if (!entry) continue;
      answers += r.shown;
      correct += r.correct;
      if (entry.is_ai_generated) {
        aiShown += r.shown;
        aiCorrect += r.correct;
      } else {
        realShown += r.shown;
        realCorrect += r.correct;
      }
      const wanted = confusion === "ai_as_real" ? entry.is_ai_generated : !entry.is_ai_generated;
      if (wanted && r.shown >= MIN_ANSWERS) {
        ranked.push({
          id,
          file: entry.file,
          shown: r.shown,
          wrong: r.shown - r.correct,
        });
      }
    }
    ranked.sort((a, b) => b.wrong / b.shown - a.wrong / a.shown || b.shown - a.shown);

    // Accuracy per hub (only meaningful in the overall view).
    const hubTotals = new Map<string, { shown: number; correct: number }>();
    for (const r of stats.images) {
      const cur = hubTotals.get(r.hub) ?? { shown: 0, correct: 0 };
      cur.shown += r.shown;
      cur.correct += r.correct;
      hubTotals.set(r.hub, cur);
    }
    const peopleByHub = new Map<string, number>();
    for (const p of stats.participants) {
      peopleByHub.set(p.hub, (peopleByHub.get(p.hub) ?? 0) + p.n);
    }
    const perHub = [...hubTotals]
      .map(([id, t]) => ({
        hub: hubById.get(id) ?? { id, label: id, country: "", language: "" },
        people: peopleByHub.get(id) ?? 0,
        rate: t.shown ? t.correct / t.shown : 0,
      }))
      .sort((a, b) => b.people - a.people);

    return {
      people,
      answers,
      correct,
      hubsWithData: activeHubs.size,
      countries: activeCountries.size,
      ages,
      perHub,
      aiAccuracy: aiShown ? aiCorrect / aiShown : null,
      realAccuracy: realShown ? realCorrect / realShown : null,
      ranked: ranked.slice(0, TOP_N),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stats, hubs, manifest, hubId, confusion, year]);

  const selected = hubs.find((h) => h.id === hubId);
  const maxAgePeople = Math.max(...view.ages.map((a) => a.people), 0);
  const maxHubPeople = Math.max(...view.perHub.map((h) => h.people), 0);

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-10 px-6 py-10">
      <div className="flex items-baseline justify-between gap-2 text-xs">
        <Link
          href="/"
          className="font-medium uppercase tracking-[0.16em] text-muted transition hover:text-ink"
        >
          Global Shapers
        </Link>
        <a
          href="https://valencia-hub-global-shapers.github.io/?lang=en"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue underline underline-offset-2 hover:text-blue-deep"
        >
          Made from Valencia Hub
        </a>
      </div>

      <header className="flex flex-col gap-4">
        <h1 className="font-display text-5xl leading-none text-ink">Dashboard</h1>
        <p className="text-ink-soft">
          How people are doing at telling real images from AI-generated ones.
        </p>
      </header>

      {!stats ? (
        <p className="rounded border border-line-strong bg-white p-6 text-ink-soft">
          Stats are not available. Check that Supabase is configured and that
          supabase/dashboard.sql has been run.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4">
            <Stat label="People" value={view.people} />
            <Stat label="Answers" value={view.answers} />
            <Stat label="Hubs" value={view.hubsWithData} />
            <Stat label="Countries" value={view.countries} />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="hub" className="text-sm font-medium text-ink">
              Filter by hub
            </label>
            <select
              id="hub"
              value={hubId}
              onChange={(e) => setHubId(e.target.value)}
              className="rounded border border-line-strong bg-white px-4 py-3 text-lg text-ink outline-none transition focus:border-blue"
            >
              <option value={ALL}>All hubs</option>
              {hubs.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.label} ({h.country})
                </option>
              ))}
            </select>
          </div>

          <Section
            title="Accuracy"
            note={selected ? selected.label : "All hubs"}
          >
            {view.answers === 0 ? (
              <Empty />
            ) : (
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
                <Stat label="Overall" value={pct(view.correct / view.answers)} />
                <Stat
                  label="Spotting AI"
                  value={view.aiAccuracy === null ? "-" : pct(view.aiAccuracy)}
                />
                <Stat
                  label="Spotting real"
                  value={view.realAccuracy === null ? "-" : pct(view.realAccuracy)}
                />
              </div>
            )}
          </Section>

          <Section
            title="Age distribution"
            note="People who answered, by age group. Accuracy shown at the end."
          >
            {view.people === 0 ? (
              <Empty />
            ) : (
              <ul className="flex flex-col gap-2">
                {view.ages.map((a) => (
                  <BarRow
                    key={a.label}
                    label={a.label}
                    value={a.people}
                    max={maxAgePeople}
                    text={`${a.people} · ${
                      a.attempts ? pct(a.correct / a.attempts) : "-"
                    }`}
                  />
                ))}
              </ul>
            )}
          </Section>

          <Section
            title="Most confused images"
            note={`Images with at least ${MIN_ANSWERS} answers, ranked by share of wrong answers.`}
          >
            <div className="mb-6 flex gap-2">
              {(
                [
                  ["ai_as_real", "AI taken as real"],
                  ["real_as_ai", "Real taken as AI"],
                ] as [Confusion, string][]
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setConfusion(value)}
                  aria-pressed={confusion === value}
                  className={`rounded border px-4 py-2 text-sm transition ${
                    confusion === value
                      ? "border-blue bg-blue text-white"
                      : "border-line-strong text-ink hover:border-ink"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            {view.ranked.length === 0 ? (
              <Empty />
            ) : (
              <ol>
                {view.ranked.map((r, i) => (
                  <li
                    key={r.id}
                    className="flex items-center gap-4 border-b border-line py-3"
                  >
                    <span className="w-6 text-sm tabular-nums text-muted">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded bg-paper-2">
                      <Image
                        src={getImageUrl(r.file)}
                        alt=""
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-ink">{r.id}</p>
                      <p className="text-xs text-muted">
                        {r.wrong} of {r.shown} wrong
                      </p>
                    </div>
                    <p className="font-display text-3xl tabular-nums text-accent-deep">
                      {pct(r.wrong / r.shown)}
                    </p>
                  </li>
                ))}
              </ol>
            )}
          </Section>

          {hubId === ALL && (
            <Section
              title="Hubs"
              note="People who answered per hub. Accuracy shown at the end."
            >
              {view.perHub.length === 0 ? (
                <Empty />
              ) : (
                <ul className="flex flex-col gap-2">
                  {view.perHub.map((h) => (
                    <li key={h.hub.id} className="flex flex-col gap-1">
                      <span className="text-sm text-ink">
                        {h.hub.label}
                        {h.hub.country && (
                          <span className="text-muted"> · {h.hub.country}</span>
                        )}
                      </span>
                      <ul>
                        <BarRow
                          label=""
                          value={h.people}
                          max={maxHubPeople}
                          text={`${h.people} · ${pct(h.rate)}`}
                        />
                      </ul>
                    </li>
                  ))}
                </ul>
              )}
            </Section>
          )}

          <p className="border-t border-line pt-4 text-xs text-muted">
            Updated {new Date(generatedAt).toUTCString()}. Data refreshes every
            few minutes.
          </p>
        </>
      )}
    </main>
  );
}
