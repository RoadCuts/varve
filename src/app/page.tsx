'use client';
import HabitGrid from '@/components/HabitGrid';
import FreedomTracker from '@/components/FreedomTracker';
import HabitHistory from '@/components/HabitHistory';
import WeeklyReflection from '@/components/WeeklyReflection';
import RewardLedger from '@/components/RewardLedger';

export default function Home() {
  return (
    <main className="min-h-screen bg-stone-950 text-stone-100 flex flex-col items-center p-8">
      <div className="w-full max-w-xl">
        <div className="font-mono text-xs uppercase tracking-[0.3em] text-stone-500 mb-6">
          varve
        </div>
        <h1 className="text-5xl font-serif mb-4 leading-tight">
          Incremental work that sediments into a full roadcut over time.
        </h1>
        <p className="text-stone-400 text-lg mb-2 italic">
          A practice ledger.
        </p>
        <HabitGrid />
        <FreedomTracker />
        <HabitHistory />
        <WeeklyReflection />
        <RewardLedger />
      </div>
    </main>
  );
}