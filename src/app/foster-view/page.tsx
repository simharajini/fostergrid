'use client';

import { useState } from 'react';
import { Smartphone, CheckCircle2, Zap } from 'lucide-react';
import { animals, fosters } from '@/data/mockData';

// Standalone foster mobile-alert simulation (for judges to view the
// volunteer side of the dispatch on their own phones).
export default function FosterView() {
  const animal = animals[0]; // Max
  const foster = fosters[0]; // Elena Rostova (solar, single-story)
  const [accepted, setAccepted] = useState(false);

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6">
      <h1 className="text-white text-lg font-semibold mb-6 flex items-center gap-2">
        <Smartphone className="w-5 h-5 text-red-500" />
        Foster Volunteer — Mobile Dispatch Alert
      </h1>

      <div className="w-[320px] bg-black rounded-[3rem] p-3 shadow-2xl">
        <div className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-[2.4rem] p-5 min-h-[560px] flex flex-col">
          <div className="h-6 flex justify-center">
            <div className="w-24 h-4 bg-black rounded-b-2xl" />
          </div>
          <p className="text-center text-white text-4xl font-light mt-4">9:41</p>
          <p className="text-center text-slate-400 text-sm">
            {foster.name.split(' ')[0]}&apos;s iPhone
          </p>

          <div className="mt-10">
            {!accepted ? (
              <div className="bg-white/95 rounded-2xl p-4 alert-pulse">
                <p className="font-bold text-red-600 text-sm mb-1">
                  🚨 EMERGENCY FOSTER DISPATCH
                </p>
                <p className="text-sm text-slate-800">
                  <strong>{animal.name}</strong> needs relocation. Solar power
                  &amp; ground floor matched.
                </p>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <button
                    className="bg-slate-200 text-slate-700 font-semibold py-2 rounded-xl text-sm"
                    onClick={() => setAccepted(false)}
                  >
                    DECLINE
                  </button>
                  <button
                    className="bg-green-600 text-white font-semibold py-2 rounded-xl text-sm"
                    onClick={() => setAccepted(true)}
                  >
                    ACCEPT DISPATCH
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-green-600 text-white rounded-2xl p-5 text-center">
                <CheckCircle2 className="w-10 h-10 mx-auto mb-2" />
                <p className="font-bold">Dispatch Accepted!</p>
                <p className="text-sm text-green-100 mt-1">
                  En route to pick up {animal.name}.
                </p>
                <p className="text-xs text-green-100 mt-3 flex items-center justify-center gap-1">
                  <Zap className="w-3 h-3" /> Solar power confirmed on site
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
