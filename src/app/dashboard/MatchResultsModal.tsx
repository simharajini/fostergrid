'use client';

import { useState } from 'react';
import { X, Zap, Phone, Smartphone, CheckCircle2 } from 'lucide-react';
import { Animal, Foster } from '@/types';
import { fosters as allFosters } from '@/data/mockData';

export interface MatchResult {
  fosterId: string;
  matchScore: number;
  reasoning: string;
}

interface Props {
  animal: Animal;
  matches: MatchResult[];
  source: 'bedrock' | 'fallback';
  onClose: () => void;
}

export default function MatchResultsModal({
  animal,
  matches,
  source,
  onClose,
}: Props) {
  const [dispatchFoster, setDispatchFoster] = useState<Foster | null>(null);
  const [accepted, setAccepted] = useState(false);

  const getFoster = (id: string) => allFosters.find((f) => f.id === id);

  if (dispatchFoster) {
    return (
      <PhoneSimulator
        animal={animal}
        foster={dispatchFoster}
        accepted={accepted}
        onAccept={() => setAccepted(true)}
        onBack={() => {
          setDispatchFoster(null);
          setAccepted(false);
        }}
        onClose={onClose}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-white rounded-t-2xl">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold">
                Top Matches for {animal.name}
              </h2>
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  source === 'bedrock'
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-amber-100 text-amber-700'
                }`}
              >
                {source === 'bedrock'
                  ? 'Amazon Bedrock AI'
                  : 'Fallback Engine'}
              </span>
            </div>
            <p className="text-sm text-slate-500">{animal.medicalNotes}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {matches.length === 0 && (
            <p className="text-center text-slate-500 py-8">
              No safe fosters found outside the hazard zone for these
              constraints.
            </p>
          )}
          {matches.map((m, idx) => {
            const foster = getFoster(m.fosterId);
            if (!foster) return null;
            return (
              <div
                key={m.fosterId}
                className="border rounded-xl p-4 flex gap-4 items-start hover:border-red-300 transition-colors"
              >
                <div className="flex flex-col items-center">
                  <span className="text-xs text-slate-400">#{idx + 1}</span>
                  <div
                    className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-white ${
                      m.matchScore >= 85
                        ? 'bg-green-600'
                        : m.matchScore >= 70
                          ? 'bg-yellow-500'
                          : 'bg-slate-400'
                    }`}
                  >
                    {m.matchScore}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg">{foster.name}</h3>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Phone className="w-3 h-3" /> {foster.phone}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 mb-2">
                    {foster.address}
                  </p>
                  <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans bg-slate-50 rounded-lg p-3">
                    {m.reasoning}
                  </pre>
                  <button
                    onClick={() => setDispatchFoster(foster)}
                    className="mt-3 inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2 rounded-lg"
                  >
                    <Smartphone className="w-4 h-4" />
                    Dispatch Emergency Transport
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ---- Simulated foster phone notification screen ----
function PhoneSimulator({
  animal,
  foster,
  accepted,
  onAccept,
  onBack,
  onClose,
}: {
  animal: Animal;
  foster: Foster;
  accepted: boolean;
  onAccept: () => void;
  onBack: () => void;
  onClose: () => void;
}) {
  const powerLabel =
    foster.powerType === 'solar'
      ? 'Solar power'
      : foster.powerType === 'generator'
        ? 'Generator power'
        : 'Standard power';
  const floorLabel =
    foster.housingType === 'single_story' ? 'ground floor' : 'multi-story';

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="relative">
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white/80 hover:text-white flex items-center gap-1 text-sm"
        >
          <X className="w-4 h-4" /> Close
        </button>

        {/* Phone frame */}
        <div className="w-[320px] h-[640px] bg-black rounded-[3rem] p-3 shadow-2xl">
          <div className="w-full h-full bg-gradient-to-b from-slate-900 to-slate-800 rounded-[2.4rem] overflow-hidden flex flex-col relative">
            {/* Notch */}
            <div className="h-7 flex items-center justify-center">
              <div className="w-28 h-5 bg-black rounded-b-2xl" />
            </div>

            {/* Lock-screen clock */}
            <div className="text-center text-white mt-2">
              <p className="text-5xl font-light">9:41</p>
              <p className="text-sm text-slate-300">
                {foster.name.split(' ')[0]}&apos;s iPhone
              </p>
            </div>

            {/* Notification */}
            <div className="px-4 mt-8">
              {!accepted ? (
                <div className="bg-white/95 rounded-2xl p-4 shadow-lg alert-pulse">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">🚨</span>
                    <span className="font-bold text-red-600 text-sm">
                      EMERGENCY FOSTER DISPATCH
                    </span>
                  </div>
                  <p className="text-sm text-slate-800 leading-snug">
                    <strong>{animal.name}</strong> ({animal.breed}) needs
                    relocation now. {powerLabel} &amp; {floorLabel} matched to
                    medical needs.
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Pickup: {animal.address}
                  </p>

                  <div className="grid grid-cols-2 gap-2 mt-4">
                    <button
                      onClick={onBack}
                      className="bg-slate-200 text-slate-700 font-semibold py-2 rounded-xl text-sm"
                    >
                      DECLINE
                    </button>
                    <button
                      onClick={onAccept}
                      className="bg-green-600 text-white font-semibold py-2 rounded-xl text-sm"
                    >
                      ACCEPT DISPATCH
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-green-600 rounded-2xl p-5 shadow-lg text-white text-center">
                  <CheckCircle2 className="w-12 h-12 mx-auto mb-2" />
                  <p className="font-bold">Dispatch Accepted!</p>
                  <p className="text-sm text-green-100 mt-1">
                    {foster.name} is en route to pick up {animal.name}.
                    Transport status: <strong>EN ROUTE</strong>.
                  </p>
                  <div className="flex items-center justify-center gap-1 mt-3 text-xs text-green-100">
                    <Zap className="w-3 h-3" /> {powerLabel} confirmed on site
                  </div>
                </div>
              )}
            </div>

            <div className="mt-auto pb-6 flex justify-center">
              <button
                onClick={onBack}
                className="text-slate-400 text-xs underline"
              >
                ← Back to matches
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
