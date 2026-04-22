export default function Home() {
  return (
    <main className="min-h-screen bg-stone-950 text-stone-100 flex items-center justify-center p-8">
      <div className="max-w-xl">
        <div className="font-mono text-xs uppercase tracking-[0.3em] text-stone-500 mb-6">
          varve
        </div>
        <h1 className="text-5xl font-serif mb-4 leading-tight">
          Incremental work that sediments into a full roadcut over time.
        </h1>
        <p className="text-stone-400 text-lg mb-8 italic">
          A practice ledger.
        </p>
        <ul className="space-y-2 text-stone-300">
          <li>— A writer who ships.</li>
          <li>— A body that supports the work.</li>
          <li>— A complexity translater.</li>
          <li>— A builder who keeps pace.</li>
          <li>— A person who owns their home outright.</li>
        </ul>
      </div>
    </main>
  );
}