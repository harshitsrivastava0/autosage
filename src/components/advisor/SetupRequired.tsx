export function SetupRequired() {
  return (
    <div className="max-w-lg mx-auto px-4 py-16 text-center space-y-6">
      <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center text-3xl mx-auto">🔑</div>
      <div>
        <h2 className="text-xl font-bold text-brand-navy mb-2">API key required</h2>
        <p className="text-sm text-gray-500">AutoSage needs an Anthropic API key to generate personalised recommendations.</p>
      </div>
      <div className="bg-gray-900 rounded-xl p-4 text-left">
        <p className="text-xs text-gray-400 mb-2 font-mono">1. Create .env.local in the project root:</p>
        <code className="text-green-400 text-sm font-mono block">ANTHROPIC_API_KEY=sk-ant-...</code>
        <p className="text-xs text-gray-400 mt-3 mb-2 font-mono">2. Restart the dev server:</p>
        <code className="text-green-400 text-sm font-mono block">npm run dev</code>
      </div>
      <p className="text-xs text-gray-400">
        Get your API key at{" "}
        <span className="text-brand-blue">console.anthropic.com</span>
      </p>
    </div>
  );
}
