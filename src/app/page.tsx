import Link from 'next/link';
import { Siren, ArrowRight, ShieldCheck, Zap, MapPin } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white flex flex-col items-center justify-center px-6">
      <div className="max-w-2xl text-center">
        <div className="inline-flex items-center gap-2 bg-red-600/20 border border-red-500/40 text-red-300 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
          <Siren className="w-4 h-4" />
          Emergency Animal Rescue Dispatch
        </div>
        <h1 className="text-5xl font-bold tracking-tight mb-4">
          Foster<span className="text-red-500">Grid</span>
        </h1>
        <p className="text-lg text-slate-300 mb-8">
          When a shelter loses power, HVAC, or safety, FosterGrid matches animals
          to safe foster homes in <span className="font-semibold text-white">minutes</span> —
          powered by Amazon Bedrock AI and a deterministic fail-safe engine.
        </p>

        <div className="grid grid-cols-3 gap-4 mb-10 text-sm">
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <ShieldCheck className="w-6 h-6 text-green-400 mx-auto mb-2" />
            Hazard-zone filtering
          </div>
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <Zap className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
            Medical constraint solver
          </div>
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <MapPin className="w-6 h-6 text-blue-400 mx-auto mb-2" />
            San Jose local fleet
          </div>
        </div>

        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 transition-colors text-white font-semibold px-8 py-4 rounded-xl text-lg"
        >
          Open Dispatch Dashboard
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
      <p className="text-slate-500 text-xs mt-12">
        Built with Kiro (spec-driven) · Next.js 14 · AWS Bedrock (Claude 3.5 Sonnet)
      </p>
    </main>
  );
}
