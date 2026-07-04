'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

const SECTIONS = [
  {
    id: 'quick_scan',
    label: 'Quick Scan',
    placeholder: 'Your 3 wins, friction points, time chunk patterns...',
  },
  {
    id: 'data_review',
    label: 'Data Review',
    placeholder: 'MVPs, blockers, energy peaks and drains...',
  },
  {
    id: 'patterns_insights',
    label: 'Patterns + Insights',
    placeholder: 'Emerging patterns, skill practice, big rocks...',
  },
  {
    id: 'adjustments',
    label: 'Adjustments',
    placeholder: 'Small tweaks, skill to highlight, tasks to drop...',
  },
  {
    id: 'close_out',
    label: 'Close Out',
    placeholder: 'One-sentence learning, gratitude...',
  },
];

interface Reflection {
  id: number;
  week_start: string;
  quick_scan: string | null;
  data_review: string | null;
  patterns_insights: string | null;
  adjustments: string | null;
  close_out: string | null;
}

export default function WeeklyReflection() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});
  const [past, setPast] = useState<Reflection[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Get this week's Monday
  const getWeekStart = () => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));
    return monday.toISOString().slice(0, 10);
  };

  useEffect(() => {
    const fetchPastReflections = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('weekly_reflections')
        .select('*')
        .order('week_start', { ascending: false });
      if (data) {
        setPast(data);
      }
      setLoading(false);
    };

    fetchPastReflections();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const weekStart = getWeekStart();

    // Check if this week's reflection already exists
    const { data: existing } = await supabase
      .from('weekly_reflections')
      .select('id')
      .eq('week_start', weekStart)
      .maybeSingle();

    if (existing) {
      // Update existing
      await supabase
        .from('weekly_reflections')
        .update(form)
        .eq('id', existing.id);
    } else {
      // Insert new
      await supabase.from('weekly_reflections').insert({
        week_start: weekStart,
        ...form,
      });
    }

    // Refresh past reflections and clear form
    const { data } = await supabase
      .from('weekly_reflections')
      .select('*')
      .order('week_start', { ascending: false });
    if (data) {
      setPast(data);
    }
    setForm({});
    setSaving(false);
  };

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const weekStart = getWeekStart();

  return (
    <div className="w-full max-w-xl mb-10">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="font-mono text-xs uppercase tracking-widest text-stone-500 mb-3"
      >
        {open ? '▾' : '▸'} Weekly Reflection
      </button>

      {open && (
        <div className="space-y-4">
          {/* Form for this week */}
          <div className="space-y-4">
            {SECTIONS.map((section) => (
              <div key={section.id}>
                <label className="block font-mono text-xs text-stone-400 mb-2">
                  {section.label}
                </label>
                <textarea
                  value={form[section.id] || ''}
                  onChange={(e) => handleChange(section.id, e.target.value)}
                  placeholder={section.placeholder}
                  className="w-full bg-stone-900 border border-stone-700 rounded p-2 font-mono text-sm text-stone-200 placeholder-stone-600 focus:border-stone-500 focus:outline-none"
                  rows={3}
                />
              </div>
            ))}
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="font-mono text-xs uppercase tracking-widest text-stone-400 hover:text-stone-200 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Reflection'}
            </button>
          </div>

          {/* Past Reflections */}
          {!loading && past.length > 0 && (
            <div className="mt-8 pt-6 border-t border-stone-800">
              <div className="font-mono text-xs uppercase tracking-widest text-stone-500 mb-4">
                Past Reflections
              </div>
              <div className="space-y-8">
                {past.map((reflection) => (
                  <div key={reflection.id} className="pb-6 border-b border-stone-800">
                    <div className="font-mono text-xs text-stone-500 mb-3">
                      Week of {reflection.week_start}
                    </div>
                    <div className="space-y-3">
                      {SECTIONS.map((section) => {
                        const content = reflection[section.id as keyof Reflection];
                        return content ? (
                          <div key={section.id}>
                            <div className="font-mono text-xs text-stone-400 mb-1">
                              {section.label}
                            </div>
                            <p className="text-xs text-stone-300 whitespace-pre-wrap">
                              {content}
                            </p>
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {loading && (
            <div className="text-stone-500 font-mono text-xs">loading...</div>
          )}
        </div>
      )}
    </div>
  );
}