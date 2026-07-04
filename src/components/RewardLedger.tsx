'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface RewardEntry {
  id: number;
  week_start: string;
  weekly_unlocked_at: string | null;
  weekly_expires_at: string | null;
  weekly_claimed_at: string | null;
  monthly_unlocks: number;
}

export default function RewardLedger() {
  const [open, setOpen] = useState(false);
  const [entries, setEntries] = useState<RewardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase
        .from('reward_ledger')
        .select('*')
        .order('week_start', { ascending: false });

      if (data) {
        setEntries(data as RewardEntry[]);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  const getWeekStart = () => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));
    return monday.toISOString().slice(0, 10);
  };

  const weekStart = getWeekStart();
  const currentWeekEntry = entries.find((e) => e.week_start === weekStart);

  const totalMonthlyUnlocks = entries.reduce((sum, e) => sum + e.monthly_unlocks, 0);
  const activeCreativeHours = entries
    .filter((e) => {
      if (!e.weekly_unlocked_at || !e.weekly_expires_at) return false;
      const expiresAt = new Date(e.weekly_expires_at);
      return expiresAt > new Date() && !e.weekly_claimed_at;
    })
    .length * 2;

  return (
    <div className="w-full max-w-xl mb-10">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="font-mono text-xs uppercase tracking-widest text-stone-500 mb-3"
      >
        {open ? '▾' : '▸'} Reward Ledger
      </button>

      {open && !loading && (
        <div className="space-y-4">
          {/* Stats */}
          <div className="space-y-2">
            <div className="font-mono text-xs text-stone-400">
              Active Creative Time: <span className="text-stone-200">{activeCreativeHours} hours</span>
            </div>
            <div className="font-mono text-xs text-stone-400">
              Total $50 Unlocks: <span className="text-stone-200">{totalMonthlyUnlocks}</span>
            </div>
          </div>

          {/* Current week */}
          <div className="pt-4 border-t border-stone-800">
            <div className="font-mono text-xs uppercase tracking-widest text-stone-500 mb-2">
              This Week ({weekStart})
            </div>
            {currentWeekEntry && currentWeekEntry.weekly_unlocked_at ? (
              <div className="font-mono text-xs text-stone-300">
                ✓ Unlocked 2 hours creative time
                {currentWeekEntry.weekly_claimed_at && (
                  <span className="text-stone-500 ml-2">(claimed)</span>
                )}
              </div>
            ) : (
              <div className="font-mono text-xs text-stone-500">
                Hit 4 days this week to unlock 2 hours creative time
              </div>
            )}
          </div>

          {/* History */}
          {entries.length > 0 && (
            <div className="pt-4 border-t border-stone-800">
              <div className="font-mono text-xs uppercase tracking-widest text-stone-500 mb-3">
                History
              </div>
              <div className="space-y-2">
                {entries.map((entry) => (
                  <div key={entry.id} className="font-mono text-xs text-stone-400">
                    Week of {entry.week_start}
                    {entry.weekly_unlocked_at && (
                      <span className="text-stone-300 ml-2">
                        • 2 hrs {entry.weekly_claimed_at ? '✓ claimed' : '(expires ' + new Date(entry.weekly_expires_at!).toLocaleDateString() + ')'}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {open && loading && (
        <div className="text-stone-500 font-mono text-xs">loading...</div>
      )}
    </div>
  );
}