export function SpotFilters() {
  return (
    <div className="glass rounded-2xl p-4">
      <h3 className="font-semibold">Filters</h3>
      <div className="mt-3 grid gap-2 text-sm">
        <label><input type="checkbox" /> Quiet</label>
        <label><input type="checkbox" /> Outlets</label>
        <label><input type="checkbox" /> Open now</label>
      </div>
    </div>
  );
}
