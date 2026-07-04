'use client';

import { useEffect, useState } from 'react';

import { supabase } from '@/lib/supabase';

const DAYS = 30;

const HABITS = [
  { id: 'sn', label: 'Safety Never' },
  { id: 'move', label: 'Movement' },
  { id: 'li', label: 'LinkedIn' },
  { id: 'ai', label: 'AI Learning' },
];

// state -> cell color, matching the main grid's language
const STATE_STYLES: Record<number, { bg: string; border: string }> = {
  0: { bg: '#1c1917', border: '#292524' }, // None
  1: { bg: '#44403c', border: '#44403c' }, // Rest
  2: { bg: '#1c1917', border: '#6495ED' }, // Floor
  3: { bg: '#6495ED', border: '#6495ED' }, // Full
};

export default function HabitHistory() {
  const [open, setOpen] = useState(false);
  const [entries, setEntries] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch the last 6 week_start values' worth of rows —
      // more than enough to cover any 30-day window.
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - (DAYS + 7));
      const cutoffStr = cutoff.toISOString().slice(0, 10);

      const { data } = await supabase
        .from('habit_entries')
        .select('week_start, habit_id, day_index, state')
        .gte('week_start', cutoffStr);

      if (data) {
        const map: Record<string, number> = {};
        for (const row of data) {
          // Real date = week_start + day_index days
          const d = new Date(row.week_start + 'T00:00:00');
          d.setDate(d.getDate() + row.day_index);
          const dateStr = d.toISOString().slice(0, 10);
          map[row.habit_id + '|' + dateStr] = row.state;
        }
        setEntries(map);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  // Build the list of the last 30 dates, oldest first
  const dates: string[] = [];
  for (let i = DAYS - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().slice(0, 10));
  }

  return (
    <div className="w-full max-w-xl mb-10">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="font-mono text-xs uppercase tracking-widest text-stone-500 mb-3"
      >
        {open ? '▾' : '▸'} History — last {DAYS} days
      </button>

      {open && !loading && (
        <div className="space-y-3">
          {HABITS.map((habit) => (
            <div key={habit.id}>
              <div className="font-mono text-xs text-stone-400 mb-1">{habit.label}</div>
              <div className="flex gap-1 flex-wrap">
                {dates.map((date) => {
                  const state = entries[habit.id + '|' + date] ?? 0;
                  const style = STATE_STYLES[state];
                  return (
                    <div
                      key={date}
                      className="w-2 h-2 rounded-sm"
                      style={{
                        backgroundColor: style.bg,
                        border: '1px solid',
                        borderColor: style.border,
                      }}
                      title={date}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {open && loading && (
        <div className="text-stone-500 font-mono text-xs">loading...</div>
      )}
    </div>
  );
}