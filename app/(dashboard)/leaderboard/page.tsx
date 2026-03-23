export default function LeaderboardPage() {
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Leaderboard</h1>
      <div className="glass rounded-2xl p-4">
        <ol className="space-y-2">
          <li>#1 Alex · 1234 pts</li>
          <li>#2 Jordan · 1104 pts</li>
          <li className="rounded bg-blue-500/20 p-2">#8 You · 650 pts</li>
        </ol>
      </div>
    </section>
  );
}
