'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

const TOTAL = 5800;
const STEP = 50;

export default function FreedomTracker() {
  const [paid, setPaid] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase
        .from('freedom_payments')
        .select('increment_index')
        .eq('paid', true);
      if (data) {
        setPaid(new Set(data.map((r) => r.increment_index)));
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const toggle = async (i: number) => {
    const allFilled = Array.from({ length: i + 1 }, (_, idx) => idx).every(idx => paid.has(idx));
    const next = new Set(paid);
    
    if (allFilled) {
      // clicking the last filled box unfills it and everything after
      for (let idx = i; idx < TOTAL; idx++) {
        next.delete(idx);
      }
    } else {
      // fill everything up to and including i
      for (let idx = 0; idx <= i; idx++) {
        next.add(idx);
      }
    }
  
    setPaid(next);
  
    const toUpsert = Array.from(next).map(idx => ({ increment_index: idx, paid: true }));
    await supabase.from('freedom_payments').delete().neq('increment_index', -1);
    await supabase.from('freedom_payments').upsert(toUpsert);
  };

  const paidAmt = paid.size * STEP;
  const pct = ((paid.size / TOTAL) * 100).toFixed(1);

  if (loading) return <div className="text-stone-500 font-mono text-xs mb-8">loading...</div>;

  return (
    <div className="w-full max-w-xl mb-10">
      <div className="font-mono text-xs uppercase tracking-widest text-stone-500 mb-2">Freedom Date</div>
      <div className="w-full h-2 bg-stone-800 rounded-full mb-3">
        <div className="h-2 rounded-full" style={{ width: pct + '%', backgroundColor: '#6495ED' }} />
      </div>
      <div className="flex justify-between font-mono text-xs text-stone-400 mb-4">
        <span>${paidAmt.toLocaleString()} paid</span>
        <span>{pct}% free</span>
      </div>
      <div className="flex flex-wrap gap-1">
        {Array.from({ length: TOTAL }, (_, i) => (
          <button
            key={i}
            onClick={() => toggle(i)}
            className="w-2 h-2 rounded-sm"
            style={{ backgroundColor: paid.has(i) ? '#6495ED' : '#292524', border: '1px solid', borderColor: paid.has(i) ? '#6495ED' : '#44403c' }}
            title={'$' + ((i + 1) * STEP)}
          />
        ))}
      </div>
    </div>
  );
}