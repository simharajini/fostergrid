'use client';

import { useMemo, useState } from 'react';
import {
  Siren,
  Loader2,
  Thermometer,
  Pill,
  Accessibility,
  Dog,
  Cat,
  Sun,
  Battery,
  ShieldCheck,
  ShieldAlert,
  MapPin,
} from 'lucide-react';
import { animals, fosters, disasterMeta } from '@/data/mockData';
import { DisasterType } from '@/types';
import MatchResultsModal, { MatchResult } from './MatchResultsModal';

const DISASTERS: DisasterType[] = ['power_outage', 'wildfire', 'heatwave'];

export default function Dashboard() {
  const [disaster, setDisaster] = useState<DisasterType>('power_outage');
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [modal, setModal] = useState<{
    animalId: string;
    matches: MatchResult[];
    source: 'bedrock' | 'fallback';
  } | null>(null);

  async function runMatch(animalId: string) {
    setLoadingId(animalId);
    try {
      const res = await fetch('/api/match-foster', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ animalId, disasterType: disaster }),
      });
      const data = await res.json();
      setModal({
        animalId,
        matches: data.matches ?? [],
        source: data.source === 'bedrock' ? 'bedrock' : 'fallback',
      });
    } catch {
      setModal({ animalId, matches: [], source: 'fallback' });
    } finally {
      setLoadingId(null);
    }
  }

  const activeAnimal = useMemo(
    () => animals.find((a) => a.id === modal?.animalId),
    [modal],
  );

  const meta = disasterMeta[disaster];

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Crisis header bar */}
      <header className="bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Siren className="w-6 h-6 text-red-500" />
            <span className="text-xl font-bold">
              Foster<span className="text-red-500">Grid</span>
            </span>
            <span className="text-xs text-slate-400 ml-2">
              Downtown San Jose Shelter · Dispatch Console
            </span>
          </div>
          <div className="flex gap-2">
            {DISASTERS.map((d) => (
              <button
                key={d}
                onClick={() => setDisaster(d)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  disaster === d
                    ? 'bg-red-600 text-white'
                    : 'bg-white/10 text-slate-300 hover:bg-white/20'
                }`}
              >
                {disasterMeta[d].label}
              </button>
            ))}
          </div>
        </div>
        {/* Red alert banner */}
        <div className="bg-red-600 text-white alert-pulse">
          <div className="max-w-7xl mx-auto px-6 py-2 flex items-center gap-2 text-sm font-semibold">
            <Siren className="w-4 h-4" />
            ACTIVE EMERGENCY — {meta.banner}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: animals */}
        <section>
          <h2 className="font-bold text-lg mb-3 text-slate-800">
            Shelter Animals Needing Immediate Relocation
          </h2>
          <div className="space-y-3">
            {animals.map((a) => (
              <div
                key={a.id}
                className="bg-white rounded-xl border p-4 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {a.species === 'dog' ? (
                      <Dog className="w-5 h-5 text-amber-600" />
                    ) : (
                      <Cat className="w-5 h-5 text-slate-600" />
                    )}
                    <div>
                      <h3 className="font-semibold">
                        {a.name}{' '}
                        <span className="font-normal text-slate-400 text-sm">
                          · {a.breed} · {a.weight} lb
                        </span>
                      </h3>
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {a.address}
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-slate-600 mt-2">{a.medicalNotes}</p>

                <div className="flex flex-wrap gap-1.5 mt-3">
                  {a.requiresRefrigeration && (
                    <Badge color="blue" icon={<Pill className="w-3 h-3" />}>
                      Refrigerated meds
                    </Badge>
                  )}
                  {a.mobilityNeeds && (
                    <Badge
                      color="purple"
                      icon={<Accessibility className="w-3 h-3" />}
                    >
                      No stairs
                    </Badge>
                  )}
                  <Badge color="orange" icon={<Thermometer className="w-3 h-3" />}>
                    {disasterMeta[a.emergencyType].label}
                  </Badge>
                </div>

                <button
                  onClick={() => runMatch(a.id)}
                  disabled={loadingId === a.id}
                  className="mt-4 w-full inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg text-sm"
                >
                  {loadingId === a.id ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Matching…
                    </>
                  ) : (
                    <>
                      <Siren className="w-4 h-4" /> Run Bedrock AI Match
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Right: foster fleet */}
        <section>
          <h2 className="font-bold text-lg mb-3 text-slate-800">
            Regional Foster Fleet
          </h2>
          <div className="space-y-3">
            {fosters.map((f) => (
              <div
                key={f.id}
                className={`bg-white rounded-xl border p-4 shadow-sm ${
                  f.insideHazardZone ? 'border-red-300 bg-red-50/40' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{f.name}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {f.address}
                    </p>
                  </div>
                  <span className="text-xs text-slate-400">
                    max {f.maxWeight} lb
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 mt-3">
                  {f.insideHazardZone ? (
                    <Badge color="red" icon={<ShieldAlert className="w-3 h-3" />}>
                      Inside Fire Zone
                    </Badge>
                  ) : (
                    <Badge
                      color="green"
                      icon={<ShieldCheck className="w-3 h-3" />}
                    >
                      Outside Fire Zone
                    </Badge>
                  )}
                  {f.powerType === 'solar' && (
                    <Badge color="yellow" icon={<Sun className="w-3 h-3" />}>
                      Solar Battery Active
                    </Badge>
                  )}
                  {f.powerType === 'generator' && (
                    <Badge color="slate" icon={<Battery className="w-3 h-3" />}>
                      Generator Ready
                    </Badge>
                  )}
                  {f.dogFriendly && (
                    <Badge color="amber" icon={<Dog className="w-3 h-3" />}>
                      Dogs OK
                    </Badge>
                  )}
                  {f.catFriendly && (
                    <Badge color="slate" icon={<Cat className="w-3 h-3" />}>
                      Cats OK
                    </Badge>
                  )}
                  {!f.insideHazardZone && f.activeStatus && (
                    <Badge color="green">Ready</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {modal && activeAnimal && (
        <MatchResultsModal
          animal={activeAnimal}
          matches={modal.matches}
          source={modal.source}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}

function Badge({
  children,
  color,
  icon,
}: {
  children: React.ReactNode;
  color: string;
  icon?: React.ReactNode;
}) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-700',
    purple: 'bg-purple-100 text-purple-700',
    orange: 'bg-orange-100 text-orange-700',
    red: 'bg-red-100 text-red-700',
    green: 'bg-green-100 text-green-700',
    yellow: 'bg-yellow-100 text-yellow-700',
    amber: 'bg-amber-100 text-amber-700',
    slate: 'bg-slate-100 text-slate-700',
  };
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${colors[color]}`}
    >
      {icon}
      {children}
    </span>
  );
}
