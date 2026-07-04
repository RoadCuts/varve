'use client';

import { useEffect, useState } from 'react';

import { supabase } from '@/lib/supabase';

const TOTAL = 5800;
const STEP = 50;

export default function FreedomTracker() {
  const [paidCount, setPaidCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase
        .from('freedom_state')
        .select('paid_count')
        .eq('id', 1)
        .single();

      if (data) {
        setPaidCount(data.paid_count);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  const toggle = async (i: number) => {
    let newCount: number;
    
    if (i < paidCount) {
      newCount = i;
    } else {
      newCount = i + 1;
    }
    
    setPaidCount(newCount);
    
    await supabase
      .from('freedom_state')
      .update({ paid_count: newCount })
      .eq('id', 1);
  };

  const paidAmt = paidCount * STEP;
  const pct = ((paidCount / TOTAL) * 100).toFixed(1);

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
            type="button"
            key={i}
            onClick={() => toggle(i)}
            className="w-2 h-2 rounded-sm"
            style={{
              backgroundColor: i < paidCount ? '#6495ED' : '#292524',
              border: '1px solid',
              borderColor: i < paidCount ? '#6495ED' : '#44403c'
            }}
            title={'$' + ((i + 1) * STEP)}
          />
        ))}
      </div>
    </div>
  );
}