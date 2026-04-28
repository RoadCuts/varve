'use client';

import { useState } from 'react';

const HABITS = [
  { id: 'sn', name: 'Safety Never', target: 7, identity: 'A complexity translator.' },
  { id: 'move', name: 'Movement', target: 7, identity: 'A body that supports the work.' },
  { id: 'li', name: 'LinkedIn', target: 7, identity: 'A public thinker.' },
  { id: 'ai', name: 'AI Learning', target: 5, identity: 'A builder who keeps pace.' },
];

const DAY_LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

// 0=empty, 1=full, 2=floor, 3=rest
export default function HabitGrid() {
  const [cells, setCells] = useState(
    Object.fromEntries(HABITS.map(h => [h.id, [0, 0, 0, 0, 0, 0, 0]]))
  );

  function cycleDot(habitId: string, dayIdx: number) {
    setCells(prev => {
      const updated = { ...prev };
      updated[habitId] = [...prev[habitId]];
      updated[habitId][dayIdx] = (updated[habitId][dayIdx] + 1) % 4;
      return updated;
    });
  }

  return (
    <div className="w-full max-w-xl space-y-6 mt-8">
      {HABITS.map(h => (
        <div key={h.id}>
          <div className="flex items-baseline justify-between mb-2">
            <div>
              <div className="text-lg font-serif text-stone-100">{h.name}</div>
              <div className="text-xs italic text-stone-500">{h.identity}</div>
            </div>
            <div className="font-mono text-xs text-stone-500">
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
                  {state === 3 && <div className="font-mono text-3xl text-stone-500 leading-none">-</div>}
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