'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const HABITS = [
  { id: 'sn', name: 'Biggest Rock', target: 7 },
  { id: 'move', name: 'Movement', target: 7 },
  { id: 'li', name: 'LinkedIn', target: 7 },
  { id: 'ai', name: 'AI Learning', target: 5 },
];

const DAY_LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

function getWeekStart() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toISOString().split('T')[0];
}

export default function HabitGrid() {
  const weekStart = getWeekStart();
  const [cells, setCells] = useState(
    Object.fromEntries(HABITS.map(h => [h.id, [0, 0, 0, 0, 0, 0, 0]]))
  );
  const [subtitles, setSubtitles] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      // Load habit entries
      const { data: entries, error: entriesError } = await supabase
        .from('habit_entries')
        .select('*')
        .eq('week_start', weekStart);

      if (entriesError) { console.error(JSON.stringify(entriesError)); setLoading(false); return; }

      if (entries && entries.length > 0) {
        const loaded = Object.fromEntries(HABITS.map(h => [h.id, [0, 0, 0, 0, 0, 0, 0]]));
        entries.forEach(row => {
          if (loaded[row.habit_id]) {
            loaded[row.habit_id][row.day_index] = row.state;
          }
        });
        setCells(loaded);
      }

      // Load subtitles - get most recent for each habit
      const { data: subtitleData, error: subtitleError } = await supabase
        .from('habit_subtitles')
        .select('*')
        .in('habit_id', HABITS.map(h => h.id))
        .order('created_at', { ascending: false });

      if (!subtitleError && subtitleData) {
        const latestSubtitles: Record<string, string> = {};
        const seenHabits = new Set<string>();
        
        subtitleData.forEach(row => {
          if (!seenHabits.has(row.habit_id)) {
            latestSubtitles[row.habit_id] = row.subtitle_text;
            seenHabits.add(row.habit_id);
          }
        });
        
        setSubtitles(latestSubtitles);
      }

      setLoading(false);
    }
    loadData();
  }, [weekStart]);

  async function cycleDot(habitId: string, dayIdx: number) {
    const newState = (cells[habitId][dayIdx] + 1) % 4;

    setCells(prev => {
      const updated = { ...prev };
      updated[habitId] = [...prev[habitId]];
      updated[habitId][dayIdx] = newState;
      return updated;
    });

    const { data: existing } = await supabase
      .from('habit_entries')
      .select('id')
      .eq('week_start', weekStart)
      .eq('habit_id', habitId)
      .eq('day_index', dayIdx)
      .limit(1)
      .then(({ data }) => ({ data: data?.[0] ?? null }));

    if (existing) {
      await supabase
        .from('habit_entries')
        .update({ state: newState })
        .eq('id', existing.id);
    } else {
      await supabase
        .from('habit_entries')
        .insert({ week_start: weekStart, habit_id: habitId, day_index: dayIdx, state: newState });
    }
  }

  async function updateSubtitle(habitId: string, newText: string) {
    setSubtitles(prev => ({ ...prev, [habitId]: newText }));

    // Save to Supabase
    const { error } = await supabase
      .from('habit_subtitles')
      .insert({ habit_id: habitId, subtitle_text: newText });

    if (error) {
      console.error('Error saving subtitle:', JSON.stringify(error));
    }
  }

  if (loading) return <div className="text-stone-500 font-mono text-xs mt-8">loading...</div>;

  return (
    <div className="w-full max-w-xl space-y-6 mt-8">
      {HABITS.map(h => (
        <div key={h.id}>
          <div className="flex items-baseline justify-between mb-2">
            <div className="flex-1">
              <div className="text-lg font-serif text-stone-100">{h.name}</div>
              <input
                type="text"
                value={subtitles[h.id] || ''}
                onChange={e => updateSubtitle(h.id, e.target.value)}
                placeholder="Add a subtitle..."
                className="text-xs italic text-stone-500 bg-transparent border-b border-stone-700 focus:border-stone-500 focus:outline-none w-full mt-1 placeholder-stone-700"
              />
            </div>
            <div className="font-mono text-xs text-stone-500 ml-4 whitespace-nowrap">
              {cells[h.id].filter(d => d === 1 || d === 2).length}/{h.target}
            </div>
          </div>
          <div className="grid grid-cols-7 gap-2">
            {DAY_LETTERS.map((letter, i) => {
              const state = cells[h.id][i];
              return (
                <button
                  key={i}
                  onClick={() => cycleDot(h.id, i)}
                  className="aspect-square rounded-sm border border-stone-700 flex items-center justify-center hover:border-stone-400 active:scale-95 transition-all relative"
                  title={`${letter} — tap to cycle`}
                >
                  {state === 0 && <div className="w-1 h-1 rounded-full bg-stone-700" />}
                  {state === 1 && <div className="absolute inset-0.5 rounded-sm" style={{ backgroundColor: '#6495ED' }} />}
                  {state === 2 && <div className="absolute inset-0.5 rounded-sm border-2" style={{ borderColor: '#6495ED' }} />}
                  {state === 3 && <div className="font-mono text-3xl text-stone-500 leading-none">–</div>}
                </button>
              );
            })}
          </div>
          <div className="grid grid-cols-7 gap-2 mt-1">
            {DAY_LETTERS.map((l, i) => (
              <div key={i} className="text-center font-mono text-[10px] text-stone-600 uppercase">
                {l}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}